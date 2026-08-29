import React from "react";
import { Modal } from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";
import { BookOpen, CheckCircle, Clock, Calendar, Lightbulb } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("help.title")}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <p className="text-body-md text-on-surface-variant">
          {t("help.welcome")}
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0 text-primary">
              <BookOpen size={24} />
            </div>
            <div>
              <h4 className="text-title-sm font-medium text-on-surface mb-1">{t("help.blocksTitle")}</h4>
              <p className="text-body-sm text-on-surface-variant">{t("help.blocksDesc")}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0 text-primary">
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 className="text-title-sm font-medium text-on-surface mb-1">{t("help.tasksTitle")}</h4>
              <p className="text-body-sm text-on-surface-variant">{t("help.tasksDesc")}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0 text-primary">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-title-sm font-medium text-on-surface mb-1">{t("help.triageTitle")}</h4>
              <p className="text-body-sm text-on-surface-variant">{t("help.triageDesc")}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0 text-primary">
              <Lightbulb size={24} />
            </div>
            <div>
              <h4 className="text-title-sm font-medium text-on-surface mb-1">{t("help.ideasTitle")}</h4>
              <p className="text-body-sm text-on-surface-variant">{t("help.ideasDesc")}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0 text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="text-title-sm font-medium text-on-surface mb-1">{t("help.calendarTitle")}</h4>
              <p className="text-body-sm text-on-surface-variant">{t("help.calendarDesc")}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-outline-variant">
          <button onClick={onClose} className="btn-primary px-6">
            {t("help.close")}
          </button>
        </div>
      </div>
    </Modal>
  );
};
