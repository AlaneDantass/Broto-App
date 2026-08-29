import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface ColorWheelPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

const DEFAULT_COLOR = "#D8ABDC"; // Lilás pastel

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  selectedColor,
  onColorChange,
  label = "Cor",
}) => {
  const { t } = useLanguage();
  const [showCustom, setShowCustom] = useState(false);

  // Ensure color is in hex format
  const hexColor = selectedColor.startsWith("#") ? selectedColor : `#${selectedColor}`;

  // Check if current color is the default
  const isDefault = hexColor.toLowerCase() === DEFAULT_COLOR.toLowerCase();

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(e.target.value);
  };

  const handleDefaultClick = () => {
    onColorChange(DEFAULT_COLOR);
    setShowCustom(false);
  };

  return (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-3">
        {label}
      </label>

      {/* Default color option */}
      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={handleDefaultClick}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all ${
            isDefault && !showCustom
              ? "border-on-surface bg-surface-container-high"
              : "border-outline-variant hover:border-on-surface-variant"
          }`}
        >
          <div
            className="w-8 h-8 rounded-full shadow-sm flex-shrink-0"
            style={{ backgroundColor: DEFAULT_COLOR }}
          />
          <span className="text-label-md text-on-surface">{t("color.default")}</span>
        </button>
      </div>

      {/* Custom color option */}
      <div className="border-t border-outline-variant pt-3">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 border-outline-variant hover:border-on-surface-variant transition-all"
        >
          <div
            className="w-8 h-8 rounded shadow-sm flex-shrink-0"
            style={{ backgroundColor: hexColor }}
          />
          <span className="text-label-md text-on-surface">{t("color.custom")}</span>
        </button>

        {showCustom && (
          <div className="space-y-3 p-3 mt-3 bg-surface-container-low rounded-lg border border-outline-variant">
            <input
              type="color"
              value={hexColor}
              onChange={handleColorInputChange}
              className="w-full h-12 rounded-lg cursor-pointer"
            />

            <div>
              <label className="block text-label-sm text-on-surface-variant mb-2">
                {t("color.hexCode")}
              </label>
              <input
                type="text"
                value={hexColor}
                onChange={handleColorInputChange}
                placeholder="#000000"
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-label-sm focus:border-primary transition-colors"
                maxLength={7}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="w-full px-3 py-2 bg-primary text-on-primary text-label-sm rounded-lg hover:bg-primary-container transition-colors font-medium"
            >
              {t("color.done")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
