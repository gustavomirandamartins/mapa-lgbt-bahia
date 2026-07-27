"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuroraCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Classes do contêiner interno (ex.: "glass rounded-2xl p-4"). */
  innerClassName?: string;
}

/**
 * Card estilo "Liquid Glass": borda de vidro branca e brilho luminoso neutro
 * que segue o mouse. Adaptado do padrão AuroraCard para a estética do projeto.
 */
export const AuroraCard = forwardRef<HTMLDivElement, AuroraCardProps>(
  ({ className, innerClassName, children, ...props }, ref) => {
    function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty(
        "--mouse-x",
        `${event.clientX - rect.left}px`
      );
      event.currentTarget.style.setProperty(
        "--mouse-y",
        `${event.clientY - rect.top}px`
      );
    }

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className={cn(
          "group relative overflow-hidden bg-gradient-to-r from-white/80 via-white/40 to-white/80 p-[1px]",
          "shadow-[0_10px_30px_-12px_rgba(31,41,55,0.25)] transition-shadow duration-300 hover:shadow-[0_16px_44px_-10px_rgba(31,41,55,0.32)]",
          className
        )}
        {...props}
      >
        {/* Brilho luminoso neutro que segue o cursor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.45), transparent 75%)",
          }}
        />
        <div className={cn("relative z-10", innerClassName)}>{children}</div>
      </div>
    );
  }
);
AuroraCard.displayName = "AuroraCard";
