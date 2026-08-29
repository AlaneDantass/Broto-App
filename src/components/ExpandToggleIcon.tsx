import React from "react";

interface ExpandToggleIconProps {
  isExpanded?: boolean;
  className?: string;
}

export const ExpandToggleIcon: React.FC<ExpandToggleIconProps> = ({
  isExpanded = false,
  className = "w-5 h-5",
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Barra sólida à esquerda (Sage Fern) */}
      <rect x="4" y="8" width="3" height="8" fill="#A5A58D" />

      {/* Bloco superior (Sage Fern) */}
      <rect
        x="9"
        y="6"
        width="11"
        height="5"
        rx="1"
        fill="#A5A58D"
        opacity={isExpanded ? "0.5" : "1"}
      />

      {/* Bloco inferior (Terracotta - destaque) */}
      <rect
        x="9"
        y="13"
        width="11"
        height="5"
        rx="1"
        fill="#CB997E"
        opacity={isExpanded ? "1" : "0.7"}
      />
    </svg>
  );
};
