import {
  OperationType,
  Category,
  TransactionStatus,
  Currency,
  type TransactionSort,
  type TransactionFilter,
  type TransactionPagination,
  type PaginatedResult,
  type TransactionSummaryQuery,
  type TransactionSummary,
  type CreateTransaction,
} from "@expense-tracker/core";
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

  async fetchAll(
    sort?: TransactionSort,
    filter?: TransactionFilter,
    pagination?: TransactionPagination,
    signal?: AbortSignal
  ): Promise<PaginatedResult<Transaction>> {
    const { data } = await this.http.get<PaginatedResult<Transaction>>(
      this.path,
      { params: { ...sort, ...filter, ...pagination }, signal }
    );
    return data;
  }

  async fetchSummary(
    query: TransactionSummaryQuery,
    signal?: AbortSignal
  ): Promise<TransactionSummary> {
    const { data } = await this.http.get<TransactionSummary>(
      `${this.path}/summary`,
      { params: query, signal }
    );
    return data;
  }

  async create(data: CreateTransaction): Promise<Transaction> {
    const { data: transaction } = await this.http.post<Transaction>(
      this.path,
      data
    );
    return transaction;
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`${this.path}/${id}`);
  }
}

export const transactionsApi = new TransactionsApi();
