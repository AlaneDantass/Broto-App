import React from "react";
import { X } from "lucide-react";
import { getImageFromClipboard, resizeImageFile } from "../utils/imagePaste";

interface TextareaComImagensProps {
  value: string;
  onChange: (value: string) => void;
  images: string[];
  onImagesChange: (images: string[]) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const TextareaComImagens: React.FC<TextareaComImagensProps> = ({
  value,
  onChange,
  images,
  onImagesChange,
  placeholder,
  className,
  rows,
  disabled,
  autoFocus,
}) => {
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = getImageFromClipboard(e.clipboardData);
    if (!file) return;

    e.preventDefault();
    const dataUrl = await resizeImageFile(file);
    onImagesChange([...images, dataUrl]);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={className}
        rows={rows}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt="Imagem colada"
                className="w-16 h-16 object-cover rounded-lg border border-outline-variant"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
