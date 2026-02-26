import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

const features = [
  {
    icon: "scan" as const,
    title: "AI Recipe Scanner",
    description:
      "Snap a photo of any cookbook page or paste a URL — our AI extracts ingredients, steps, and timing instantly.",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: "billing" as const,
    title: "Smart Pantry",
    description:
      "Track every ingredient with quantities, expiration dates, and low-stock alerts. Scan barcodes to add items.",
    color: "text-kitchen bg-kitchen/10",
  },
  {
    icon: "calendar" as const,
    title: "Meal Planner",
    description:
      "Drag and drop recipes into your weekly calendar. Hit 'Surprise Me' to auto-fill slots from your pantry.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: "listChecks" as const,
    title: "Shopping Lists",
    description:
      "Auto-generated from your meal plan minus what's in stock. Sorted by aisle for efficient shopping trips.",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: "utensils" as const,
    title: "Cooking Mode",
    description:
      "Distraction-free step-by-step view with wake lock, built-in timers, and voice control support.",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    icon: "users" as const,
    title: "Household Sync",
    description:
      "Share recipes, pantry, and shopping lists with your partner. Real-time updates across all devices.",
    color: "text-cyan-500 bg-cyan-500/10",
  },
]

const steps = [
  {
    number: "01",
    icon: "scan" as const,
    title: "Scan & Save",
    description: "Upload a recipe photo, paste a URL, or type it in manually.",
  },
  {
    number: "02",
    icon: "calendar" as const,
    title: "Plan Your Week",
    description: "Drag recipes into meal slots and generate your shopping list.",
  },
  {
    number: "03",
    icon: "chefHat" as const,
    title: "Cook & Enjoy",
    description: "Follow step-by-step instructions with hands-free cooking mode.",
  },
]

export default function IndexPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-kitchen/5 via-background to-blue-500/5 dark:from-kitchen/10 dark:via-background dark:to-blue-500/10" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative flex max-w-6xl flex-col items-center gap-8 pb-16 pt-20 text-center md:pb-24 md:pt-32 lg:pb-32 lg:pt-40">
          {/* Badge */}
          <div className="animate-fade-in-up flex items-center gap-2 rounded-full border border-kitchen/20 bg-kitchen/5 px-4 py-1.5 text-sm font-medium text-kitchen dark:border-kitchen/30 dark:bg-kitchen/10">
            <Icons.sparkles className="size-4" />
            Powered by Gemini AI
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your Kitchen,{" "}
            <span className="bg-gradient-to-r from-kitchen to-emerald-400 bg-clip-text text-transparent">
              Orchestrated.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-8">
            The AI-powered operating system for your kitchen. Digitize recipes
            with a snap, track your pantry in real time, and plan meals
            effortlessly — all in one place.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "animate-pulse-glow bg-kitchen px-8 text-white hover:bg-kitchen/90"
              )}
            >
              Get Started Free
              <Icons.arrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-8"
              )}
            >
              See Features
            </Link>
          </div>

          {/* Floating food badges */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <span className="animate-float absolute left-[10%] top-[20%] text-4xl">
              🥘
            </span>
            <span className="animate-float-delayed absolute right-[12%] top-[18%] text-3xl">
              🥑
            </span>
            <span className="animate-float-slow absolute left-[8%] bottom-[22%] text-3xl">
              🧀
            </span>
            <span className="animate-float-delayed absolute right-[10%] bottom-[25%] text-4xl">
              🍳
            </span>
            <span className="animate-float absolute left-[22%] top-[12%] text-2xl">
              🌿
            </span>
            <span className="animate-float-slow absolute right-[20%] top-[10%] text-2xl">
              🍅
            </span>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section
        id="features"
        className="container space-y-12 py-16 md:py-24 lg:py-32"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-tight sm:text-4xl md:text-5xl">
            Everything your kitchen needs
          </h2>
          <p className="max-w-xl text-muted-foreground sm:text-lg">
            A complete suite of intelligent tools designed for the modern home
            cook. From recipe ingestion to grocery checkout.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = Icons[feature.icon]
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:border-kitchen/30 hover:shadow-lg hover:shadow-kitchen/5"
              >
                <div
                  className={cn(
                    "mb-4 inline-flex rounded-lg p-2.5",
                    feature.color
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="mb-2 font-heading text-lg">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Hover glow */}
                <div className="absolute -bottom-1 -right-1 size-24 rounded-full bg-kitchen/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="border-y bg-muted/30 py-16 md:py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-tight sm:text-4xl md:text-5xl">
              Simple as{" "}
              <span className="text-kitchen">1 — 2 — 3</span>
            </h2>
            <p className="max-w-xl text-muted-foreground sm:text-lg">
              From a photo of a recipe to a cooked meal — in three easy steps.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3 md:gap-4">
            {steps.map((step, index) => {
              const Icon = Icons[step.icon]
              return (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  {/* Connector line (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[calc(50%+40px)] top-10 hidden h-[2px] w-[calc(100%-80px)] bg-gradient-to-r from-kitchen/40 to-kitchen/10 md:block" />
                  )}

                  {/* Number circle */}
                  <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl border-2 border-kitchen/20 bg-kitchen/5 transition-colors duration-300 hover:border-kitchen/40 hover:bg-kitchen/10">
                    <Icon className="size-8 text-kitchen" />
                    <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-kitchen text-xs font-bold text-white">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mb-2 font-heading text-xl">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="container py-16 md:py-24 lg:py-32">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-kitchen via-emerald-600 to-teal-600 p-10 text-center text-white shadow-2xl shadow-kitchen/20 md:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="size-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative space-y-6">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl">
              Start cooking smarter today
            </h2>
            <p className="mx-auto max-w-lg text-lg text-white/80">
              Join CookWise and transform how you manage recipes, stock your
              pantry, and plan your meals. Free and open source.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white px-8 text-kitchen hover:bg-white/90"
                )}
              >
                Create Your Kitchen
                <Icons.arrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/30 bg-transparent px-8 text-white hover:bg-white/10"
                )}
              >
                <Icons.gitHub className="mr-2 size-4" />
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Open Source ─────────────────────────────────────── */}
      <section className="border-t py-16 md:py-24">
        <div className="container mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Icons.gitHub className="size-4" />
            Open Source
          </div>
          <h2 className="font-heading text-3xl leading-tight sm:text-4xl">
            Community Driven
          </h2>
          <p className="max-w-lg text-muted-foreground sm:text-lg">
            CookWise is fully open source and self-hostable. Deploy with Docker,
            own your data, and contribute on{" "}
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-kitchen underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
