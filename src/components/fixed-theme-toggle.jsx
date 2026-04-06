import { ThemeToggle } from "@/components/theme-toggle";

/** Theme control fixed to the top-right; use on full-screen flows without a header. */
export function FixedThemeToggle() {
  return (
    <div className="fixed right-4 top-4 z-50">
      <ThemeToggle />
    </div>
  );
}
