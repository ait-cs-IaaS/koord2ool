import SurveyModel from "../store/survey.model";
import { ResponseModel } from "../store/response.model";
import { QuestionModel } from "../store/question.model";
import QuestionPropertyModel from "../store/question_property.model";
import { ParticipantModel, ParticipantError } from "../store/participant.model";
import router from "../router";
import { koordStore } from "../store";

// https://api.limesurvey.org/classes/remotecontrol_handle.html

type Auth = string | { status: string };

export class LimesurveyApi {
  username?: string;
  session?: string;

  private nextId = 1;

  constructor(private readonly endpoint = import.meta.env.VITE_APP_LIMESURVEY_API) {
    console.debug(`LimeSurvey API endpoint: ${endpoint}`);
    if (typeof endpoint === "undefined") {
      throw new Error("LimeSurvey API endpoint not configured");
    }
    if (!/\/admin\/remotecontrol$/.test(endpoint)) {
      console.warn(
        `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something ending in "/admin/remotecontrol"`
      );
      throw new Error("LimeSurvey API endpoint not configured");
    }
  }

  async authenticate(
    username: string,
    password: string
  ): Promise<string | undefined> {
    const session = await this.call<Auth>(
      "get_session_key",
      false,
      username,
      password
    );
    if (session && typeof session === "string") {
      this.session = session;
      this.username = username;
      return session;
    } else if (typeof session === "object") {
      throw new Error(session.status);
    }
    return undefined;
  }

  async listSurveys(): Promise<SurveyModel[]> {
    return this.call("list_surveys");
  }

  async exportStatistics(sid: number): Promise<Blob> {
    const b64Content = await this.call<string>("export_statistics", true, sid);
    const byteCharacters = atob(b64Content);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: "application/pdf" });
  }

  async getQuestions(sid: number): Promise<QuestionModel[]> {
    return this.call("list_questions", true, sid);
  }

  async getQuestionProperties(qid: number): Promise<QuestionPropertyModel> {
    return this.call("get_question_properties", true, qid);
  }

  async getResponses(
    sid: number,
    headingType = "code"
  ): Promise<ResponseModel[]> {
    const data = await this.call(
      "export_responses",
      true,
      sid,
      "json",
      "en",
      "complete",
      headingType,
      "long"
    );
    if (typeof data === "string") {
      const asObj = JSON.parse(atob(data));
      if (Array.isArray(asObj.responses)) {
        const responsesByToken = new Map<number, Array<ResponseModel>>();
        for (const response of asObj.responses) {
          const token = response.token;
          const entry = {
            ...response,
          };
          const entries = responsesByToken.get(token);
          if (typeof entries !== "undefined") {
            entries.push(entry);
          } else {
            responsesByToken.set(token, [entry]);
          }
        }
        for (const token of responsesByToken.keys()) {
          const responses = responsesByToken.get(token);
          if (typeof responses === "undefined") {
            throw new Error("Found a token that magically disappeared?");
          }
          responsesByToken.set(token, responses);
        }

        return Array.from(responsesByToken.values()).flat();
      }
    }
    return [];
  }

  isParticipantsError(
    o: ParticipantModel[] | ParticipantError
  ): o is ParticipantError {
    return "status" in o;
  }

  async getParticipants(sid: number): Promise<ParticipantModel[]> {
    const participants = await this.call<ParticipantModel[] | ParticipantError>(
      "list_participants",
      true,
      sid
    );
    if (this.isParticipantsError(participants)) {
      return [];
    }
    return participants;
  }

  private restoreSession(): boolean {
    const store = koordStore()
    if (store.limesurvey === undefined) {
      console.error("Failed to restore state.");
      return false;
    }
    const username = store.limesurvey.username;
    const session = store.limesurvey.session;
    if (username === undefined || session === undefined) {
      console.error("No Session Key found.");
      return false;
    }
    this.username = username;
    this.session = session;
    console.debug("Session restored.");
    return true;
  }

  private requireAuth(): void {
    if (typeof this.session === "undefined") {
      if (this.restoreSession()) {
        return;
      }
      throw new Error("LimeSurvey API not authenticated");
    }
  }

  private checkResult(result: Record<string, string>): void {
    const store = koordStore()

    if (result.status !== undefined) {
      if (result.status === "Invalid session key") {
        this.session = undefined;
        this.username = undefined;
        store.limesurvey = undefined;
        store.error = new Error("Invalid session Key redirected to login");
        console.debug(`Invalid session Key redirected to login`);
        router.push({ name: "login" });
      }
    }
  }

  private async call<T = unknown>(
    rpcMethod: string,
    authenticated = true,
    ...params: unknown[]
  ): Promise<T> {
    console.debug(`Calling ${rpcMethod}`);
    const store = koordStore()

    if (authenticated) {
      this.requireAuth();
      params = [this.session, ...params];
    }
    const response = await fetch(this.endpoint!, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: rpcMethod,
        params,
        id: this.nextId++,
      }),
    });
    if (!response.ok) {
      const error = new Error(`Calling ${rpcMethod} failed`);
      store.error = error;
      throw error;
    }
    const { result, error } = await response.json();
    if (error) {
      store.error = new Error(error);
      throw new Error(error);
    }
    this.checkResult(result);
    return result;
  }
}
