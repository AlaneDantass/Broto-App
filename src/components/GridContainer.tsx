import React from "react";

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  className = ""
}) => {
  return (
    <div
      className={`bg-grid-container rounded-lg border border-outline-variant p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};
