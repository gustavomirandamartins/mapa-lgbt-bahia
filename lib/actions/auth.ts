"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error: string | null;
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  revalidatePath("/", "layout");
  redirect("/painel");
}

export async function cadastrar(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const municipioId = Number(formData.get("municipio_id") ?? 0);

  if (!nome || !email || !password || !municipioId) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();

  // Garante que o município existe e ainda não tem gestor aprovado.
  const { data: municipio } = await supabase
    .from("municipios")
    .select("id")
    .eq("id", municipioId)
    .single();
  if (!municipio) {
    return { error: "Município inválido." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, municipio_id: municipioId },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este e-mail já está cadastrado. Faça login." };
    }
    return { error: `Não foi possível concluir o cadastro: ${error.message}` };
  }

  // Se a confirmação de e-mail estiver desativada, já existe sessão.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/painel");
  }

  return { error: null };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export interface AlterarSenhaState {
  error: string | null;
  sucesso?: string | null;
}

export async function alterarSenha(
  _prevState: AlterarSenhaState,
  formData: FormData
): Promise<AlterarSenhaState> {
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!password || !confirmPassword) {
    return { error: "Preencha a nova senha e a confirmação." };
  }
  if (password.length < 8) {
    return { error: "A nova senha deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: `Erro ao alterar a senha: ${error.message}` };
  }

  return { error: null, sucesso: "Senha atualizada com sucesso!" };
}

