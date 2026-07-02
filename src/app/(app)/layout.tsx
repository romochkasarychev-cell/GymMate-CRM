import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gym-bg gym-grid flex min-h-full flex-1 flex-col md:flex-row">
      <AppNav />
      <main className="flex min-h-full min-w-0 flex-1 flex-col">
        <div className="flex-1 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
