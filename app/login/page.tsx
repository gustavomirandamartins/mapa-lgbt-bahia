"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";

import { login, type AuthFormState } from "@/lib/actions/auth";
import { PrideLogo } from "@/components/pride-logo";

const initialState: AuthFormState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="app-backdrop flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="glass-strong w-full max-w-md rounded-[2rem] p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <PrideLogo size={56} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Central de Controle
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Índice de Desenvolvimento do Turismo LGBTQIAPN+ · Bahia
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <Mail className="size-5 text-neutral-400" aria-hidden />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="E-mail"
              className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
            />
          </label>

          <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <Lock className="size-5 text-neutral-400" aria-hidden />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Senha"
              className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
            />
          </label>

          {state.error && (
            <p className="animate-fade-in rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="pride-gradient mt-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <LogIn className="size-5" aria-hidden />
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Gestor municipal?{" "}
          <Link href="/cadastro" className="font-semibold text-violet-600">
            Solicite acesso
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="glass-soft mt-6 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar ao mapa
      </Link>
    </main>
  );
}
