import Image from "next/image";

export function PrideLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm"
      style={{ width: size, height: size }}
    >
      <Image
        src="/lgbt-favicon.png"
        alt="Logo IDT-LGBT Bahia"
        width={size}
        height={size}
        className="size-full object-contain"
        priority
      />
    </span>
  );
}
