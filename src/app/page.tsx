import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          AI Marketing Agent <Rocket className="text-primary w-8 h-8" />
        </h1>
        <p className="text-lg text-muted-foreground">
          Automate your B2B outreach and secure $500/mo clients.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
          <Button size="lg" className="px-8">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            View Roadmap
          </Button>
        </div>
      </main>
    </div>
  );
}
