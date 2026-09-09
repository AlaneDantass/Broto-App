import React, { useState } from "react";
import { useConfiguracoes } from "../hooks/useConfiguracoes";
import { Plus, X, Trash2 } from "lucide-react";
import { Card } from "./Card";
import type { EventoRotina } from "../types/database";

const COLORS = [
  "#E76F51", "#2A9D8F", "#457B9D", "#8338EC", "#F15BB5", 
  "#F4A261", "#E9C46A", "#264653", "#1D3557", "#D90429"
];

const DAYS_OF_WEEK = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface Selection {
  day: number;
  startMin: number;
  endMin: number;
}

export const RoutineGrid: React.FC = () => {
  const { config, updateConfig } = useConfiguracoes();
  
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(COLORS[0]);

  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ day: number, min: number } | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{ day: number, min: number } | null>(null);
  
  const [editingEvent, setEditingEvent] = useState<Partial<EventoRotina> | null>(null);

  if (!config) return null;

  const startHourStr = config.horario_inicio_dia || "08:00";
  const endHourStr = config.horario_fim_dia || "18:00";
  const interval = config.intervalo_rotina_minutos || 60;
  const tags = config.tags_rotina_semanal || {};
  const eventos: EventoRotina[] = config.eventos_rotina_semanal || [];

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const startTimeMin = parseTime(startHourStr);
  let endTimeMin = parseTime(endHourStr);
  if (endTimeMin <= startTimeMin) endTimeMin += 24 * 60; 

  const timeSlots: string[] = [];
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

  const openTagEditor = (dayIndex: number) => {
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

  const handleMouseDown = (day: number, min: number, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setIsDragging(true);
      setSelectionStart({ day, min });
      setSelectionCurrent({ day, min });
    } else {
      setIsDragging(true);
      setSelectionStart({ day, min });
      setSelectionCurrent({ day, min });
    }
  };

  const handleMouseEnter = (day: number, min: number) => {
    if (isDragging && selectionStart) {
      if (day === selectionStart.day) {
        setSelectionCurrent({ day, min });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectionStart && selectionCurrent) {
      setIsDragging(false);
      const start = Math.min(selectionStart.min, selectionCurrent.min);
      const end = Math.max(selectionStart.min, selectionCurrent.min);
      
      setEditingEvent({
        dia: selectionStart.day,
        inicio_minutos: start,
        fim_minutos: end,
        titulo: "",
        cor: COLORS[0]
      });
      
      setSelectionStart(null);
      setSelectionCurrent(null);
    }
  };

  const handleSaveEvent = async () => {
    if (!editingEvent || !editingEvent.titulo?.trim()) return;
    
    let newEvents = [...eventos];
    if (editingEvent.id) {
      newEvents = newEvents.map(e => e.id === editingEvent.id ? editingEvent as EventoRotina : e);
    } else {
      newEvents.push({
        ...editingEvent,
        id: crypto.randomUUID()
      } as EventoRotina);
    }
    
    try {
      await updateConfig({ eventos_rotina_semanal: newEvents });
      setEditingEvent(null);
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const newEvents = eventos.filter(e => e.id !== id);
    try {
      await updateConfig({ eventos_rotina_semanal: newEvents });
      setEditingEvent(null);
    } catch (err) {
      console.error("Erro ao remover evento:", err);
    }
  };

  const openEventEditor = (evento: EventoRotina, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(evento);
  };

  const getTop = (min: number) => ((min - startTimeMin) / interval) * 58;
  const getHeight = (start: number, end: number) => ((end - start + interval) / interval) * 58;

  const renderSelectionForDay = (day: number) => {
    if (!selectionStart || !selectionCurrent || selectionStart.day !== day) return null;
    const start = Math.min(selectionStart.min, selectionCurrent.min);
    const end = Math.max(selectionStart.min, selectionCurrent.min);
    
    return (
      <div 
        className="absolute left-1 right-1 bg-primary/20 border-2 border-primary/50 rounded-md pointer-events-none"
        style={{
          top: `${getTop(start)}px`,
          height: `${getHeight(start, end)}px`,
          zIndex: 5
        }}
      />
    );
  };

  return (
    <Card className="mt-8 flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-headline-sm text-on-surface font-playfair">Quadro de Rotina</h2>
        <p className="text-label-sm text-on-surface-variant">Clique ou arraste para adicionar atividades</p>
      </div>

      <div className="overflow-x-auto border border-outline-variant rounded-lg bg-surface relative select-none">
        <div className="min-w-[800px]">
          {/* Header row with Days and Tags */}
          <div className="flex border-b border-outline-variant bg-surface-container-low sticky top-0 z-10">
            <div className="w-16 flex-shrink-0 border-r border-outline-variant" /> 
            {DAYS_OF_WEEK.map((day, index) => {
              const tag = tags[index];
              return (
                <div key={index} className="flex-1 flex flex-col min-w-0 border-r border-outline-variant last:border-r-0 p-2 items-center justify-center">
                  <span className="text-label-sm font-semibold text-center text-on-surface mb-2">{day}</span>
                  
                  {tag ? (
                    <div 
                      onClick={() => openTagEditor(index)}
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
                      onClick={() => openTagEditor(index)}
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

          {/* Time Grid Wrapper */}
          <div 
            className="flex relative" 
            onMouseLeave={handleMouseUp} 
            onMouseUp={handleMouseUp}
          >
            {/* Time labels column */}
            <div className="w-16 flex-shrink-0 border-r border-outline-variant flex flex-col">
              {timeSlots.map((time, i) => (
                <div key={i} className="h-[58px] border-b border-outline-variant p-2 flex items-center justify-end">
                  <span className="text-[10px] font-medium text-on-surface-variant bg-surface px-1">{time}</span>
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            {DAYS_OF_WEEK.map((_, dayIndex) => {
              const dayEvents = eventos.filter(e => e.dia === dayIndex);
              
              return (
                <div key={dayIndex} className="flex-1 relative border-r border-outline-variant last:border-r-0">
                  {/* Grid Cells (Rows) */}
                  {timeSlots.map((_, timeIdx) => {
                    const cellTimeMin = startTimeMin + timeIdx * interval;
                    return (
                      <div 
                        key={timeIdx} 
                        className="h-[58px] border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
                        onMouseDown={(e) => handleMouseDown(dayIndex, cellTimeMin, e)}
                        onMouseEnter={() => handleMouseEnter(dayIndex, cellTimeMin)}
                      />
                    )
                  })}

                  {/* Render Events */}
                  {dayEvents.map(evento => {
                    const top = getTop(evento.inicio_minutos);
                    const height = getHeight(evento.inicio_minutos, evento.fim_minutos);
                    if (top < 0 || top > timeSlots.length * 58) return null;
                    
                    return (
                      <div
                        key={evento.id}
                        onClick={(e) => openEventEditor(evento, e)}
                        className="absolute left-1 right-1 rounded p-1 cursor-pointer overflow-hidden border transition-transform hover:scale-[1.02] shadow-sm flex items-center justify-center"
                        style={{
                          top: `${top + 2}px`,
                          height: `${height - 4}px`,
                          backgroundColor: `${evento.cor}15`,
                          borderColor: `${evento.cor}40`,
                          zIndex: 10
                        }}
                      >
                        <span 
                          className="text-xs font-semibold px-1.5 py-0.5 rounded text-center truncate w-full"
                          style={{ backgroundColor: evento.cor, color: "#fff" }}
                        >
                          {evento.titulo}
                        </span>
                      </div>
                    )
                  })}

                  {/* Render Selection */}
                  {renderSelectionForDay(dayIndex)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tag Editor Modal */}
      {editingDay !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
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

      {/* Routine Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in" onMouseDown={() => setEditingEvent(null)}>
          <div className="bg-surface rounded-xl shadow-xl p-6 w-full max-w-sm" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md text-on-surface">{editingEvent.id ? "Editar Atividade" : "Nova Atividade"}</h3>
              <button onClick={() => setEditingEvent(null)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1">O que você fará neste horário?</label>
                <input
                  type="text"
                  value={editingEvent.titulo || ""}
                  onChange={e => setEditingEvent({ ...editingEvent, titulo: e.target.value })}
                  placeholder="Ex: Treino, Reunião, Foco"
                  className="w-full px-3 py-2 bg-surface border border-outline rounded-lg text-body-md text-on-surface focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-label-sm text-on-surface-variant mb-2">Cor da Atividade</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditingEvent({ ...editingEvent, cor: c })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                          editingEvent.cor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                {editingEvent.id ? (
                  <button
                    onClick={() => handleDeleteEvent(editingEvent.id!)}
                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    title="Excluir atividade"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 text-label-md text-on-surface hover:bg-surface-variant rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={!editingEvent.titulo?.trim()}
                    className="px-4 py-2 bg-primary text-on-primary text-label-md font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
