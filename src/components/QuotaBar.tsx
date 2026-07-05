"use client";

interface QuotaBarProps {
  questionsUsed: number;
  maxQuestions: number;
}

export function QuotaBar({ questionsUsed, maxQuestions }: QuotaBarProps) {
  const questionsLeft = maxQuestions - questionsUsed;
  const fraction = questionsLeft / maxQuestions;

  // Color shifts as the quota runs out
  const ringColor =
    questionsLeft <= 2
      ? "text-red-500"
      : questionsLeft <= 6
        ? "text-yellow-500"
        : "text-emerald-500";

  const radius = 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="flex items-center gap-1.5 shrink-0 select-none"
      title={`${questionsLeft} of ${maxQuestions} questions remaining`}
    >
      <svg width="30" height="30" viewBox="0 0 30 30" className="-rotate-90">
        {/* Track */}
        <circle
          cx="15"
          cy="15"
          r={radius}
          fill="none"
          strokeWidth="3.5"
          className="stroke-muted"
        />
        {/* Remaining quota */}
        <circle
          cx="15"
          cy="15"
          r={radius}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className={`${ringColor} transition-all duration-500`}
        />
      </svg>
      <span className="text-sm font-medium text-muted-foreground tabular-nums whitespace-nowrap">
        {questionsLeft}
      </span>
    </div>
  );
}
