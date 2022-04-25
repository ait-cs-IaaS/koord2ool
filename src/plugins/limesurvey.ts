export class LimesurveyApi {
  private session?: string;
  private nextId = 1;

  constructor(private readonly endpoint = process.env.VUE_APP_LIMESURVEY_API) {}

  async authenticate(username: string, password: string): Promise<boolean> {
    this.session = await this.call("get_session_key", username, password);
    return false;
  }

  async listSurveys(): Promise<any[]> {
    return this.call("list_surveys");
  }

  private async call<T = unknown>(
    rpcMethod: string,
    ...params: unknown[]
  ): Promise<T> {
    console.debug(`Calling ${rpcMethod}`);
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
