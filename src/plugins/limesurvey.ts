import moment from "moment";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";
import QuestionModel from "@/store/question.model";
import { ParticipantModel } from "@/store/participant.model";
import { pairwise } from "@/helpers/pairwise";

// https://api.limesurvey.org/classes/remotecontrol_handle.html

type Auth = string | { status: string };

export class LimesurveyApi {
  username?: string;
  session?: string;

  private nextId = 1;

  constructor(private readonly endpoint = process.env.VUE_APP_LIMESURVEY_API) {
    if (!/\/admin\/remotecontrol$/.test(endpoint)) {
      console.warn(
        `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something ending in "/admin/remotecontrol"`
      );
    }
  }

  async authenticate(username: string, password: string): Promise<boolean> {
    const session = await this.call<Auth>(
      "get_session_key",
      false,
      username,
      password
    );
    if (session && typeof session === "string") {
      this.session = session;
      this.username = username;
      return true;
    } else if (typeof session === "object") {
      throw new Error(session.status);
    }
    return false;
  }

  async listSurveys(): Promise<SurveyModel[]> {
    return this.call("list_surveys");
  }

  async getQuestions(sid: number): Promise<QuestionModel[]> {
    return this.call("list_questions", true, sid);
  }

  async getResponses(sid: number): Promise<ResponseModel[]> {
    const data = await this.call(
      "export_responses",
      true,
      sid,
      "json",
      "en",
      "complete"
    );
    if (typeof data === "string") {
      const asObj = JSON.parse(atob(data));
      if (Array.isArray(asObj.responses)) {
        const responsesByToken = new Map<
          number,
          Array<ResponseModel & { $time: moment.Moment }>
        >();
        for (const response of asObj.responses) {
          const token = response.token;
          const entry = {
            ...response,
            $time: moment(response.TIME || response.submitdate),
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
          responses.sort((a, b) => a.$time.diff(b.$time));
          for (const [previous, current] of pairwise(responses)) {
            previous.$validUntil = current.$time.toISOString();
          }
          responsesByToken.set(token, responses);
        }

        return Array.from(responsesByToken.values()).flat();
      }
    }
    return [];
  }

  async getParticipants(sid: number): Promise<ParticipantModel[]> {
    return this.call<ParticipantModel[]>("list_participants", true, sid);
  }

  private requireAuth(): void {
    if (typeof this.session === "undefined") {
      throw new Error("LimeSurvey API not authenticated");
    }
  }

  private async call<T = unknown>(
    rpcMethod: string,
    authenticated = true,
    ...params: unknown[]
  ): Promise<T> {
    console.debug(`Calling ${rpcMethod}`);
    if (authenticated) {
      this.requireAuth();
      params = [this.session, ...params];
    }
    const response = await fetch(this.endpoint, {
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
      throw new Error(`Calling ${rpcMethod} failed`);
    }
    const { result, error } = await response.json();
    if (error) {
      throw new Error(error);
    }
    return result;
  }
}
