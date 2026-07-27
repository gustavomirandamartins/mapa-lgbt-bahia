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
 * Card com borda em gradiente e brilho aurora rosa-choque que segue o mouse.
 * Adaptado do padrão AuroraCard para a estética clara (glass) do projeto.
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
          "group relative overflow-hidden bg-gradient-to-r from-fuchsia-500/70 via-pink-500/70 to-violet-500/70 p-[1.5px]",
          "shadow-[0_0_18px_-6px_rgba(255,20,147,0.35)] transition-shadow duration-300 hover:shadow-[0_0_32px_-4px_rgba(255,20,147,0.6)]",
          className
        )}
        {...props}
      >
        {/* Brilho aurora que segue o cursor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,20,147,0.28), transparent 75%)",
          }}
        />
        <div className={cn("relative z-10", innerClassName)}>{children}</div>
      </div>
    );
  }
);
AuroraCard.displayName = "AuroraCard";
