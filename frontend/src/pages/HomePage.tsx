import { useSession } from "../lib/auth-client";
import { useIsAdmin } from "../hooks/useIsAdmin";
import {
  useTransactions,
  useDeleteTransaction,
} from "../hooks/useTransactions";
import Masthead from "../components/ui/Masthead";
import NavButton from "../components/ui/NavButton";
import SectionHead from "../components/ui/SectionHead";
import SignOutButton from "../components/auth/SignOutButton";
import Summary from "../components/transactions/Summary";
import SpendingByCategory from "../components/transactions/SpendingByCategory";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import HealthStatus from "../components/ui/HealthStatus";
import { NewTransaction, CATEGORIES } from "../types";

export default function HomePage() {
  const { data: session } = useSession();
  const { data: transactions = [], isLoading, isError } = useTransactions();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  const addTransaction = (_transaction: NewTransaction) => {
    // TODO: wire up POST /api/transactions when manual entry is implemented
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

      {isError && (
        <p className="mb-6 border border-red bg-panel px-4 py-3 font-mono text-[12px] uppercase tracking-widest text-red">
          ⚠ FAILED TO LOAD TRANSACTIONS
        </p>
      )}

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
            isLoading ? (
              "LOADING…"
            ) : (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_rgba(77,255,170,0.4)]" />
                {transactions.length} REC
              </>
            )
          }
        />
        <TransactionList
          transactions={transactions}
          onDelete={deleteTransaction}
        />
      </section>

      <HealthStatus />
    </div>
  );
}
