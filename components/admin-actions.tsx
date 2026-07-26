"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface AdminActionsProps {
  onAprovar: () => Promise<{ error: string | null; sucesso?: string | null }>;
  onRejeitar: () => Promise<{ error: string | null; sucesso?: string | null }>;
  compact?: boolean;
}

/** Par de botões Aprovar/Rejeitar usado no painel admin. */
export function AdminActions({ onAprovar, onRejeitar, compact }: AdminActionsProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function executar(acao: () => Promise<{ error: string | null }>) {
    setFeedback(null);
    startTransition(async () => {
      const resultado = await acao();
      if (resultado.error) setFeedback(resultado.error);
    });
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-2"}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => executar(onAprovar)}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2 text-xs font-bold text-white shadow transition-transform active:scale-95 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Check className="size-3.5" aria-hidden />
          )}
          Aprovar
        </button>
        <button
          onClick={() => executar(onRejeitar)}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-red-500/90 px-3.5 py-2 text-xs font-bold text-white shadow transition-transform active:scale-95 disabled:opacity-50"
        >
          <X className="size-3.5" aria-hidden />
          Rejeitar
        </button>
      </div>
      {feedback && (
        <p className="animate-fade-in text-xs font-medium text-red-600">{feedback}</p>
      )}
    </div>
  );
}
