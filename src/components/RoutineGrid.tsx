import React, { useState } from "react";
import { useConfiguracoes } from "../hooks/useConfiguracoes";
import { Plus, X } from "lucide-react";
import { Card } from "./Card";

const COLORS = [
  "#E76F51", "#2A9D8F", "#457B9D", "#8338EC", "#F15BB5", 
  "#F4A261", "#E9C46A", "#264653", "#1D3557", "#D90429"
];

const DAYS_OF_WEEK = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const RoutineGrid: React.FC = () => {
  const { config, updateConfig } = useConfiguracoes();
  
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(COLORS[0]);

  if (!config) return null;

  const startHourStr = config.horario_inicio_dia || "08:00";
  const endHourStr = config.horario_fim_dia || "18:00";
  const interval = config.intervalo_rotina_minutos || 60;
  const tags = config.tags_rotina_semanal || {};

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const startTimeMin = parseTime(startHourStr);
  let endTimeMin = parseTime(endHourStr);
  if (endTimeMin <= startTimeMin) endTimeMin += 24 * 60; // handles ending on next day

  const timeSlots = [];
  for (let current = startTimeMin; current < endTimeMin; current += interval) {
    const h = Math.floor((current % (24 * 60)) / 60);
    const m = current % 60;
    timeSlots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }

  const handleSaveTag = async () => {
    if (editingDay === null) return;
    
    const newTags = { ...tags };
    if (tagName.trim() === "") {
      delete newTags[editingDay];
    } else {
      newTags[editingDay] = { nome: tagName.trim(), cor: tagColor };
    }
    
    try {
      await updateConfig({ tags_rotina_semanal: newTags });
      setEditingDay(null);
    } catch (err) {
      console.error("Erro ao salvar tag:", err);
    }
  };

  const openEditor = (dayIndex: number) => {
    setEditingDay(dayIndex);
    const existing = tags[dayIndex];
    if (existing) {
      setTagName(existing.nome);
      setTagColor(existing.cor);
    } else {
      setTagName("");
      setTagColor(COLORS[0]);
    }
  };

  return (
    <Card className="mt-8 flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-headline-sm text-on-surface font-playfair">Quadro de Rotina</h2>
      </div>

      <div className="overflow-x-auto border border-outline-variant rounded-lg bg-surface">
        <div className="min-w-[800px]">
          {/* Header row with Days and Tags */}
          <div className="flex border-b border-outline-variant bg-surface-container-low">
            <div className="w-20 flex-shrink-0 border-r border-outline-variant" /> {/* Empty corner */}
            {DAYS_OF_WEEK.map((day, index) => {
              const tag = tags[index];
              return (
                <div key={index} className="flex-1 flex flex-col min-w-0 border-r border-outline-variant last:border-r-0 p-2">
                  <span className="text-label-sm font-semibold text-center text-on-surface mb-2">{day}</span>
                  
                  {/* Tag Area */}
                  {tag ? (
                    <div 
                      onClick={() => openEditor(index)}
                      className="group cursor-pointer mx-auto max-w-full inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium truncate bg-opacity-20 hover:bg-opacity-30 transition-all border"
                      style={{ 
                        backgroundColor: `${tag.cor}22`,
                        borderColor: `${tag.cor}44`,
                        color: tag.cor
                      }}
                      title="Editar palavra-chave"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.cor }} />
                      <span className="truncate">{tag.nome}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openEditor(index)}
                      className="mx-auto flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary-container transition-all"
                      title="Adicionar palavra-chave"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="bg-surface relative">
            {timeSlots.map((time, i) => (
              <div key={i} className="flex border-b border-outline-variant last:border-b-0 group">
                <div className="w-20 flex-shrink-0 border-r border-outline-variant p-2 flex items-start justify-end">
                  <span className="text-label-xs text-on-surface-variant -mt-2 bg-surface px-1">{time}</span>
                </div>
                {DAYS_OF_WEEK.map((_, dayIndex) => (
                  <div 
                    key={dayIndex} 
                    className="flex-1 border-r border-outline-variant last:border-r-0 h-12 transition-colors hover:bg-surface-container-lowest"
                  >
                    {/* Empty cell for now. Drag and drop can be added here later. */}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tag Editor Modal */}
      {editingDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-surface rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md text-on-surface">Palavra-chave - {DAYS_OF_WEEK[editingDay]}</h3>
              <button onClick={() => setEditingDay(null)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">Palavra-chave (vazio para remover)</label>
                <input
                  type="text"
                  value={tagName}
                  onChange={e => setTagName(e.target.value)}
                  placeholder="Ex: Estudos POO"
                  className="w-full px-3 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-label-sm text-on-surface-variant mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setTagColor(c)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                        tagColor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingDay(null)}
                  className="px-4 py-2 text-label-md text-on-surface hover:bg-surface-variant rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTag}
                  className="px-4 py-2 bg-primary text-on-primary text-label-md font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
