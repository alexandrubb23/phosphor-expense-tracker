import { Http } from "./http";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
  createdAt: string;
}

class UsersApi extends Http {
  async fetchUsers(): Promise<User[]> {
    const { data } = await this.http.get<{ users: User[] }>("/api/admin/users");
    return data.users;
  }
}

export const usersApi = new UsersApi();
