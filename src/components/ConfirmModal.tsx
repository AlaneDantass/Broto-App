import React from "react";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";
import { Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDanger = true,
}) => {
  const { language } = useLanguage();

  const defaultConfirmLabel = language === "en" ? "Delete" : "Remover";
  const defaultCancelLabel = language === "en" ? "Cancel" : "Cancelar";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6 w-full max-w-sm">
        <p className="text-body-md text-on-surface-variant">
          {message}
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-label-md font-medium transition-colors flex items-center gap-2"
          >
            <X size={18} />
            {cancelLabel || defaultCancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-error text-white rounded-lg text-label-md font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            {confirmLabel || defaultConfirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
