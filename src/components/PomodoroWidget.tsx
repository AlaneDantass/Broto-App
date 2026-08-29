import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, X, Maximize2 } from "lucide-react";

interface PomodoroWidgetProps {
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;
  totalTime: number;
  isBreakTime: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onMaximize?: () => void;
  taskTitle?: string;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  isActive,
  isPaused,
  timeRemaining,
  totalTime,
  isBreakTime,
  onPause,
  onResume,
  onStop,
  onMaximize,
  taskTitle,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const bgColor = isBreakTime ? "bg-emerald-50" : "bg-amber-50";
  const borderColor = isBreakTime ? "border-emerald-200" : "border-amber-200";
  const textColor = isBreakTime ? "text-emerald-900" : "text-amber-900";
  const accentColor = isBreakTime ? "bg-emerald-400" : "bg-amber-400";

  return createPortal(
    <div
      className={`fixed ${bgColor} border-2 ${borderColor} rounded-2xl p-4 shadow-lg w-64 z-40 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-label-sm font-medium ${textColor}`}>
            {isBreakTime ? "🌿 Pausa" : "🍅 Pomodoro"}
          </p>
          {taskTitle && !isBreakTime && (
            <p className="text-label-xs text-on-surface-variant truncate">
              {taskTitle}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {onMaximize && (
            <button
              onClick={onMaximize}
              className={`p-1.5 rounded hover:${isBreakTime ? "bg-emerald-100" : "bg-amber-100"} transition-colors`}
            >
              <Maximize2 size={16} className={textColor} />
            </button>
          )}
          <button
            onClick={onStop}
            className={`p-1.5 rounded hover:${isBreakTime ? "bg-emerald-100" : "bg-amber-100"} transition-colors`}
          >
            <X size={16} className={textColor} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full ${accentColor} transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timer */}
      <div className={`text-center mb-4 ${textColor}`}>
        <p className="font-playfair text-headline-sm">
          {formatTime(timeRemaining)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {isPaused ? (
          <button
            onClick={onResume}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${accentColor} ${textColor} font-medium text-label-sm hover:opacity-90 transition-opacity`}
          >
            <Play size={16} />
            Retomar
          </button>
        ) : (
          <button
            onClick={onPause}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${accentColor} ${textColor} font-medium text-label-sm hover:opacity-90 transition-opacity`}
          >
            <Pause size={16} />
            Pausar
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};
