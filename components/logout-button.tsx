"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="glass-soft flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-neutral-600 transition-transform active:scale-95 disabled:opacity-50"
    >
      <LogOut className="size-4" aria-hidden />
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
