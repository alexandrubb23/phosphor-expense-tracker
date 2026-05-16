import SpendingByCategoryChart from "./SpendingByCategoryChart";

function SpendingByCategory() {
  return (
    <div className="relative border border-hairline bg-panel px-6 pt-6 pb-2">
      <span className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border border-cyan-dim border-r-0 border-b-0" />
      <span className="pointer-events-none absolute -right-px -bottom-px h-2.5 w-2.5 border border-cyan-dim border-l-0 border-t-0" />
      <SpendingByCategoryChart />
    </div>
  );
}

export default SpendingByCategory;
