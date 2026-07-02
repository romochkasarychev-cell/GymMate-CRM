"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isApiEnabled } from "@/lib/gymmate-api";
import { resetGymmateStoreCache } from "@/hooks/use-gymmate-store";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  if (!isApiEnabled()) {
    return null;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    resetGymmateStoreCache();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("inline-flex text-muted-foreground hover:text-foreground", className)}
      onClick={() => void handleLogout()}
    >
      <LogOut className="size-4" />
      Выйти
    </Button>
  );
}
