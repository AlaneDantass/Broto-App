import React, { useState } from "react";
import { useConfiguracoes } from "../hooks/useConfiguracoes";
import { useGoogleAgenda } from "../hooks/useGoogleAgenda";
import { Card, SkeletonLoader } from "../components";
import { SettingsSection } from "../components/SettingsSection";
import { Clock, Brain, Sliders, Zap, Target, Hash, Puzzle, BookOpen, RefreshCw, Info, Globe, Calendar, CheckCircle2, Loader2, Unlink, Ear, Volume2, Bell, Palette, Minimize2 } from "lucide-react";
import { useLanguage, type Language } from "../contexts/LanguageContext";
import { PomodoroBackgroundSettings } from "../components/PomodoroBackgroundSettings";

export const ConfiguracoesPage: React.FC = () => {
  const { config, loading, error, updateConfig } = useConfiguracoes();
  const { integrado, emailGoogle, conectadoEm, carregando: googleCarregando, conectando, desconectando, conectar, desconectar } = useGoogleAgenda();
  const [isSaving, setIsSaving] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [showDesconectarConfirm, setShowDesconectarConfirm] = useState(false);

  const handleUpdate = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      await updateConfig({ [key]: value });
    } catch (err) {
      console.error("Erro ao atualizar configuração:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSliderChange = (key: string, value: number) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderEnd = (key: string, value: number) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
    // Update silently without showing saving indicator
    updateConfig({ [key]: value }).catch(err =>
      console.error("Erro ao atualizar configuração:", err)
    );
  };

  const getDisplayValue = (key: string, defaultValue: number) => {
    return localValues[key] !== undefined ? localValues[key] : (config?.[key as keyof typeof config] || defaultValue);
  };

  const { language, setLanguage, t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-8 pb-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 bg-surface-variant rounded w-32 animate-pulse" />
            <SkeletonLoader variant="card" lines={3} />
          </div>
        ))}
      </div>
    );
  }

  if (!config) {
    return (
      <Card>
        <p className="text-body-md text-error">{t("settings.error")}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg text-on-surface mb-2 font-playfair">
          {t("settings.title")}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Idioma / Language */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            {t("settings.language")}
          </span>
        }
        description={t("settings.languageDesc")}
      >
        <div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full max-w-xs px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="pt">Português (BR)</option>
            <option value="en">English (US)</option>
          </select>
        </div>
      </SettingsSection>

      {/* Error */}
      {error && (
        <Card>
          <p className="text-body-md text-error">{error}</p>
        </Card>
      )}

      {/* Focus & Rhythm */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            {t("settings.focoRitmo")}
          </span>
        }
        description={t("settings.focoRitmoDesc")}
      >
        {/* Hyperfocus Threshold */}
        <div>
          <label className="block text-label-md text-on-surface mb-3">
            {t("settings.limiarHiperfoco")} <span className="font-bold text-primary">{getDisplayValue("limiar_hiperfoco_percentual", 100)}%</span>
          </label>
          <input
            type="range"
            min="100"
            max="300"
            step="10"
            value={getDisplayValue("limiar_hiperfoco_percentual", 100)}
            onChange={(e) =>
              handleSliderChange("limiar_hiperfoco_percentual", parseInt(e.target.value))
            }
            onMouseUp={(e) => handleSliderEnd("limiar_hiperfoco_percentual", parseInt((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderEnd("limiar_hiperfoco_percentual", parseInt((e.target as HTMLInputElement).value))}
            className="w-full"
          />
          <p className="text-body-sm text-on-surface-variant mt-2">
            {t("settings.limiarDesc")}
            <br />
            <span className="text-label-sm">{t("settings.limiarValues")}</span>
          </p>
        </div>

        {/* End of Day */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {t("settings.horarioFimDia")}
          </label>
          <input
            type="time"
            value={localValues["horario_fim_dia"] !== undefined ? localValues["horario_fim_dia"] : config.horario_fim_dia}
            onChange={(e) => setLocalValues(prev => ({ ...prev, horario_fim_dia: e.target.value }))}
            onBlur={(e) => handleUpdate("horario_fim_dia", e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
          />
          <p className="text-body-sm text-on-surface-variant mt-2">
            {t("settings.horarioFimDiaDesc")}
          </p>
        </div>
      </SettingsSection>

      {/* Intelligent Assistance */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <Brain size={20} className="text-primary" />
            {t("settings.ia")}
          </span>
        }
        description={t("settings.iaDesc")}
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.estimativa_ia_ativa}
            onChange={(e) => handleUpdate("estimativa_ia_ativa", e.target.checked)}
            disabled={isSaving}
            className="w-5 h-5"
          />
          <span className="text-body-md text-on-surface">
            {t("settings.iaCheckbox")}
          </span>
        </label>
        <p className="text-body-sm text-on-surface-variant">
          {t("settings.iaCheckboxDesc")}
        </p>
      </SettingsSection>

      {/* Task Fields */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <Sliders size={20} className="text-primary" />
            {t("settings.camposAvancados")}
          </span>
        }
        description={t("settings.camposAvancadosDesc")}
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.campo_energia_estimada_visivel}
            onChange={(e) => handleUpdate("campo_energia_estimada_visivel", e.target.checked)}
            disabled={isSaving}
            className="w-5 h-5"
          />
          <span className="flex items-center gap-2 text-body-md text-on-surface">
            <Zap size={18} className="text-primary flex-shrink-0" />
            {t("settings.energiaEstimada")}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.campo_contexto_visivel}
            onChange={(e) => handleUpdate("campo_contexto_visivel", e.target.checked)}
            disabled={isSaving}
            className="w-5 h-5"
          />
          <span className="flex items-center gap-2 text-body-md text-on-surface">
            <Target size={18} className="text-primary flex-shrink-0" />
            {t("settings.contexto")}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.campo_prioridade_numerica_visivel}
            onChange={(e) => handleUpdate("campo_prioridade_numerica_visivel", e.target.checked)}
            disabled={isSaving}
            className="w-5 h-5"
          />
          <span className="flex items-center gap-2 text-body-md text-on-surface">
            <Hash size={18} className="text-primary flex-shrink-0" />
            {t("settings.prioridade")}
          </span>
        </label>

        <p className="text-body-sm text-on-surface-variant pt-2">
          {t("settings.camposDesc")}
        </p>
      </SettingsSection>

      {/* Pomodoro Configuration */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl">🍅</span>
            {t("settings.pomodoro") || "Configuração de Pomodoro"}
          </span>
        }
        description={t("settings.pomodoroDesc") || "Personalize sua técnica de Pomodoro"}
      >
        {/* Pomodoro Duration */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {t("settings.pomoDuration") || "Duração do Pomodoro"} <span className="font-bold text-primary">{getDisplayValue("duracao_pomodoro_minutos", 25)} min</span>
          </label>
          <input
            type="range"
            min="15"
            max="60"
            step="1"
            value={getDisplayValue("duracao_pomodoro_minutos", 25)}
            onChange={(e) => handleSliderChange("duracao_pomodoro_minutos", parseInt(e.target.value))}
            onMouseUp={(e) => handleSliderEnd("duracao_pomodoro_minutos", parseInt((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderEnd("duracao_pomodoro_minutos", parseInt((e.target as HTMLInputElement).value))}
            className="w-full"
          />
          <p className="text-body-sm text-on-surface-variant mt-2">
            {t("settings.pomoDurationDesc") || "Tempo padrão de cada sessão de trabalho focado"}
          </p>
        </div>

        {/* Short Break Duration */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {t("settings.pomoShortBreak") || "Pausa Curta"} <span className="font-bold text-primary">{getDisplayValue("duracao_pausa_curta_minutos", 5)} min</span>
          </label>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={getDisplayValue("duracao_pausa_curta_minutos", 5)}
            onChange={(e) => handleSliderChange("duracao_pausa_curta_minutos", parseInt(e.target.value))}
            onMouseUp={(e) => handleSliderEnd("duracao_pausa_curta_minutos", parseInt((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderEnd("duracao_pausa_curta_minutos", parseInt((e.target as HTMLInputElement).value))}
            disabled={isSaving}
            className="w-full"
          />
          <p className="text-body-sm text-on-surface-variant mt-2">
            {t("settings.pomoShortBreakDesc") || "Tempo de descanso após cada Pomodoro"}
          </p>
        </div>

        {/* Long Break Duration */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {t("settings.pomoLongBreak") || "Pausa Longa"} <span className="font-bold text-primary">{getDisplayValue("duracao_pausa_longa_minutos", 15)} min</span>
          </label>
          <input
            type="range"
            min="10"
            max="45"
            step="1"
            value={getDisplayValue("duracao_pausa_longa_minutos", 15)}
            onChange={(e) => handleSliderChange("duracao_pausa_longa_minutos", parseInt(e.target.value))}
            onMouseUp={(e) => handleSliderEnd("duracao_pausa_longa_minutos", parseInt((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderEnd("duracao_pausa_longa_minutos", parseInt((e.target as HTMLInputElement).value))}
            disabled={isSaving}
            className="w-full"
          />
          <p className="text-body-sm text-on-surface-variant mt-2">
            {t("settings.pomoLongBreakDesc") || "Tempo de descanso prolongado após várias sessões"}
          </p>
        </div>

        {/* Pomodoros until Long Break */}
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            {t("settings.pomoUntilLongBreak") || "Pomodoros até Pausa Longa"} <span className="font-bold text-primary">{getDisplayValue("pomodoros_ate_pausa_longa", 4)}</span>
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={getDisplayValue("pomodoros_ate_pausa_longa", 4)}
            onChange={(e) => handleSliderChange("pomodoros_ate_pausa_longa", parseInt(e.target.value))}
            onMouseUp={(e) => handleSliderEnd("pomodoros_ate_pausa_longa", parseInt((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderEnd("pomodoros_ate_pausa_longa", parseInt((e.target as HTMLInputElement).value))}
            disabled={isSaving}
            className="w-full"
          />
          <p className="text-body-sm text-on-surface-variant mt-2">
            {t("settings.pomoUntilLongBreakDesc") || "Quantas sessões completar antes de uma pausa longa"}
          </p>
        </div>
      </SettingsSection>

      {/* Optional Modules */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <Puzzle size={20} className="text-primary" />
            {t("settings.modulosOpcionais")}
          </span>
        }
        description={t("settings.modulosOpcionaisDesc")}
      >
        <label className="flex items-center gap-3 cursor-pointer opacity-50 cursor-not-allowed">
          <input
            type="checkbox"
            checked={config.modulo_diario_visual_ativo}
            onChange={(e) => handleUpdate("modulo_diario_visual_ativo", e.target.checked)}
            disabled={true}
            className="w-5 h-5"
          />
          <span className="flex items-center gap-2 text-body-md text-on-surface">
            <BookOpen size={18} className="text-primary flex-shrink-0" />
            {t("settings.diarioVisual")}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer opacity-50 cursor-not-allowed">
          <input
            type="checkbox"
            checked={config.modulo_rastreador_habitos_ativo}
            onChange={(e) => handleUpdate("modulo_rastreador_habitos_ativo", e.target.checked)}
            disabled={true}
            className="w-5 h-5"
          />
          <span className="flex items-center gap-2 text-body-md text-on-surface">
            <RefreshCw size={18} className="text-primary flex-shrink-0" />
            {t("settings.rastreadorHabitos")}
          </span>
        </label>
      </SettingsSection>

      {/* Suporte Sensorial */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <Ear size={20} className="text-primary" />
            Suporte Sensorial
          </span>
        }
        description="Adapte o Broto ao seu conforto visual e sensorial. Todas as opções ficam salvas automaticamente."
      >
        {/* Tema */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={16} className="text-primary" />
            <span className="text-label-md text-on-surface">Tema</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "claro",              label: "Claro",             emoji: "☀️",  desc: "Verde e creme" },
              { value: "escuro",             label: "Escuro",            emoji: "🌙",  desc: "Fundo escuro quente" },
              { value: "alto_contraste",     label: "Alto contraste",   emoji: "◆",   desc: "Preto e branco" },
              { value: "noturno_ultra_suave",label: "Noturno ultra-suave", emoji: "☽", desc: "Tons de mogno" },
            ] as const).map((tema) => {
              const isSelected = (config.tema ?? "claro") === tema.value;
              return (
                <button
                  key={tema.value}
                  id={`btn-tema-${tema.value}`}
                  onClick={() => {
                    document.documentElement.setAttribute("data-tema", tema.value);
                    localStorage.setItem("broto_tema", tema.value);
                    handleUpdate("tema", tema.value);
                  }}
                  disabled={isSaving}
                  className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary border border-primary-container"
                      : "border-outline-variant bg-surface hover:bg-surface-variant-high"
                  }`}
                >
                  <span className="text-xl leading-none mt-0.5">{tema.emoji}</span>
                  <div>
                    <p className={`text-label-md leading-tight ${
                      isSelected ? "text-on-primary-container font-semibold" : "text-on-surface"
                    }`}>
                      {tema.label}
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5 leading-tight">
                      {tema.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant" />

        {/* Toggles sensoriais */}
        <div className="space-y-4">
          {/* Poucas cores e pouco texto */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface">Poucas cores e pouco texto</p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Simplifica a interface: menos elementos decorativos, texto mais direto.
              </p>
            </div>
            <button
              id="toggle-poucas-cores"
              role="switch"
              aria-checked={config.poucas_cores_pouco_texto_ativo}
              onClick={() => {
                const next = !config.poucas_cores_pouco_texto_ativo;
                document.documentElement.setAttribute("data-poucas-cores", String(next));
                localStorage.setItem("broto_poucas_cores", String(next));
                handleUpdate("poucas_cores_pouco_texto_ativo", next);
              }}
              disabled={isSaving}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
                config.poucas_cores_pouco_texto_ativo ? "bg-primary border border-primary" : "bg-surface-variant border border-outline"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow border border-outline transition-transform ${
                  config.poucas_cores_pouco_texto_ativo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Lembretes de transição */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Bell size={14} className="text-primary flex-shrink-0" />
                <p className="text-label-md text-on-surface">Lembretes suaves antes de transições</p>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Avisa discretamente 10 min antes de um evento do calendário começar.
              </p>
            </div>
            <button
              id="toggle-lembretes-transicao"
              role="switch"
              aria-checked={config.lembretes_transicao_ativo}
              onClick={() => {
                const next = !config.lembretes_transicao_ativo;
                handleUpdate("lembretes_transicao_ativo", next);
              }}
              disabled={isSaving}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
                config.lembretes_transicao_ativo ? "bg-primary border border-primary" : "bg-surface-variant border border-outline"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow border border-outline transition-transform ${
                  config.lembretes_transicao_ativo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Reduzir animações */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Minimize2 size={14} className="text-primary flex-shrink-0" />
                <p className="text-label-md text-on-surface">Reduzir animações</p>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Remove ou minimiza transições e efeitos de movimento da interface.
              </p>
            </div>
            <button
              id="toggle-reduzir-animacoes"
              role="switch"
              aria-checked={config.reduzir_animacoes_ativo}
              onClick={() => {
                const next = !config.reduzir_animacoes_ativo;
                document.documentElement.setAttribute("data-reduzir-animacoes", String(next));
                localStorage.setItem("broto_reduzir_animacoes", String(next));
                handleUpdate("reduzir_animacoes_ativo", next);
              }}
              disabled={isSaving}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
                config.reduzir_animacoes_ativo ? "bg-primary border border-primary" : "bg-surface-variant border border-outline"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow border border-outline transition-transform ${
                  config.reduzir_animacoes_ativo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sons de recompensa */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Volume2 size={14} className="text-primary flex-shrink-0" />
                <p className="text-label-md text-on-surface">Sons de recompensa</p>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Toca um sininho suave ao concluir uma task ou uma sessão de pomodoro.
              </p>
            </div>
            <button
              id="toggle-som-recompensa"
              role="switch"
              aria-checked={config.som_recompensa_ativo}
              onClick={() => {
                const next = !config.som_recompensa_ativo;
                handleUpdate("som_recompensa_ativo", next);
              }}
              disabled={isSaving}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
                config.som_recompensa_ativo ? "bg-primary border border-primary" : "bg-surface-variant border border-outline"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow border border-outline transition-transform ${
                  config.som_recompensa_ativo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Fundo do Pomodoro */}
        <div className="pt-4 border-t border-outline-variant">
          <PomodoroBackgroundSettings />
        </div>
      </SettingsSection>

      {/* Integração com Google Agenda */}
      <SettingsSection
        title={
          <span className="flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Integração com Google Agenda
          </span>
        }
        description="Sincronize seus eventos manuais do Broto com o Google Agenda, nos dois sentidos."
      >
        {googleCarregando ? (
          <div className="h-16 bg-surface-variant rounded-lg animate-pulse" />
        ) : integrado ? (
          /* Estado: Conectado */
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-surface-variant rounded-xl border border-outline-variant">
              {/* Ícone do Google Calendar */}
              <div className="w-10 h-10 rounded-full bg-primary border border-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                  <span className="text-label-md text-on-surface font-semibold truncate">
                    {emailGoogle || "Conta Google conectada"}
                  </span>
                </div>
                {conectadoEm && (
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    Conectada em{" "}
                    {new Date(conectadoEm).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                <p className="text-body-sm text-on-surface-variant">
                  Eventos manuais estão sendo sincronizados automaticamente.
                </p>
              </div>
            </div>

            {/* Botão Desconectar */}
            {showDesconectarConfirm ? (
              <div className="p-3 bg-error-container/20 rounded-xl border border-error/30 space-y-3">
                <p className="text-body-sm text-on-surface">
                  Tem certeza? Os eventos já criados permanecerão no Google Agenda, mas o Broto parará de sincronizar.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDesconectarConfirm(false)}
                    className="flex-1 px-3 py-1.5 bg-surface-variant hover:bg-surface-variant-high text-on-surface rounded-lg text-label-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => { await desconectar(); setShowDesconectarConfirm(false); }}
                    disabled={desconectando}
                    className="flex-1 px-3 py-1.5 bg-error text-on-error rounded-lg text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {desconectando ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
                    {desconectando ? "Desconectando..." : "Desconectar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDesconectarConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-outline hover:border-error hover:text-error text-on-surface-variant rounded-lg text-label-sm font-medium transition-colors"
              >
                <Unlink size={15} />
                Desconectar Google Agenda
              </button>
            )}
          </div>
        ) : (
          /* Estado: Não conectado */
          <div className="space-y-3">
            <p className="text-body-sm text-on-surface-variant">
              Ao conectar, seus eventos manuais criados no Broto aparecerão no Google Agenda — e eventos novos do Google aparecerão aqui automaticamente.
            </p>
            <p className="text-body-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">Prazos automáticos de tarefas</span> nunca são enviados ao Google.
            </p>
            <button
              id="btn-conectar-google-agenda"
              onClick={conectar}
              disabled={conectando}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary border border-primary text-on-primary rounded-xl text-label-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            >
              {conectando ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Calendar size={17} />
              )}
              {conectando ? "Aguardando autorização..." : "Conectar Google Agenda"}
            </button>
            {conectando && (
              <p className="text-body-sm text-on-surface-variant">
                Uma janela do browser foi aberta. Autorize o acesso e volte para o Broto.
              </p>
            )}
          </div>
        )}
      </SettingsSection>

      {/* Info */}
      <Card>
        <div className="flex items-center justify-center gap-2 text-label-sm text-on-surface-variant">
          <Info size={16} className="text-primary flex-shrink-0" />
          {isSaving ? t("settings.saving") : t("settings.autoSave")}
        </div>
      </Card>
    </div>
  );
};
