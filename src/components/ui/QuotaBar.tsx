interface QuotaBarProps {
  questionsUsed: number;
  maxQuestions: number;
}

export function QuotaBar({ questionsUsed, maxQuestions }: QuotaBarProps) {
  const questionsLeft = maxQuestions - questionsUsed;
  const percentage = (questionsUsed / maxQuestions) * 100;

  // Color changes as quota runs out
  const barColor =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 70
        ? "bg-yellow-500"
        : "bg-blue-500";

  return (
    <div className="px-4 py-2 border-t border-border">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">
          Questions remaining
        </span>
        <span className="text-xs font-medium text-foreground">
          {questionsLeft} / {maxQuestions}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
