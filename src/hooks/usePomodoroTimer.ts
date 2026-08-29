import { useEffect, useState, useRef, useCallback } from "react";
import { useConfiguracoes } from "./useConfiguracoes";
import { useSensorial } from "../contexts/SensorialContext";
import { playRewardSound } from "../utils/rewardSound";

interface PomodoroState {
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;
  totalTime: number;
  currentTaskId: string | null;
  sessionCount: number; // quantos pomodoros consecutivos
  isBreakTime: boolean;
}

export const usePomodoroTimer = () => {
  const { config } = useConfiguracoes();
  const { somRecompensaAtivo } = useSensorial();
  const [state, setState] = useState<PomodoroState>({
    isActive: false,
    isPaused: false,
    timeRemaining: 0,
    totalTime: 0,
    currentTaskId: null,
    sessionCount: 0,
    isBreakTime: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<{
    onComplete?: () => void;
    onBreakComplete?: () => void;
  }>({});

  const startPomodoro = useCallback(
    (taskId: string, onComplete?: () => void) => {
      const totalSeconds = (config?.duracao_pomodoro_minutos || 25) * 60;
      setState(prev => ({
        ...prev,
        isActive: true,
        isPaused: false,
        timeRemaining: totalSeconds,
        totalTime: totalSeconds,
        currentTaskId: taskId,
        isBreakTime: false,
      }));
      callbackRef.current.onComplete = onComplete;
    },
    [config]
  );

  const startBreak = useCallback(
    (isLong: boolean, onComplete?: () => void) => {
      const breakDuration = isLong
        ? config?.duracao_pausa_longa_minutos || 15
        : config?.duracao_pausa_curta_minutos || 5;
      const totalSeconds = breakDuration * 60;

      setState(prev => ({
        ...prev,
        isActive: true,
        isPaused: false,
        timeRemaining: totalSeconds,
        totalTime: totalSeconds,
        isBreakTime: true,
      }));
      callbackRef.current.onBreakComplete = onComplete;
    },
    [config]
  );

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeRemaining: 0,
      currentTaskId: null,
    }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (!state.isActive || state.isPaused) return;

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          // Timer finished
          if (!prev.isBreakTime) {
            // Pomodoro finished — toca som de recompensa se ativo
            if (somRecompensaAtivo) playRewardSound();
            callbackRef.current.onComplete?.();
          } else {
            // Break finished
            callbackRef.current.onBreakComplete?.();
          }

          return {
            ...prev,
            isActive: false,
            isPaused: false,
            timeRemaining: 0,
          };
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isActive, state.isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    state,
    startPomodoro,
    startBreak,
    pause,
    resume,
    stop,
    formatTime,
    shouldShowLongBreak: state.sessionCount >= (config?.pomodoros_ate_pausa_longa || 4),
  };
};
