import React, { useEffect, useState } from "react";
import { Check, BrainCircuit } from "lucide-react";
import type { Task } from "../types/database";
import { useLanguage } from "../contexts/LanguageContext";
import { ConfirmModal } from "./ConfirmModal";

interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onSave: (timeSpent: number) => Promise<void>;
  onCaptureDesvio?: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  task,
  onClose,
  onSave,
  onCaptureDesvio,
}) => {
  const { t } = useLanguage();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Check for hyperfocus threshold (150% of estimated time)
  const hyperFocusThreshold =
    task.tempo_estimado_minutos &&
    elapsedSeconds / 60 > task.tempo_estimado_minutos * 1.5;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const timeSpentMinutes = Math.round(elapsedSeconds / 60);
      await onSave(timeSpentMinutes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsConfirmExitOpen(true);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const estimatedMinutes = task.tempo_estimado_minutos || 0;
  const elapsedMinutes = Math.round(elapsedSeconds / 60);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl shadow-2xl p-12 max-w-md w-full text-center">
        {/* Header */}
        <h2 className="text-headline-md font-playfair text-on-surface mb-2">
          {t("focus.active")}
        </h2>
        <p className="text-body-md text-on-surface-variant mb-8">
          {task.titulo}
        </p>

        {/* Timer */}
        <div className="mb-8">
          <div className="text-6xl font-playfair text-primary font-bold tabular-nums">
            {formatTime(elapsedSeconds)}
          </div>

          {estimatedMinutes > 0 && (
            <p className="text-body-sm text-on-surface-variant mt-4">
              {t("focus.estimated")}: {estimatedMinutes}min | {t("focus.elapsed")}: {elapsedMinutes}min
            </p>
          )}
        </div>

        {/* Hyperfocus warning */}
        {hyperFocusThreshold && (
          <div className="mb-6 p-4 bg-tertiary-container border border-tertiary rounded-lg">
            <p className="text-body-sm text-on-tertiary">
              {t("focus.hyperfocusWarning")}
            </p>
          </div>
        )}

        {/* Progress bar */}
        {estimatedMinutes > 0 && (
          <div className="mb-8">
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min((elapsedMinutes / estimatedMinutes) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Control buttons */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 px-4 py-3 bg-secondary text-on-secondary rounded-lg font-medium hover:bg-secondary-container transition-colors"
            >
              {isRunning ? t("focus.pause") : t("focus.resume")}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                t("task.saving")
              ) : (
                <>
                  <Check size={18} />
                  {t("focus.completed")}
                </>
              )}
            </button>
          </div>

          {/* Capture desvio button */}
          {onCaptureDesvio && (
            <button
              onClick={() => {
                setIsRunning(false);
                onCaptureDesvio();
              }}
              className="w-full px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-lg hover:opacity-80 transition-opacity font-medium flex items-center justify-center gap-2"
            >
              <BrainCircuit size={18} />
              {t("focus.capture")}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="w-full px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          {t("focus.exitWithoutSaving")}
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmExitOpen}
        onClose={() => setIsConfirmExitOpen(false)}
        onConfirm={onClose}
        title={t("focus.confirmExit")}
        message={t("focus.confirmExit")}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
};
