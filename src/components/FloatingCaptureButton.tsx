import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { usePensamentos } from "../hooks/usePensamentos";
import { CaptureThoughtModal } from "./CaptureThoughtModal";
import { useLanguage } from "../contexts/LanguageContext";

export const FloatingCaptureButton: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { createPensamento } = usePensamentos();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    titulo: string;
    detalhes?: string;
    categoria: "ideia" | "tarefa" | "nota";
  }) => {
    setIsSubmitting(true);
    try {
      await createPensamento({
        titulo: data.titulo,
        detalhes: data.detalhes,
        categoria: data.categoria,
        triado: false,
        destino_tipo: undefined,
        destino_id: undefined,
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-lg hover:bg-primary-container transition-colors flex items-center justify-center z-40"
        title={t("thought.capture")}
      >
        <MessageCircle size={28} />
      </button>

      <CaptureThoughtModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />
    </>
  );
};
