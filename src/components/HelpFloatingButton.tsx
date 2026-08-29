import React, { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { usePerfil } from "../hooks/usePerfil";
import { useLanguage } from "../contexts/LanguageContext";
import { HelpModal } from "./HelpModal";

export const HelpFloatingButton: React.FC = () => {
  const { perfil, updatePerfil } = usePerfil();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip if the user hasn't seen the help yet
    if (perfil && perfil.ajuda_visualizada === false) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, [perfil]);

  const handleOpenHelp = async () => {
    setIsModalOpen(true);
    
    // If it's the first time, mark as seen
    if (perfil && perfil.ajuda_visualizada === false) {
      setShowTooltip(false);
      try {
        await updatePerfil({ ajuda_visualizada: true });
      } catch (err) {
        console.error("Failed to update ajuda_visualizada", err);
      }
    }
  };

  const handleDismissTooltip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    
    if (perfil && perfil.ajuda_visualizada === false) {
      try {
        await updatePerfil({ ajuda_visualizada: true });
      } catch (err) {
        console.error("Failed to update ajuda_visualizada", err);
      }
    }
  };

  return (
    <>
      <div className="fixed top-8 right-10 z-40 flex flex-col items-end">
        <button
          onClick={handleOpenHelp}
          className="w-10 h-10 bg-surface-variant text-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 hover:shadow-xl transition-all border border-outline-variant"
          title={t("help.title")}
        >
          <HelpCircle size={20} />
        </button>

        {showTooltip && (
          <div className="mt-4 relative bg-primary text-on-primary text-sm p-4 rounded-xl shadow-lg max-w-xs animate-in slide-in-from-top-5 fade-in duration-300">
            <button 
              onClick={handleDismissTooltip}
              className="absolute top-2 right-2 text-on-primary/70 hover:text-on-primary transition-colors"
            >
              <X size={16} />
            </button>
            <p className="pr-4">{t("help.tooltipMsg")}</p>
            {/* Arrow pointing up to the button */}
            <div className="absolute -top-2 right-3 w-4 h-4 bg-primary transform rotate-45"></div>
          </div>
        )}
      </div>

      <HelpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
