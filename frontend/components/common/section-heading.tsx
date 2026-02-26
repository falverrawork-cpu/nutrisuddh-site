export function SectionHeading({
  title,
  subtitle,
  align = "left"
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-gray-600 sm:text-base">{subtitle}</p>}
    </div>
  );
}
