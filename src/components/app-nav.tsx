"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Dumbbell,
  LayoutDashboard,
  Library,
  Menu,
  ScrollText,
  User,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Прогресс", icon: LayoutDashboard },
  { href: "/workouts", label: "Тренировки", icon: Dumbbell },
  { href: "/nutrition", label: "Питание", icon: UtensilsCrossed },
  { href: "/knowledge", label: "База знаний", icon: BookOpen },
  { href: "/references", label: "Справочники", icon: Library },
  { href: "/users", label: "Пользователи", icon: Users },
  { href: "/logs", label: "Логи", icon: ScrollText, adminOnly: true },
  { href: "/profile", label: "Личный кабинет", icon: User },
];

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
  className,
  isAdmin,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
  isAdmin: boolean;
}) {
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Основная навигация">
      {visibleItems.map(({ href, label, icon: Icon }) => {
        const active = isNavActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "gym-nav-active"
                : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin } = useAuthUser();

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-3 py-3 backdrop-blur-md md:hidden">
        <Link href="/dashboard" className="group flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Dumbbell className="size-4 text-primary" strokeWidth={2.5} />
          </span>
          <span className="truncate font-heading text-xl font-normal uppercase tracking-widest">
            Gym<span className="text-primary">Mate</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Открыть меню"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Закрыть меню"
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-background/95 backdrop-blur-md transition-transform duration-200 md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0 md:bg-background/80",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
          <Link
            href="/dashboard"
            className="group flex min-w-0 items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Dumbbell className="size-5 text-primary" strokeWidth={2.5} />
            </span>
            <span className="truncate font-heading text-xl font-normal uppercase tracking-widest">
              Gym<span className="text-primary">Mate</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="Закрыть меню"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          <NavLinks
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            isAdmin={isAdmin}
          />
        </div>

        <div className="border-t border-border/60 px-3 py-4">
          <LogoutButton className="w-full justify-start text-muted-foreground hover:text-foreground" />
        </div>
      </aside>
    </>
  );
}
