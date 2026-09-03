import React, { useState, useMemo, useRef, useEffect } from "react";
import { Bell, Check, Calendar } from "lucide-react";
import { useDatasImportantes } from "../hooks/useDatasImportantes";
import { useLanguage } from "../contexts/LanguageContext";

export const NotificationBell: React.FC = () => {
  const { t, language } = useLanguage();
  const { datas, markAsRead } = useDatasImportantes();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeNotifications = useMemo(() => {
    const today = new Date();
    // Reset time to start of day for comparison
    today.setHours(0, 0, 0, 0);

    return datas.filter((d) => {
      if (d.lida) return false;
      const dateParts = d.data.split('-');
      if (dateParts.length !== 3) return false;
      
      // create date in local timezone preserving the day
      const dataDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
      
      // active if the date is today or in the past
      return dataDate <= today;
    });
  }, [datas]);

  const unreadCount = activeNotifications.length;

  return (
    <div className="fixed top-6 right-8 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-surface text-on-surface rounded-full shadow-md hover:bg-surface-container-high transition-colors border border-outline-variant"
        title={t("notifications.title")}
      >
        <Bell size={22} className={unreadCount > 0 ? "text-primary" : "text-on-surface-variant"} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-error rounded-full border-2 border-surface animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-surface rounded-xl shadow-xl border border-outline-variant overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
            <h3 className="font-playfair font-medium text-headline-sm text-on-surface">
              {t("notifications.title")}
            </h3>
            {unreadCount > 0 && (
              <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2 scrollbar-none">
            {unreadCount === 0 ? (
              <p className="text-body-sm text-on-surface-variant text-center py-8">
                {t("notifications.empty")}
              </p>
            ) : (
              <div className="space-y-2">
                {activeNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border-l-4 border-primary"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-on-surface truncate">
                          {notif.titulo}
                        </p>
                        {notif.descricao && (
                          <p className="text-label-xs text-on-surface-variant mt-1 line-clamp-2">
                            {notif.descricao}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-label-xs text-primary">
                          <Calendar size={12} />
                          <span>
                            {new Date(notif.data + 'T00:00:00').toLocaleDateString(
                              language === "en" ? "en-US" : "pt-BR"
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-md transition-colors flex-shrink-0"
                        title={t("notifications.markRead")}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
