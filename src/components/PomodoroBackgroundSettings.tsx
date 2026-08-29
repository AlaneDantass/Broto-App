import React, { useState, useRef } from "react";
import { useConfiguracoes } from "../hooks/useConfiguracoes";
import { Image, Palette, LayoutTemplate, Upload } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export const PomodoroBackgroundSettings: React.FC = () => {
  const { config, updateConfig } = useConfiguracoes();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for immediate UI feedback before save completes
  const [bgType, setBgType] = useState<"padrao" | "cor" | "imagem">(
    config?.fundo_pomodoro_tipo || "padrao"
  );
  const [bgColor, setBgColor] = useState<string>(
    config?.fundo_pomodoro_cor || "#10b981"
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasLocalImage, setHasLocalImage] = useState<boolean>(
    !!localStorage.getItem("broto_pomodoro_bg_image")
  );

  const handleTypeChange = async (type: "padrao" | "cor" | "imagem") => {
    setBgType(type);
    await updateConfig({ fundo_pomodoro_tipo: type });
  };

  const handleColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBgColor(newColor);
    await updateConfig({ fundo_pomodoro_cor: newColor, fundo_pomodoro_tipo: "cor" });
  };

  const compressAndSaveImage = (file: File) => {
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Max dimensions
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.6 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          try {
            localStorage.setItem("broto_pomodoro_bg_image", dataUrl);
            setHasLocalImage(true);
            handleTypeChange("imagem");
          } catch (error) {
            console.error("Failed to save image to localStorage", error);
            alert("A imagem é muito grande, mesmo após a compressão.");
          }
        }
        setIsCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndSaveImage(e.target.files[0]);
    }
  };

  const removeImage = () => {
    localStorage.removeItem("broto_pomodoro_bg_image");
    setHasLocalImage(false);
    handleTypeChange("padrao");
  };

  if (!config) return null;

  return (
    <div className="space-y-4">
      <p className="text-label-md text-on-surface">Tipo de fundo da tela de Foco (Pomodoro)</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Padrão */}
        <button
          onClick={() => handleTypeChange("padrao")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
            bgType === "padrao"
              ? "border-primary bg-primary-container text-on-primary-container"
              : "border-outline-variant bg-surface hover:bg-surface-variant-high text-on-surface"
          }`}
        >
          <LayoutTemplate size={24} className="mb-2" />
          <span className="text-label-sm font-medium">Padrão</span>
          <span className="text-body-sm opacity-70 mt-1">Gradiente</span>
        </button>

        {/* Cor Sólida */}
        <button
          onClick={() => handleTypeChange("cor")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
            bgType === "cor"
              ? "border-primary bg-primary-container text-on-primary-container"
              : "border-outline-variant bg-surface hover:bg-surface-variant-high text-on-surface"
          }`}
        >
          <Palette size={24} className="mb-2" />
          <span className="text-label-sm font-medium">Cor Sólida</span>
          <span className="text-body-sm opacity-70 mt-1">Personalizada</span>
        </button>

        {/* Imagem */}
        <button
          onClick={() => {
            if (hasLocalImage && bgType !== "imagem") {
              handleTypeChange("imagem");
            } else {
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
            bgType === "imagem"
              ? "border-primary bg-primary-container text-on-primary-container"
              : "border-outline-variant bg-surface hover:bg-surface-variant-high text-on-surface"
          }`}
        >
          <Image size={24} className="mb-2" />
          <span className="text-label-sm font-medium">Imagem</span>
          <span className="text-body-sm opacity-70 mt-1">Upload</span>
        </button>
      </div>

      {/* Opções específicas para Cor */}
      {bgType === "cor" && (
        <div className="flex items-center gap-4 p-4 bg-surface-variant rounded-xl border border-outline-variant mt-4">
          <div className="flex-1">
            <p className="text-label-md text-on-surface">Escolha a cor do fundo</p>
          </div>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-outline-variant cursor-pointer flex-shrink-0">
            <input
              type="color"
              value={bgColor}
              onChange={handleColorChange}
              className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Opções específicas para Imagem */}
      {bgType === "imagem" && (
        <div className="flex flex-col gap-4 p-4 bg-surface-variant rounded-xl border border-outline-variant mt-4">
          <div className="flex items-center justify-between">
            <p className="text-label-md text-on-surface">Imagem salva no navegador</p>
            {isCompressing && (
              <span className="text-label-sm text-primary animate-pulse">Processando...</span>
            )}
          </div>
          
          {hasLocalImage && !isCompressing ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <div 
                className="w-full sm:w-40 h-24 rounded-lg bg-cover bg-center border border-outline-variant flex-shrink-0"
                style={{ backgroundImage: `url(${localStorage.getItem('broto_pomodoro_bg_image')})` }}
              />
              <div className="flex flex-col justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-surface text-on-surface text-label-sm rounded-lg border border-outline-variant hover:bg-surface-variant-high transition-colors text-left flex items-center gap-2"
                >
                  <Upload size={16} /> Trocar Imagem
                </button>
                <button
                  onClick={removeImage}
                  className="px-4 py-2 text-error text-label-sm hover:bg-error-container rounded-lg transition-colors text-left"
                >
                  Remover Imagem
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant">
              <Upload size={32} className="mb-2 opacity-50" />
              <p className="text-body-md text-center mb-4">Nenhuma imagem carregada</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:brightness-110 transition-all"
              >
                Fazer Upload
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
    </div>
  );
};
