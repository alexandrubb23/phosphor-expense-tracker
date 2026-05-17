import axios, { type AxiosInstance } from "axios";

export abstract class Http {
  protected readonly http: AxiosInstance = axios.create({
    withCredentials: true,
  });
}
