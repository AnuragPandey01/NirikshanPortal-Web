import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AuthPageBackdrop,
  HeroIllustration,
} from "@/components/landing/PortalGraphics";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BarChart3,
  Camera,
  FileSearch,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";

const LogoMark = () => (
  <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
    <span className="text-primary-foreground font-bold text-lg">N</span>
  </div>
);

const features = [
  {
    icon: LayoutDashboard,
    title: "Unified dashboard",
    description:
      "See cases, alerts, and activity in one place so your team stays aligned.",
  },
  {
    icon: Camera,
    title: "Surveillance workflows",
    description:
      "Organize footage and investigations with tooling built for field teams.",
  },
  {
    icon: FileSearch,
    title: "Case management",
    description:
      "Track suspects, evidence, and reports without switching between tools.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Monitor performance and outcomes with charts tailored to your operations.",
  },
  {
    icon: Users,
    title: "Organizations",
    description:
      "Invite members, separate admin and member roles, and scale securely.",
  },
  {
    icon: Shield,
    title: "Access you control",
    description:
      "Sign in with Google or email OTP—authentication that fits your policy.",
  },
];

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      <AuthPageBackdrop />
      <header className="border-b border-border bg-card/75 backdrop-blur-md sticky top-0 z-10 supports-[backdrop-filter]:bg-card/65">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-foreground no-underline hover:opacity-90"
          >
            <LogoMark />
            <span className="font-semibold tracking-tight">
              Nirikshan Portal
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-[1] flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-chart-2/[0.07] pointer-events-none" />
          <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_min(42%,420px)] lg:gap-10">
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wider">
                  Operations & investigations
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.65rem] md:leading-[1.12] max-w-2xl">
                  Run surveillance and case work from a single, modern portal.
                </h1>
                <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Nirikshan Portal helps teams coordinate dashboards, cases, and
                  analytics—so you spend less time on admin and more time on
                  outcomes.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link to="/login">Sign in to your workspace</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="#features">Explore features</a>
                  </Button>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/15 via-transparent to-chart-2/20 blur-2xl lg:-inset-6" />
                <HeroIllustration className="relative w-full drop-shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 bg-muted/35 border-b border-border/80"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for teams on the ground
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
              Everything you need to collaborate—from organization setup to
              role-based dashboards.
            </p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.title}
                    className="group rounded-xl border border-border/90 bg-card/90 backdrop-blur-sm p-6 shadow-xs transition-shadow hover:shadow-md hover:border-primary/20"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-chart-2/10 text-primary ring-1 ring-primary/10">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 font-medium tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-border">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.05] to-transparent pointer-events-none" />
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to open your workspace?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Use your existing account or create one in minutes with Google or
              email verification.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link to="/login">Continue to sign in</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-[1] border-t border-border bg-background/80 py-8 text-center text-sm text-muted-foreground backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <span>© {new Date().getFullYear()} Nirikshan Portal</span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <Link
            to="/login"
            className="underline-offset-4 hover:underline text-foreground/80"
          >
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
