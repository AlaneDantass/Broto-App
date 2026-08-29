import React from "react";

interface ColorBarProps {
  color?: string;
  className?: string;
}

export const ColorBar: React.FC<ColorBarProps> = ({
  color = "#457B9D",
  className = "",
}) => {
  // Ensure color is in hex format
  const barColor = color.startsWith("#") ? color : `#${color}`;

  return (
    <div
      className={`h-4 w-full ${className}`}
      style={{
        backgroundColor: barColor,
      }}
      aria-label={`Cor: ${barColor}`}
    />
  );
};
