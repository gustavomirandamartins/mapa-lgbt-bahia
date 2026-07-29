"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LogIn, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { login, type AuthFormState } from "@/lib/actions/auth";
import { PrideLogo } from "@/components/pride-logo";

const initialState: AuthFormState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <main className="app-backdrop flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="neuro-card w-full max-w-md rounded-[2.5rem] p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3">
            <PrideLogo size={88} />
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#2c3444]">
            Central de Controle
          </h1>
          <p className="mt-1 text-xs font-semibold text-[#64748b]">
            Índice de Desenvolvimento do Turismo LGBTQIAPN+ · Bahia
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="neuro-inset flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <Mail className="size-5 text-[#64748b]" aria-hidden />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="E-mail"
              className="w-full bg-transparent text-base font-medium text-[#2c3444] outline-none placeholder:text-[#94a3b8]"
            />
          </label>

          <label className="neuro-inset flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <Lock className="size-5 text-[#64748b]" aria-hidden />
            <input
              name="password"
              type={mostrarSenha ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Senha"
              className="w-full bg-transparent text-base font-medium text-[#2c3444] outline-none placeholder:text-[#94a3b8]"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="text-[#64748b] transition-colors hover:text-[#2c3444] focus:outline-none"
              title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
              aria-label={mostrarSenha ? "Ocultar senha" : "Ver senha"}
            >
              {mostrarSenha ? (
                <EyeOff className="size-5" aria-hidden />
              ) : (
                <Eye className="size-5" aria-hidden />
              )}
            </button>
          </label>

          {state.error && (
            <p className="animate-fade-in rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="neuro-pill mt-2 flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-extrabold text-[#2c3444] transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <LogIn className="size-5 text-[#8b5cf6]" aria-hidden />
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-[#64748b]">
          Gestor municipal?{" "}
          <Link href="/cadastro" className="font-bold text-[#8b5cf6] hover:underline">
            Solicite acesso
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="neuro-pill mt-6 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#64748b] transition-transform active:scale-95"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar ao mapa
      </Link>
    </main>
  );
}
