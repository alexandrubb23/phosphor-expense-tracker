import { useSession } from "../lib/auth-client";
import { useIsAdmin } from "../hooks/useIsAdmin";
import Masthead from "../components/ui/Masthead";
import NavButton from "../components/ui/NavButton";
import SectionHead from "../components/ui/SectionHead";
import SignOutButton from "../components/auth/SignOutButton";
import Summary from "../components/transactions/Summary";
import SpendingByCategory from "../components/transactions/SpendingByCategory";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionsTable from "../components/transactions/TransactionsTable";
import HealthStatus from "../components/ui/HealthStatus";
import { NewTransaction, CATEGORIES } from "../types";
import { TransactionsFilterProvider } from "../context/TransactionsFilterContext";

export default function HomePage() {
  const { data: session } = useSession();

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

      <Summary />

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
        <SpendingByCategory />
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
          status="LIVE"
        />
        <TransactionsFilterProvider>
          <TransactionFilters />
          <TransactionsTable />
        </TransactionsFilterProvider>
      </section>

      <HealthStatus />
    </div>
  );
}
