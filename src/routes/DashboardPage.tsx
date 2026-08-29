import React, { useMemo, useState } from "react";
import { useBlocos } from "../hooks/useBlocos";
import { useTasks } from "../hooks/useTasks";
import { useEventosCalendario } from "../hooks/useEventosCalendario";
import { Card, TaskModal, EventoModal } from "../components";
import { Clock, Plus } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Task } from "../types/database";

export const DashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { blocos } = useBlocos();
  const { tasks, updateTask, createTask, loading: tasksLoading } = useTasks();
  const { eventos } = useEventosCalendario();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const today = useMemo(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }, []);

  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }, []);

  // Task ativa
  const activeTask = useMemo(
    () => tasks.find((t) => t.status === "em_andamento"),
    [tasks]
  );

  // Tasks de hoje
  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.prazo_data === today &&
          t.status !== "concluida"
      ),
    [tasks, today]
  );

  // Eventos de hoje
  const todayEventos = useMemo(
    () => eventos.filter((e) => e.data === today),
    [eventos, today]
  );

  // Blocos ativos (últimos 3 usados)
  const activeBlocos = useMemo(() => {
    return blocos.slice(0, 3);
  }, [blocos]);

  // Estatísticas de ontem
  const yesterdayStats = useMemo(() => {
    const yesterdayTasks = tasks.filter((t) => t.criado_em?.startsWith(yesterday));
    const completed = yesterdayTasks.filter((t) => t.status === "concluida").length;
    const total = yesterdayTasks.length;
    return { completed, incomplete: total - completed, total };
  }, [tasks, yesterday]);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "concluida" ? "pendente" : "concluida";
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error("Erro ao atualizar task:", err);
    }
  };

  const geralBloco = useMemo(() => {
    return blocos.find((b) => b.nome === "Geral" || b.nome === "General");
  }, [blocos]);

  const handleCreateTask = async (taskData: Omit<Task, "id" | "usuario_id" | "criado_em" | "atualizado_em">) => {
    try {
      let targetBlocoId = taskData.bloco_id;
      if (targetBlocoId === "temp-id") {
        if (!user) return;
        
        // Safety double-check to avoid duplicate Geral block creation
        const { data: existing } = await supabase
          .from("blocos")
          .select("id")
          .eq("usuario_id", user.id)
          .eq("nome", "Geral")
          .maybeSingle();

        if (existing) {
          targetBlocoId = existing.id;
        } else {
          const { data, error } = await supabase
            .from("blocos")
            .insert({
              usuario_id: user.id,
              nome: "Geral",
              descricao: language === "en" ? "Global Tasks" : "Tarefas Gerais",
              categoria: "Personal",
              icone: "📌",
              ativo: true,
            })
            .select()
            .single();

          if (error) throw error;
          targetBlocoId = data.id;
        }
      }

      await createTask({
        ...taskData,
        bloco_id: targetBlocoId,
        prazo_data: today,
      });
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar task global:", err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Active Task Card */}
      {activeTask ? (
        <Card>
          <div className="flex items-center gap-4">
            <Clock size={24} className="text-primary" />
            <div className="flex-1">
              <p className="text-label-md text-on-surface-variant mb-1">
                {t("dashboard.activeTask")}
              </p>
              <h2 className="text-headline-sm text-on-surface font-medium">
                {activeTask.titulo}
              </h2>
              <p className="text-label-sm text-on-surface-variant mt-1">
                {blocos.find((b) => b.id === activeTask.bloco_id)?.nome ||
                  (language === "en" ? "No block" : "Sem bloco")}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-headline-sm text-on-surface mb-2 font-playfair">
              {t("dashboard.noActiveTask")}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {t("dashboard.chooseTask")}
            </p>
          </div>
        </Card>
      )}

      {/* Two Column Layout: Today's Tasks + Events inside a unified Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Today's Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h2 className="text-headline-sm text-on-surface font-playfair">
                {t("dashboard.title")}
              </h2>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="p-1 hover:bg-surface-container-high rounded transition-colors text-primary"
                title={language === "en" ? "Add Task" : "Criar Tarefa"}
              >
                <Plus size={20} />
              </button>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant italic py-1">
                {t("dashboard.noTasksToday")}
              </p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className="flex items-center gap-3 p-3 bg-surface hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors border border-outline-variant group"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                      {task.status === "concluida" ? (
                        <div className="w-5 h-5 rounded border-2 border-[#6B705C] bg-[#6B705C]" />
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-[#A5A58D]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-body-sm ${
                          task.status === "concluida"
                            ? "line-through text-on-surface-variant"
                            : "text-on-surface"
                        }`}
                      >
                        {task.titulo}
                      </p>
                      <p className="text-label-xs text-on-surface-variant">
                        {blocos.find((b) => b.id === task.bloco_id)?.nome}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h2 className="text-headline-sm text-on-surface font-playfair">
                {t("dashboard.appointments")}
              </h2>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(true)}
                className="p-1 hover:bg-surface-container-high rounded transition-colors text-primary"
                title={language === "en" ? "Add Event" : "Criar Evento"}
              >
                <Plus size={20} />
              </button>
            </div>
            {todayEventos.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant italic py-1">
                {t("dashboard.noAppointments")}
              </p>
            ) : (
              <div className="space-y-2">
                {todayEventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="p-3 bg-surface rounded-lg border border-outline-variant border-l-4 border-primary"
                  >
                    <p className="text-body-sm text-on-surface font-medium">
                      {evento.titulo}
                    </p>
                    {evento.hora && (
                      <p className="text-label-sm text-on-surface-variant mt-1">
                        {evento.hora.slice(0, 5)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Active Blocks */}
      <div>
        <h2 className="text-headline-sm text-on-surface mb-4 font-playfair">
          {t("dashboard.activeBlocks")}
        </h2>
        {activeBlocos.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            {t("dashboard.noActiveBlocks")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBlocos.map((bloco) => {
              const blocoTasks = tasks.filter((t) => t.bloco_id === bloco.id);
              const completedTasks = blocoTasks.filter(
                (t) => t.status === "concluida"
              ).length;
              const progress =
                blocoTasks.length > 0
                  ? Math.round((completedTasks / blocoTasks.length) * 100)
                  : 0;

              return (
                <a
                  key={bloco.id}
                  href={`/bloco/${bloco.id}`}
                  className="p-4 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant"
                >
                  <div className="text-headline-sm text-on-surface mb-2 font-medium">
                    {bloco.nome}
                  </div>
                  <div className="space-y-2">
                    <p className="text-label-sm text-on-surface-variant">
                      {blocoTasks.length} {t("dashboard.tasks")}
                    </p>
                    <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-label-xs text-on-surface-variant">
                      {progress}% {t("gallery.completed")}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Yesterday Summary */}
      <Card>
        <h3 className="text-headline-sm text-on-surface mb-4 font-playfair">
          {language === "en" ? "Yesterday" : "Ontem"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-headline-md text-primary font-bold">
              {yesterdayStats.completed}
            </p>
            <p className="text-label-sm text-on-surface-variant">{t("block.completed")}</p>
          </div>
          <div>
            <p className="text-headline-md text-on-surface-variant font-bold">
              {yesterdayStats.incomplete}
            </p>
            <p className="text-label-sm text-on-surface-variant">
              {language === "en" ? "Incomplete" : "Incompletas"}
            </p>
          </div>
        </div>
      </Card>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          blocoId={geralBloco?.id || "temp-id"}
          loading={tasksLoading}
        />
      )}

      {isEventModalOpen && (
        <EventoModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
        />
      )}
    </div>
  );
};

