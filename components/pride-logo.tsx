export function PrideLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="pride-gradient inline-flex shrink-0 items-center justify-center rounded-2xl shadow-lg"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
      </svg>
    </span>
  );
}
