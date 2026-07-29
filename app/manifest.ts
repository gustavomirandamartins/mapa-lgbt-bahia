import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IDT-LGBT Bahia — Mapa do Turismo LGBTQIAPN+",
    short_name: "IDT Bahia",
    description:
      "Índice de Desenvolvimento do Turismo LGBTQIAPN+ dos municípios da Bahia (SETUR-BA).",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f2f7",
    theme_color: "#eef1f7",
    icons: [
      {
        src: "https://rajnaphdzifhxvezhuuh.supabase.co/storage/v1/object/public/icons/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "https://rajnaphdzifhxvezhuuh.supabase.co/storage/v1/object/public/icons/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
