import axios, { type AxiosInstance } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export abstract class Http {
  protected readonly http: AxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });
}
