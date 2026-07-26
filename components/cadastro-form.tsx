"use client";

import { useActionState } from "react";
import { UserPlus, Mail, Lock, User, MapPin } from "lucide-react";

import { cadastrar, type AuthFormState } from "@/lib/actions/auth";
import type { Municipio } from "@/lib/auth-guards";

const initialState: AuthFormState = { error: null };

export function CadastroForm({ municipios }: { municipios: Municipio[] }) {
  const [state, formAction, pending] = useActionState(cadastrar, initialState);
  const sucesso = !state.error && pending === false && state !== initialState;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
        <User className="size-5 text-neutral-400" aria-hidden />
        <input
          name="nome"
          type="text"
          required
          autoComplete="name"
          placeholder="Nome completo do gestor(a)"
          className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
        />
      </label>

      <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
        <MapPin className="size-5 text-neutral-400" aria-hidden />
        <select
          name="municipio_id"
          required
          defaultValue=""
          className="w-full bg-transparent text-base outline-none"
        >
          <option value="" disabled>
            Selecione o município
          </option>
          {municipios.map((municipio) => (
            <option key={municipio.id} value={municipio.id}>
              {municipio.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
        <Mail className="size-5 text-neutral-400" aria-hidden />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="E-mail institucional"
          className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
        />
      </label>

      <label className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3.5">
        <Lock className="size-5 text-neutral-400" aria-hidden />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Senha (mín. 8 caracteres)"
          className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
        />
      </label>

      {state.error && (
        <p className="animate-fade-in rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      {sucesso && (
        <p className="animate-fade-in rounded-2xl bg-green-500/10 px-4 py-3 text-sm font-medium text-green-700">
          Cadastro enviado! Confirme seu e-mail (se solicitado) e aguarde a
          aprovação do administrador para responder ao questionário.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="pride-gradient mt-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <UserPlus className="size-5" aria-hidden />
        {pending ? "Enviando…" : "Solicitar acesso"}
      </button>
    </form>
  );
}
