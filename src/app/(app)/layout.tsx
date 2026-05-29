import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gym-bg gym-grid flex min-h-full flex-1 flex-col">
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-5 pb-24 sm:px-4 sm:py-8 md:pb-8">
        {children}
      </main>
    </div>
  );
}
