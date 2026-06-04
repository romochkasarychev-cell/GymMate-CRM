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
  User,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Прогресс", icon: LayoutDashboard },
  { href: "/workouts", label: "Тренировки", icon: Dumbbell },
  { href: "/nutrition", label: "Питание", icon: UtensilsCrossed },
  { href: "/knowledge", label: "База знаний", icon: BookOpen },
  { href: "/references", label: "Справочники", icon: Library },
  { href: "/users", label: "Пользователи", icon: Users },
  { href: "/profile", label: "Личный кабинет", icon: User },
];

const primaryMobileNav = navItems.slice(0, 4);
const moreMobileNav = navItems.slice(4);

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreMobileNav.some((item) => isNavActive(pathname, item.href));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <Link href="/dashboard" className="group flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30 sm:size-9">
              <Dumbbell className="size-4 text-primary sm:size-5" strokeWidth={2.5} />
            </span>
            <span className="truncate font-heading text-xl font-normal uppercase tracking-widest sm:text-2xl">
              Gym<span className="text-primary">Mate</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <nav className="flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isNavActive(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "gym-nav-active"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <LogoutButton />
          </div>

          <nav
            className="hidden items-center gap-1 overflow-x-auto md:flex lg:hidden"
            aria-label="Навигация планшет"
          >
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                    active
                      ? "gym-nav-active"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="max-w-[4.5rem] truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {moreOpen ? (
        <button
          type="button"
          aria-label="Закрыть меню"
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-[1px] md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
        aria-label="Мобильная навигация"
      >
        {moreOpen ? (
          <div className="border-b border-border/60 bg-card/95 px-3 py-2">
            <div className="mx-auto grid max-w-5xl gap-1">
              {moreMobileNav.map(({ href, label, icon: Icon }) => {
                const active = isNavActive(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      active
                        ? "gym-nav-active"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mx-auto grid max-w-5xl grid-cols-5 px-1 py-1">
          {primaryMobileNav.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium leading-tight",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "drop-shadow-[0_0_8px_var(--gym-glow)]")} />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium leading-tight",
              moreActive || moreOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-expanded={moreOpen}
            aria-label="Ещё разделы"
          >
            {moreOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            <span>Ещё</span>
          </button>
        </div>
      </nav>
    </>
  );
}

