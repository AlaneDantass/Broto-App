import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, X, Maximize2 } from "lucide-react";
import { useConfiguracoes } from "../hooks/useConfiguracoes";

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
  const { config } = useConfiguracoes();
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
  
  const borderColor = isBreakTime ? "border-sky-300" : "border-amber-200";
  const textColor = isBreakTime ? "text-sky-900" : "text-amber-900";
  const accentColor = isBreakTime ? "bg-sky-400" : "bg-amber-400";

  const bgType = config?.fundo_pomodoro_tipo || "padrao";
  let bgStyle: React.CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  if (isBreakTime) {
    bgStyle.backgroundColor = "#e0f2fe"; // sky-100
  } else {
    if (bgType === "cor" && config?.fundo_pomodoro_cor) {
      bgStyle.backgroundColor = config.fundo_pomodoro_cor;
    } else if (bgType === "imagem") {
      const localImg = localStorage.getItem("broto_pomodoro_bg_image");
      if (localImg) {
        bgStyle.backgroundImage = `url(${localImg})`;
        bgStyle.backgroundSize = "cover";
        bgStyle.backgroundPosition = "center";
      } else {
        bgStyle.backgroundColor = "#e6eee8";
      }
    } else {
      // "padrao" - verde meio cinza e clarinho
      bgStyle.backgroundColor = "#e6eee8";
    }
  }

  return createPortal(
    <div
      className={`fixed border-2 ${borderColor} rounded-2xl p-4 shadow-lg w-80 z-40 overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={bgStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Background Overlay for readability if using image */}
      {bgType === "imagem" && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[-1]" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10 gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-label-sm font-medium truncate ${textColor}`}>
            {isBreakTime ? "🌿 Pausa" : "🍅 Pomodoro"}
          </p>
          {/* Nome da tarefa foi removido conforme solicitado */}
        </div>
        <div className="flex gap-1">
          {onMaximize && (
            <button
              onClick={onMaximize}
              className={`p-1.5 rounded hover:bg-black/10 transition-colors`}
            >
              <Maximize2 size={16} className={textColor} />
            </button>
          )}
          <button
            onClick={onStop}
            className={`p-1.5 rounded hover:bg-black/10 transition-colors`}
          >
            <X size={16} className={textColor} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 bg-white/50 rounded-full overflow-hidden relative z-10">
        <div
          className={`h-full ${accentColor} transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timer */}
      <div className={`text-center mb-4 relative z-10 ${textColor}`}>
        <p className="font-playfair text-headline-sm drop-shadow-sm">
          {formatTime(timeRemaining)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center relative z-10">
        {isPaused ? (
          <button
            onClick={onResume}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${accentColor} ${textColor} font-medium text-label-sm hover:opacity-90 transition-opacity shadow-sm`}
          >
            <Play size={16} />
            Retomar
          </button>
        ) : (
          <button
            onClick={onPause}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${accentColor} ${textColor} font-medium text-label-sm hover:opacity-90 transition-opacity shadow-sm`}
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
