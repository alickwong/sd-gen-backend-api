export interface SdAuthRequest extends Request {
  jwt: string;
  userId: string;
}