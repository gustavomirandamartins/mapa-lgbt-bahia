"use client";

import React, { useState, useEffect, useRef } from 'react';

// shared hook for intersection observer to trigger animations when elements scroll into view
export function useInView(ref: React.RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!ref.current || hasTriggered) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setHasTriggered(true);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [ref, hasTriggered]);

  return inView;
}

export interface ProgressRingProps {
  value: number;       // 0-100
  size?: number;       // default 120
  strokeWidth?: number; // default 10
  color?: string;      // default #10b981
  label?: string;      // text below number
}

export function ProgressRing({ value, size = 120, strokeWidth = 10, color = "#10b981", label }: ProgressRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  const displayValue = inView ? value : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayValue / 100) * circumference;

  return (
    <div ref={ref} className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e6f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-gray-800">{displayValue.toFixed(0)}%</span>
        {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
      </div>
    </div>
  );
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number; // default 180
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ segments, size = 180, centerLabel, centerValue }: DonutChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  const arcs = segments.reduce<Array<DonutSegment & { arcLength: number; offset: number; percentage: number }>>(
    (acc, seg) => {
      const percentage = total === 0 ? 0 : seg.value / total;
      const arcLength = percentage * circumference;
      const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].arcLength : 0;
      acc.push({ ...seg, arcLength, offset: prevOffset, percentage });
      return acc;
    },
    []
  );

  return (
    <div ref={ref} className="flex flex-col items-center justify-center w-full">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e6f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${inView ? arc.arcLength : 0} ${circumference}`}
              strokeDashoffset={-arc.offset}
              fill="none"
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue && <span className="text-2xl font-bold text-gray-800">{centerValue}</span>}
          {centerLabel && <span className="text-sm text-gray-500">{centerLabel}</span>}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></span>
            <span className="text-xs text-gray-600 font-medium">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface BarItem {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

export interface HorizontalBarChartProps {
  bars: BarItem[];
  maxBars?: number; // max bars to show, default all
}

const prideColors = ["#ff453a", "#ff9f0a", "#ffd60a", "#34c759", "#0a84ff", "#bf5af2"];

export function HorizontalBarChart({ bars, maxBars }: HorizontalBarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  const displayBars = maxBars ? bars.slice(0, maxBars) : bars;

  return (
    <div ref={ref} className="w-full space-y-4">
      {displayBars.map((bar, i) => {
        const color = bar.color || prideColors[i % prideColors.length];
        const percentage = bar.maxValue === 0 ? 0 : (bar.value / bar.maxValue) * 100;
        
        return (
          <div key={i} className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700">{bar.label}</span>
              <span className="text-gray-900">{bar.value} <span className="text-gray-400 text-xs font-normal">/ {bar.maxValue}</span></span>
            </div>
            <div className="h-3 w-full rounded-full bg-[#e2e6f0] shadow-[inset_2px_2px_4px_rgba(175,188,212,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: inView ? `${percentage}%` : '0%',
                  backgroundColor: color,
                  transition: `width 0.8s ease-out ${i * 0.1}s`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface CountUpProps {
  end: number;
  duration?: number; // ms, default 1500
  suffix?: string;   // e.g. "%", "/417"
  className?: string;
}

function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

export function CountUp({ end, duration = 1500, suffix = "", className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setValue(Math.floor(end * easeOutQuart(percentage)));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    };

    animationFrame = requestAnimationFrame(tick);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {value}{suffix}
    </span>
  );
}

export interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  total?: number;
  label: string;
  color: string;
  suffix?: string;
}

export function StatCard({ icon, value, total, label, color, suffix = "" }: StatCardProps) {
  // Add alpha (0.15) to hex color for background
  const hexToRgba = (hex: string, alpha: number) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7 || hex.length === 9) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bgColor = color.startsWith('#') ? hexToRgba(color, 0.15) : undefined;
  const displaySuffix = total ? ` / ${total}` : suffix;

  return (
    <div className="neuro-card rounded-2xl p-5 flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-[inset_2px_2px_4px_rgba(175,188,212,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
        style={{ backgroundColor: bgColor, color: color }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <CountUp 
          end={value} 
          suffix={displaySuffix}
          className="text-2xl font-bold text-gray-800" 
        />
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
    </div>
  );
}
