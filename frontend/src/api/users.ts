import { Role } from "@expense-tracker/core";
import { Http } from "./http";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

export interface EditUser {
  name: string;
  email: string;
  password?: string;
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

  async updateUser(id: string, payload: EditUser): Promise<User> {
    const { data } = await this.http.patch<{ user: User }>(
      `${this.path}/${id}`,
      payload
    );
    return data.user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.http.delete(`${this.path}/${id}`);
  }
}

export const usersApi = new UsersApi();
