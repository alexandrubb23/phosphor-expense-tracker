interface SectionHeadProps {
  eyebrow: string;
  title: string;
  status: React.ReactNode;
}

export default function SectionHead({
  eyebrow,
  title,
  status,
}: SectionHeadProps) {
  return (
    <div className="section-head">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      <span className="section-status">{status}</span>
    </div>
  );
}
