import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { useBlocosDoDia } from "../hooks/useBlocosDoDia";
import { useBlocos } from "../hooks/useBlocos";
import { useLanguage } from "../contexts/LanguageContext";
import { Card, TaskPriorityGroup, TaskModal, ConfirmModal } from "../components";
import type { Task } from "../types/database";
import { organizeByPriority } from "./DashboardPage"; // We'll export this or define it locally

export const HojePage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { tasks, updateTask, createTask, toggleTask, deleteTask, loading: tasksLoading } = useTasks();
  const { blocosDoDia } = useBlocosDoDia();
  const { blocos } = useBlocos();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  
  const todayTasks = useMemo(() => {
    const blocosDoDiaIds = new Set(blocosDoDia.map((b) => b.bloco_id));
    return tasks.filter(
      (t) =>
        (!t.prazo_data || t.prazo_data === today) &&
        t.status !== "concluida" &&
        blocosDoDiaIds.has(t.bloco_id)
    );
  }, [tasks, today, blocosDoDia]);

  const byPriority = organizeByPriority(todayTasks);

  const geralBloco = useMemo(() => {
    return blocos.find((b) => b.nome === "Geral" || b.nome === "General");
  }, [blocos]);

  const handleCreateTask = async (taskData: Omit<Task, "id" | "usuario_id" | "criado_em" | "atualizado_em">) => {
    try {
      await createTask({
        ...taskData,
        prazo_data: today,
      });
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar task:", err);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Omit<Task, "id" | "usuario_id" | "criado_em" | "atualizado_em">>) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, taskData);
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Erro ao atualizar task:", err);
    }
  };

  const dateFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: language === "en" ? enUS : ptBR });
  // Capitalize first letter
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-display-sm text-on-surface font-playfair">Hoje</h1>
          <p className="text-body-lg text-on-surface-variant capitalize">{capitalizedDate}</p>
        </div>
      </div>

      <Card className="flex-1 overflow-auto">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-6">
          <h2 className="text-headline-sm text-on-surface font-playfair">
            {t("dashboard.title")} ({todayTasks.length})
          </h2>
          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="font-medium text-sm hidden sm:inline">Nova Tarefa</span>
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-body-lg text-on-surface-variant mb-4">
              {t("dashboard.noTasksToday")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <TaskPriorityGroup
              tasks={byPriority.urgent}
              prioridade="urgente"
              onToggle={(id, status) => toggleTask(id, status)}
              onEdit={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onDelete={setTaskToDelete}
            />
            <TaskPriorityGroup
              tasks={byPriority.blocking}
              prioridade="bloqueadora"
              onToggle={(id, status) => toggleTask(id, status)}
              onEdit={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onDelete={setTaskToDelete}
            />
            <TaskPriorityGroup
              tasks={byPriority.important}
              prioridade="importante"
              onToggle={(id, status) => toggleTask(id, status)}
              onEdit={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onDelete={setTaskToDelete}
            />
            <TaskPriorityGroup
              tasks={byPriority.noPriority}
              prioridade={null}
              onToggle={(id, status) => toggleTask(id, status)}
              onEdit={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onDelete={setTaskToDelete}
            />
          </div>
        )}
      </Card>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          initialTask={selectedTask || undefined}
          blocoId={selectedTask?.bloco_id || (blocosDoDia.length > 0 ? blocosDoDia[0].bloco_id : geralBloco?.id) || "temp-id"}
          loading={tasksLoading}
        />
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (taskToDelete) {
            try {
              await deleteTask(taskToDelete);
            } catch (err) {
              console.error("Erro ao deletar task:", err);
            }
          }
          setTaskToDelete(null);
        }}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />
    </div>
  );
};
