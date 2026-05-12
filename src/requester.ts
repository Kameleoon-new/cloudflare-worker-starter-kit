import type {
  IExternalRequester,
  KameleoonResponseType,
  RequestType,
  SendRequestParametersType,
} from "@kameleoon/nodejs-sdk";

// Use the Cloudflare Workers Fetch API instead of the Node.js requester.
export class WorkerRequester implements IExternalRequester {
  public async sendRequest<T extends RequestType>({
    url,
    parameters,
  }: SendRequestParametersType<T>): Promise<KameleoonResponseType> {
    return fetch(url, parameters);
  }
}
