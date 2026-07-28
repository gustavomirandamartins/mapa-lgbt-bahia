"use client";

import { useActionState, useState } from "react";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";

import { alterarSenha, type AlterarSenhaState } from "@/lib/actions/auth";

const initialState: AlterarSenhaState = { error: null, sucesso: null };

export function AlterarSenhaForm() {
  const [state, formAction, pending] = useActionState(alterarSenha, initialState);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <Lock className="size-5 text-neutral-400" aria-hidden />
          <input
            name="password"
            type={mostrarSenha ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Nova senha (mín. 8 caracteres)"
            className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            className="text-neutral-400 transition-colors hover:text-neutral-700 focus:outline-none"
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

        <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <Lock className="size-5 text-neutral-400" aria-hidden />
          <input
            name="confirmPassword"
            type={mostrarConfirmacao ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Confirmar nova senha"
            className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmacao((v) => !v)}
            className="text-neutral-400 transition-colors hover:text-neutral-700 focus:outline-none"
            title={mostrarConfirmacao ? "Ocultar senha" : "Ver senha"}
            aria-label={mostrarConfirmacao ? "Ocultar senha" : "Ver senha"}
          >
            {mostrarConfirmacao ? (
              <EyeOff className="size-5" aria-hidden />
            ) : (
              <Eye className="size-5" aria-hidden />
            )}
          </button>
        </label>
      </div>

      {state.error && (
        <p className="animate-fade-in rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      {state.sucesso && (
        <p className="animate-fade-in rounded-2xl bg-green-500/10 px-4 py-3 text-sm font-medium text-green-700">
          {state.sucesso}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="pride-gradient inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <KeyRound className="size-4" aria-hidden />
          {pending ? "Atualizando…" : "Alterar Senha"}
        </button>
      </div>
    </form>
  );
}
