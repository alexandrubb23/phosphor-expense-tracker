import { useState } from "react";
import { useSession } from "../lib/auth-client";
import { useIsAdmin } from "../hooks/useIsAdmin";
import Masthead from "../components/ui/Masthead";
import NavButton from "../components/ui/NavButton";
import SectionHead from "../components/ui/SectionHead";
import SignOutButton from "../components/auth/SignOutButton";
import Summary from "../components/transactions/Summary";
import SpendingByCategory from "../components/transactions/SpendingByCategory";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import HealthStatus from "../components/ui/HealthStatus";
import { Transaction, NewTransaction, CATEGORIES } from "../types";

let nextId = 9;

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: "Salary",
    amount: 5000,
    type: "income",
    category: "salary",
    date: "2025-01-01",
  },
  {
    id: 2,
    description: "Rent",
    amount: 1200,
    type: "expense",
    category: "housing",
    date: "2025-01-02",
  },
  {
    id: 3,
    description: "Groceries",
    amount: 150,
    type: "expense",
    category: "food",
    date: "2025-01-03",
  },
  {
    id: 4,
    description: "Freelance Work",
    amount: 800,
    type: "income",
    category: "salary",
    date: "2025-01-05",
  },
  {
    id: 5,
    description: "Electric Bill",
    amount: 95,
    type: "expense",
    category: "utilities",
    date: "2025-01-06",
  },
  {
    id: 6,
    description: "Dinner Out",
    amount: 65,
    type: "expense",
    category: "food",
    date: "2025-01-07",
  },
  {
    id: 7,
    description: "Gas",
    amount: 45,
    type: "expense",
    category: "transport",
    date: "2025-01-08",
  },
  {
    id: 8,
    description: "Netflix",
    amount: 15,
    type: "expense",
    category: "entertainment",
    date: "2025-01-10",
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const addTransaction = (transaction: NewTransaction) => {
    setTransactions((prev) => [...prev, { ...transaction, id: nextId++ }]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const operatorName = session?.user?.name?.toUpperCase() ?? "OPERATOR";
  const isAdmin = useIsAdmin();

  return (
    <div className="relative mx-auto max-w-295 px-10 pt-8 pb-30 max-sm:px-4.5 max-sm:pt-5.5 max-sm:pb-20">
      <Masthead
        sectorLabel="OPERATOR"
        sectorAccent={operatorName}
        actions={
          <div className="flex items-center gap-2.5">
            {isAdmin && <NavButton to="/users">USERS</NavButton>}
            <SignOutButton />
          </div>
        }
      />

      <Summary transactions={transactions} />

      <section className="mb-17 opacity-0 animate-fade-up [animation-delay:0.5s]">
        <SectionHead
          eyebrow="02 / 04"
          title="Expenditure Distribution"
          status={
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_rgba(77,255,170,0.4)]" />{" "}
              LIVE
            </>
          }
        />
        <SpendingByCategory transactions={transactions} />
      </section>

      <section className="mb-17 opacity-0 animate-fade-up [animation-delay:0.65s]">
        <SectionHead
          eyebrow="03 / 04"
          title="Manual Log Entry"
          status="INPUT READY"
        />
        <TransactionForm categories={[...CATEGORIES]} onAdd={addTransaction} />
      </section>

      <section className="mb-17 opacity-0 animate-fade-up [animation-delay:0.8s]">
        <SectionHead
          eyebrow="04 / 04"
          title="Transaction Archive"
          status={
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_rgba(77,255,170,0.4)]" />
              {transactions.length} REC
            </>
          }
        />
        <TransactionList
          transactions={transactions}
          categories={[...CATEGORIES]}
          onDelete={deleteTransaction}
        />
      </section>

      <HealthStatus />
    </div>
  );
}
