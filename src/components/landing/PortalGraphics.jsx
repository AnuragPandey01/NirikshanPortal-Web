/**
 * Decorative graphics for public pages — uses theme CSS variables.
 */
export function AuthPageBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -top-1/2 left-1/2 h-[120%] w-[140%] -translate-x-1/2 rounded-[100%] bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-[min(560px,75vh)] w-[min(560px,75vw)] translate-x-1/4 translate-y-1/4 rounded-full bg-chart-2/25 blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2] [mask-image:linear-gradient(to_bottom,black_35%,transparent)]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}

export function HeroIllustration({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="niri-hero-grad"
          x1="80"
          y1="40"
          x2="440"
          y2="360"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--chart-2)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="niri-screen" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--primary)" stopOpacity="0.1" />
          <stop offset="1" stopColor="var(--chart-3)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect
        x="48"
        y="56"
        width="320"
        height="220"
        rx="16"
        stroke="currentColor"
        strokeOpacity="0.18"
        fill="url(#niri-screen)"
        className="text-foreground"
      />
      <path
        d="M80 200 L120 160 L168 188 L220 120 L280 200"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      <circle cx="120" cy="160" r="5" fill="var(--primary)" />
      <circle cx="168" cy="188" r="5" fill="var(--chart-2)" />
      <circle cx="220" cy="120" r="5" fill="var(--chart-3)" />
      <circle cx="280" cy="200" r="5" fill="var(--primary)" />
      <rect
        x="72"
        y="72"
        width="88"
        height="10"
        rx="4"
        fill="var(--primary)"
        fillOpacity="0.22"
      />
      <rect
        x="72"
        y="92"
        width="140"
        height="6"
        rx="3"
        className="fill-muted-foreground"
        fillOpacity="0.2"
      />
      <rect
        x="380"
        y="100"
        width="120"
        height="140"
        rx="12"
        stroke="currentColor"
        strokeOpacity="0.14"
        fill="var(--card)"
        fillOpacity="0.95"
        className="text-foreground"
      />
      <rect
        x="396"
        y="116"
        width="88"
        height="48"
        rx="6"
        fill="var(--primary)"
        fillOpacity="0.12"
      />
      <path
        d="M404 148 L428 132 L452 156 L468 128"
        stroke="var(--chart-2)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <rect
        x="396"
        y="176"
        width="56"
        height="5"
        rx="2"
        className="fill-muted-foreground"
        fillOpacity="0.15"
      />
      <rect
        x="396"
        y="188"
        width="72"
        height="5"
        rx="2"
        className="fill-muted-foreground"
        fillOpacity="0.12"
      />
      <ellipse
        cx="260"
        cy="320"
        rx="180"
        ry="28"
        fill="url(#niri-hero-grad)"
        opacity="0.55"
      />
      <circle
        cx="260"
        cy="300"
        r="120"
        stroke="var(--primary)"
        strokeOpacity="0.14"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M260 300 L260 220 A80 80 0 0 1 330 260"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <rect
        x="32"
        y="248"
        width="96"
        height="72"
        rx="10"
        stroke="currentColor"
        strokeOpacity="0.12"
        fill="var(--card)"
        fillOpacity="0.88"
        className="text-foreground"
      />
      <circle cx="56" cy="272" r="10" fill="var(--primary)" fillOpacity="0.28" />
      <rect
        x="72"
        y="264"
        width="44"
        height="6"
        rx="2"
        className="fill-muted-foreground"
        fillOpacity="0.2"
      />
      <rect
        x="48"
        y="286"
        width="64"
        height="4"
        rx="2"
        className="fill-muted-foreground"
        fillOpacity="0.12"
      />
      <rect
        x="48"
        y="296"
        width="48"
        height="4"
        rx="2"
        className="fill-muted-foreground"
        fillOpacity="0.1"
      />
    </svg>
  );
}
