import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-surface-container rounded-lg border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow ${
      onClick ? "cursor-pointer" : ""
    } ${className}`}
  >
    {children}
  </div>
);
