"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAuthUser, isApiEnabled } from "@/lib/gymmate-api";

export type AuthUserInfo = {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: "USER" | "ADMIN";
};

export function useAuthUser() {
  const [user, setUser] = useState<AuthUserInfo | null>(null);
  const [loading, setLoading] = useState(isApiEnabled());

  const load = useCallback(async () => {
    if (!isApiEnabled()) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await fetchAuthUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    user,
    loading,
    isAdmin: user?.role === "ADMIN",
    reload: load,
  };
}
