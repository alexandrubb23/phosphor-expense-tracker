import { OperationType, Category, TransactionStatus, Currency, type TransactionSort } from "@expense-tracker/core";
import { Http } from "./http";

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: string; // Prisma Decimal serialises to string
  operationType: OperationType;
  category: Category;
  subcategory: string | null;
  currency: Currency;
  status: TransactionStatus;
  date: string;
  rawEmailBody: string | null;
  createdAt: string;
  updatedAt: string;
}

class TransactionsApi extends Http {
  private readonly path = "/api/transactions";

  async fetchAll(sort?: TransactionSort): Promise<Transaction[]> {
    const { data } = await this.http.get<Transaction[]>(this.path, {
      params: sort,
    });
    return data;
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`${this.path}/${id}`);
  }
}

export const transactionsApi = new TransactionsApi();
