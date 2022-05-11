import moment from "moment";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";
import QuestionModel from "@/store/question.model";

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

  async getResponses(sid: number): Promise<undefined | ResponseModel[]> {
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
        const lastResponses = new Map<string, moment.Moment>();
        const ary: ResponseModel[] = asObj.responses
          .map((response: ResponseModel) => {
            if (
              typeof response.TIME === "undefined" &&
              typeof response.submitdate === "string"
            ) {
              // inject TIME if unset
              response.TIME = response.submitdate;
            }
            return response;
          })
          .sort(
            (a: ResponseModel, b: ResponseModel) =>
              moment(a.TIME).valueOf() - moment(b.TIME).valueOf()
          );
        ary.forEach(({ token, TIME }) => {
          lastResponses.set(token, moment(TIME));
        });
        console.debug(lastResponses);
        return ary.map((response: ResponseModel) => {
          const lastResponse = lastResponses.get(response.token);
          if (typeof lastResponse !== "undefined") {
            response.$stale = lastResponse.isBefore(moment(response.TIME))
              ? "1"
              : "0";
          }
          return response;
        });
      }
    }
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
