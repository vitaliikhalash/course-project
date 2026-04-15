interface ModalHeaderProps {
  id?: string;
  title: string;
  subtitle?: string;
}
export const ModalHeader = ({ id, title, subtitle }: ModalHeaderProps) => (
  <div className="flex flex-col items-start gap-2 self-stretch text-center">
    <h2
      id={id}
      className="leading-prose m-0 self-stretch text-2xl font-semibold tracking-[-0.02em]"
    >
      {title}
    </h2>
    {subtitle && (
      <p className="leading-prose text-ink-strong m-0 self-stretch text-sm">
        {subtitle}
      </p>
    )}
  </div>
);
