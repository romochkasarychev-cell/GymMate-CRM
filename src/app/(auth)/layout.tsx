export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gym-bg gym-grid flex min-h-full flex-1 items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}
