import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Monitor, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
  { value: "system", icon: Monitor, label: "System theme" },
];

export function ThemeToggle({ className }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex h-9 items-center rounded-md border border-border bg-muted/50 p-1",
          className
        )}
        aria-hidden
      >
        <div className="size-7 shrink-0 rounded-sm bg-muted" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-border bg-muted/50 p-1 gap-0.5",
        className
      )}
      role="group"
      aria-label="Color theme"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.value}
            type="button"
            variant="ghost"
            className={cn(
              "size-7 shrink-0 rounded-sm p-0",
              theme === tab.value && "bg-background text-foreground shadow-sm"
            )}
            onClick={() => setTheme(tab.value)}
            aria-label={tab.label}
            aria-pressed={theme === tab.value}
          >
            <Icon className="size-4" aria-hidden />
          </Button>
        );
      })}
    </div>
  );
}
