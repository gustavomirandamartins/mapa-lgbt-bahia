import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal",
    short_name: "Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal",
    description:
      "Plataforma de Mapeamento do Turismo LGBTQIAPN+ dos municípios da Bahia (SETUR-BA).",
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
