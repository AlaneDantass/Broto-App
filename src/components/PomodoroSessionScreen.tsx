import React from "react";
import { createPortal } from "react-dom";
import { X, Pause, Play, Maximize2, Check, ChevronDown } from "lucide-react";
import type { Task } from "../types/database";
import { useConfiguracoes } from "../hooks/useConfiguracoes";

interface PomodoroSessionScreenProps {
  onCompleteTask?: () => void;
  onMinimize?: () => void;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;
  totalTime: number;
  isBreakTime: boolean;
  taskTitle?: string;
  taskId?: string;
  currentTask?: Task;
  blocTasks?: Task[];
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  totalFocusToday: number;
}

export const PomodoroSessionScreen: React.FC<PomodoroSessionScreenProps> = ({
  onCompleteTask,
  onMinimize,
  isActive,
  isPaused,
  timeRemaining,
  totalTime,
  isBreakTime,
  taskTitle,
  currentTask,
  blocTasks = [],
  onPause,
  onResume,
  onClose,
  totalFocusToday,
}) => {
  const { config } = useConfiguracoes();

  if (!isActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins} min`;
    }
    return `${mins} min`;
  };

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let bgColor = isBreakTime ? "from-emerald-50 to-emerald-100" : "from-amber-50 to-orange-50";
  let textColor = isBreakTime ? "text-emerald-900" : "text-amber-900";
  let ringColor = isBreakTime ? "#10b981" : "#f59e0b";
  let bgStyle: React.CSSProperties = {};
  
  const bgType = config?.fundo_pomodoro_tipo || "padrao";
  
  if (bgType === "cor" && config?.fundo_pomodoro_cor) {
    bgColor = ""; // Remove gradient classes
    bgStyle = { backgroundColor: config.fundo_pomodoro_cor };
    // Maintain original text/ring colors or try to contrast them (simplest is keeping them or adding text shadow)
  } else if (bgType === "imagem") {
    const localImg = localStorage.getItem("broto_pomodoro_bg_image");
    if (localImg) {
      bgColor = "";
      bgStyle = { 
        backgroundImage: `url(${localImg})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center" 
      };
    }
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        margin: 0,
        padding: 0,
        ...bgStyle
      }}
      className={`${bgType === "padrao" ? `bg-gradient-to-br ${bgColor}` : ""} flex flex-col items-center justify-center overflow-hidden`}
    >
      {/* Background Overlay for readability if using image */}
      {bgType === "imagem" && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      )}
      
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <button
          onClick={onMinimize}
          className={`p-2 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors ${textColor}`}
          title="Minimizar"
        >
          <ChevronDown size={24} />
        </button>
        <div className="flex-1">
          {taskTitle && !isBreakTime && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isBreakTime ? "bg-emerald-200" : "bg-amber-200"} ${textColor} font-medium text-label-md`}>
              <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
              {taskTitle}
            </div>
          )}
          {isBreakTime && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-200 text-emerald-900 font-medium text-label-md">
              <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
              🌿 Pausa
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors ${textColor}`}
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Timer Area */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
        {/* Timer Ring */}
        <div className="relative w-80 h-80">
          <svg className="absolute inset-0" width="320" height="320" viewBox="0 0 320 320">
            {/* Background circle */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="8"
              opacity="0.5"
            />
            {/* Progress circle */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{ transform: "rotate(-90deg)", transformOrigin: "160px 160px" }}
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`font-playfair text-7xl font-bold ${textColor} drop-shadow-sm`}>
              {formatTime(timeRemaining)}
            </p>
            <p className={`text-label-md ${textColor} font-medium mt-2 drop-shadow-sm`}>
              {isBreakTime ? "Pausa" : "Pomodoro"}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 flex-wrap z-10">
        {isPaused ? (
          <button
            onClick={onResume}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-amber-900 font-medium hover:shadow-lg transition-all"
          >
            <Play size={20} />
            Retomar
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-amber-900 font-medium hover:shadow-lg transition-all"
          >
            <Pause size={20} />
            Pausar
          </button>
        )}

        {!isBreakTime && onCompleteTask && (
          <button
            onClick={onCompleteTask}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all"
          >
            <Check size={20} />
            Concluir
          </button>
        )}
      </div>

      {/* Sidebar */}
      <div className="absolute right-8 top-24 bottom-24 w-64 bg-white/90 rounded-2xl p-6 flex flex-col gap-6 backdrop-blur-md shadow-xl z-10 border border-white/50">
        {/* Focus Time Today */}
        <div>
          <p className="text-label-sm text-on-surface-variant mb-2">Tempo de foco hoje</p>
          <p className="text-headline-md font-playfair text-on-surface">
            {formatTotalTime(totalFocusToday)}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant"></div>

        {/* Tasks Today */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-label-sm text-on-surface-variant mb-3">Tarefas do Bloco</p>
          {blocTasks.length === 0 ? (
            <p className="text-label-sm text-on-surface-variant italic">
              Nenhuma tarefa neste bloco
            </p>
          ) : (
            <div className="space-y-2">
              {blocTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 rounded text-label-sm flex items-start gap-2 ${
                    task.status === "concluida"
                      ? "bg-emerald-50 text-emerald-700"
                      : task.id === currentTask?.id
                      ? "bg-amber-100 text-amber-900 font-medium"
                      : "bg-surface text-on-surface border border-outline-variant"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {task.status === "concluida" ? (
                      <Check size={16} />
                    ) : task.id === currentTask?.id ? (
                      <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-current opacity-50"></div>
                    )}
                  </div>
                  <span className="flex-1 line-clamp-2">
                    {task.titulo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
