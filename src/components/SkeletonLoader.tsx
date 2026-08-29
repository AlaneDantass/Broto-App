import React from "react";

interface SkeletonLoaderProps {
  lines?: number;
  variant?: "text" | "card" | "task" | "block" | "custom";
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  variant = "text",
  className = "",
}) => {
  const pulseClass = "animate-pulse";

  if (variant === "text") {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-surface-variant rounded ${pulseClass} ${
              i === lines - 1 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-surface rounded-lg p-6 space-y-4 ${className}`}>
        <div className={`h-6 bg-surface-variant rounded w-1/3 ${pulseClass}`} />
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-surface-variant rounded ${pulseClass} ${
                i === lines - 1 ? "w-2/3" : "w-full"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "task") {
    return (
      <div className={`bg-surface rounded-lg p-4 space-y-3 ${className}`}>
        <div className="flex items-start gap-3">
          <div
            className={`w-5 h-5 bg-surface-variant rounded flex-shrink-0 ${pulseClass}`}
          />
          <div className="flex-1 space-y-2">
            <div
              className={`h-4 bg-surface-variant rounded w-3/4 ${pulseClass}`}
            />
            <div
              className={`h-3 bg-surface-variant rounded w-1/2 ${pulseClass}`}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "block") {
    return (
      <div className={`bg-surface rounded-lg p-4 space-y-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 bg-surface-variant rounded-lg flex-shrink-0 ${pulseClass}`}
          />
          <div className="flex-1 space-y-2">
            <div
              className={`h-5 bg-surface-variant rounded w-2/3 ${pulseClass}`}
            />
            <div
              className={`h-3 bg-surface-variant rounded w-full ${pulseClass}`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-surface-variant rounded ${pulseClass} ${
            i === lines - 1 ? "w-1/2" : "w-full"
          }`}
        />
      ))}
    </div>
  );
};
