"use client";

import { useEffect, useState } from "react";
import { getScoreGrade } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showGrade?: boolean;
  delay?: number;
}

function scoreToStrokeColor(score: number): string {
  if (score >= 80) return "#3fb950";
  if (score >= 60) return "#d29922";
  if (score >= 40) return "#db6d28";
  return "#f85149";
}

function scoreToTextClass(score: number): string {
  if (score >= 80) return "text-[var(--success)]";
  if (score >= 60) return "text-[var(--warning)]";
  if (score >= 40) return "text-orange-500";
  return "text-[var(--danger)]";
}

export function ScoreRing({
  score,
  size = 140,
  strokeWidth = 8,
  label,
  showGrade = true,
  delay = 200,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const strokeColor = scoreToStrokeColor(score);
  const textClass = scoreToTextClass(score);
  const grade = getScoreGrade(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90 overflow-visible"
        >
          {/* Background track — crisp neutral line */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            opacity={0.5}
          />
          {/* Active progress — solid color, no glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-3xl font-mono ${textClass}`}>
            {animatedScore}
          </span>
          {showGrade && (
            <span className="text-xs text-muted-foreground font-medium">
              {grade}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
