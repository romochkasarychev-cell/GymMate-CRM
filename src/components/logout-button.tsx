"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isApiEnabled } from "@/lib/gymmate-api";
import { resetGymmateStoreCache } from "@/hooks/use-gymmate-store";

export function LogoutButton() {
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
      className="hidden text-muted-foreground hover:text-foreground lg:inline-flex"
      onClick={() => void handleLogout()}
    >
      <LogOut className="size-4" />
      Выйти
    </Button>
  );
}
