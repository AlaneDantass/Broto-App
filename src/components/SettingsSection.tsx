import React from "react";

interface SettingsSectionProps {
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-surface-container rounded-lg p-6 space-y-4 border border-outline-variant">
      <div>
        <h2 className="text-headline-sm text-on-surface font-playfair mb-1">
          {title}
        </h2>
        {description && (
          <p className="text-body-sm text-on-surface-variant">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};
