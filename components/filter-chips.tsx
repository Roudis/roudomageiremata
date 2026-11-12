import type { ReactNode } from "react";

// Category chips are the main filter, in the purple of actions. Tag chips are smaller
// and green, so they read as a second, lighter filter under the categories.
const tones = {
  category: {
    size: "gap-2 px-3.5 py-1.5 text-sm",
    idle: "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
    pressed: "border-primary bg-primary text-primary-foreground",
  },
  tag: {
    size: "h-8 px-3 text-xs",
    idle: "border-border text-muted-foreground hover:border-secondary/50 hover:text-secondary",
    pressed: "border-secondary bg-secondary text-secondary-foreground",
  },
};

type FilterChipProps = {
  tone: keyof typeof tones;
  /** Whether this chip's filter is the one applied; announced through aria-pressed. */
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
};

/** One choice in the recipe list's category or tag filter. */
export function FilterChip({ tone, pressed, onClick, children }: FilterChipProps) {
  const { size, idle, pressed: pressedClasses } = tones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-medium transition-colors focus-ring-offset ${size} ${pressed ? pressedClasses : idle}`}
    >
      {children}
    </button>
  );
}

type ChipRowProps = {
  /** Names the group for screen readers. */
  label?: string;
  children: ReactNode;
};

/** A row of chips: one scrolling line on phones, wrapped on wider screens. */
export function ChipRow({ label, children }: ChipRowProps) {
  return (
    <div
      role={label === undefined ? undefined : "group"}
      aria-label={label}
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}
