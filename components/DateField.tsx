// The native calendar-picker-indicator icon is stretched to cover just the
// icon's usual footprint (not the whole input) and hidden, so clicking the
// icon still opens the picker while the rest of the field stays keyboard-editable.
const inputClass =
  "relative w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 pr-9 text-sm text-zinc-900 outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-50";

export default function DateField({
  id,
  name,
  required,
}: {
  id: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input id={id} name={name} type="date" required={required} className={inputClass} />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    </div>
  );
}
