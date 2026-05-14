import { Http } from "./http";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
  createdAt: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

class UsersApi extends Http {
  private readonly path = "/api/admin/users";

  async fetchUsers(): Promise<User[]> {
    const { data } = await this.http.get<{ users: User[] }>(this.path);
    return data.users;
  }

  async createUser(newUser: NewUser): Promise<User> {
    const { data } = await this.http.post<{ user: User }>(this.path, newUser);
    return data.user;
  }
}

export const usersApi = new UsersApi();
