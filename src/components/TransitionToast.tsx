/**
 * TransitionToast.tsx
 *
 * Toast não-bloqueante que aparece no canto inferior direito
 * 10 minutos antes de um evento do calendário começar.
 * Fecha automaticamente após 30s ou ao clicar em X.
 */

import React, { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";
import { useSensorial } from "../contexts/SensorialContext";

export const TransitionToast: React.FC = () => {
  const { alertaTransicao, dismissAlerta } = useSensorial();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Anima entrada quando alerta aparece
  useEffect(() => {
    if (alertaTransicao) {
      setExiting(false);
      setVisible(true);

      // Auto-dismiss após 30s
      const timer = setTimeout(() => handleDismiss(), 30_000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [alertaTransicao]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      dismissAlerta();
    }, 300);
  };

  if (!visible || !alertaTransicao) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9000,
        maxWidth: "320px",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateY(8px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          background: "var(--color-surface-container)",
          border: "1px solid var(--color-outline-variant)",
          borderLeft: "3px solid var(--color-primary)",
          borderRadius: "0.75rem",
          padding: "0.875rem 1rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.625rem",
        }}
      >
        {/* Ícone */}
        <div
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            background: "var(--color-primary-container)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "0.125rem",
          }}
        >
          <Clock size={14} style={{ color: "var(--color-on-primary-container)" }} />
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--color-on-surface-variant)",
              lineHeight: 1.2,
            }}
          >
            Em {alertaTransicao.minutosRestantes} min
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--color-on-surface)",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {alertaTransicao.titulo}
          </p>
        </div>

        {/* Botão fechar */}
        <button
          onClick={handleDismiss}
          aria-label="Fechar lembrete"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: "var(--color-on-surface-variant)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            flexShrink: 0,
            opacity: 0.7,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
