import Image from "next/image";

const ICON_URL =
  "https://rajnaphdzifhxvezhuuh.supabase.co/storage/v1/object/public/icons/icon.png";

export function PrideLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image
        src={ICON_URL}
        alt="Logo Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal"
        width={size}
        height={size}
        className="size-full object-contain"
        unoptimized
        priority
      />
    </span>
  );
}
