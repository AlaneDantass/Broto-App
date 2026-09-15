import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface font-dm-sans focus:outline-none focus:border-primary transition-colors cursor-pointer flex justify-between items-center"
      >
        <span className={selectedOption ? "" : "text-on-surface-variant"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`text-on-surface-variant transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-outline rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-body-md cursor-pointer transition-colors font-dm-sans ${
                value === option.value
                  ? "bg-primary-container/30 text-on-surface font-medium"
                  : "text-on-surface hover:bg-surface-variant-low"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
