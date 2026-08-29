import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlocos } from "../hooks/useBlocos";
import { useTasks } from "../hooks/useTasks";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getNextOrderForPriority, getPriorityColor, getPriorityLabel } from "../utils/taskOrder";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import {
  TaskCard,
  TaskModal,
  FocusMode,
  Card,
  ConfirmModal,
  TaskPriorityGroup,
  PomodoroWidget,
  PomodoroSessionScreen,
  SkeletonLoader,
  GridContainer,
  DescricaoTexto,
  LinksBlocoSection,
} from "../components";
import type { Task, Bloco } from "../types/database";

export const BlocoDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { blocoId } = useParams<{ blocoId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { blocos } = useBlocos();
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleTask } =
    useTasks(blocoId);
  const pomodoroTimer = usePomodoroTimer();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [blocoFromDb, setBlocoFromDb] = useState<Bloco | null>(null);
  const [loadingBloco, setLoadingBloco] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [currentPomodoroTask, setCurrentPomodoroTask] = useState<Task | null>(null);
  const [isInSessionMode, setIsInSessionMode] = useState(false);
  const [isSessionMinimized, setIsSessionMinimized] = useState(false);

  // Control body overflow when in session mode
  useEffect(() => {
    if (isInSessionMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isInSessionMode]);

  // Tenta encontrar o bloco na lista primeiro, depois busca do banco
  useEffect(() => {
    const fetchBloco = async () => {
      if (!blocoId || !user) {
        setLoadingBloco(false);
        return;
      }

      const existingBloco = blocos.find((b) => b.id === blocoId);
      if (existingBloco) {
        setBlocoFromDb(existingBloco);
        setLoadingBloco(false);
        return;
      }

      // Se não encontrou na lista, busca do banco
      try {
        const { data, error: err } = await supabase
          .from("blocos")
          .select("*")
          .eq("id", blocoId)
          .eq("usuario_id", user.id)
          .single();

        if (err) throw err;
        setBlocoFromDb(data);
      } catch (err) {
        console.error("Erro ao carregar bloco:", err);
        setBlocoFromDb(null);
      } finally {
        setLoadingBloco(false);
      }
    };

    fetchBloco();
  }, [blocoId, blocos, user]);

  const bloco = blocoFromDb;

  if (!blocoId) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/galeria")}
          className="text-primary hover:underline"
        >
          {t("block.backToGallery")}
        </button>
        <Card>
          <p className="text-body-md text-error">{t("block.notFound")}</p>
        </Card>
      </div>
    );
  }

  if (loadingBloco) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/galeria")}
          className="text-primary hover:underline"
        >
          {t("block.backToGallery")}
        </button>
        <Card>
          <div className="space-y-3">
            <div className="h-8 bg-surface-variant rounded w-48 animate-pulse" />
            <div className="h-5 bg-surface-variant rounded w-96 animate-pulse" />
            <div className="space-y-2 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-variant rounded animate-pulse" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!bloco) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/galeria")}
          className="text-primary hover:underline"
        >
          {t("block.backToGallery")}
        </button>
        <Card>
          <p className="text-body-md text-error">{t("block.notFound")}</p>
        </Card>
      </div>
    );
  }

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    setIsSubmitting(true);
    try {
      // Calculate ordem automatically based on priority
      const nextOrder = getNextOrderForPriority(tasks, data.prioridade);
      await createTask({ ...data, ordem: nextOrder });
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: Parameters<typeof updateTask>[1]) => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await updateTask(selectedTask.id, data);
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleSaveFocusTime = async (timeSpent: number) => {
    if (!focusTask) return;
    try {
      await updateTask(focusTask.id, {
        tempo_gasto_minutos: focusTask.tempo_gasto_minutos + timeSpent,
      });
    } catch (err) {
      console.error("Erro ao salvar tempo:", err);
    }
  };

  const handlePomodoroUpdate = async (taskId: string, pomodoros: number | null) => {
    try {
      await updateTask(taskId, { pomodoros_estimados: pomodoros });
    } catch (err) {
      console.error("Erro ao atualizar pomodoros:", err);
    }
  };

  const handleStartPomodoro = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setCurrentPomodoroTask(task);
      setIsInSessionMode(true);
      pomodoroTimer.startPomodoro(taskId, () => {
        // Pomodoro finished - increment pomodoros_concluidos
        const pomodorosCompleted = (task.pomodoros_concluidos || 0) + 1;
        updateTask(taskId, { pomodoros_concluidos: pomodorosCompleted });
      });
    }
  };

  // Organize tasks by status
  const pendingTasks = tasks.filter((t) => t.status === "pendente");
  const inProgressTasks = tasks.filter((t) => t.status === "em_andamento");
  const completedTasks = tasks.filter((t) => t.status === "concluida");

  // Helper to organize tasks by priority
  const organizeByPriority = (taskList: Task[]) => {
    const urgent = taskList.filter((t) => t.prioridade === "urgente").sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const blocking = taskList.filter((t) => t.prioridade === "bloqueadora").sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const important = taskList.filter((t) => t.prioridade === "importante").sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const noPriority = taskList.filter((t) => !t.prioridade).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    return { urgent, blocking, important, noPriority };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/galeria")}
          className="text-primary hover:underline text-body-sm mb-4"
        >
          {t("block.backToGallery")}
        </button>
        <div>
          <div className="flex items-center gap-4">
            <div style={{
              backgroundColor: bloco.icone || "#D8ABDC",
              width: isTaskModalOpen ? 27 : 38,
              height: isTaskModalOpen ? 27 : 38,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "width 0.3s ease, height 0.3s ease"
            }} />
            <h1 className="text-headline-lg text-on-surface font-playfair">
              {bloco.nome.replace(/^#[A-F0-9]{6}\s+/, "")}
            </h1>
          </div>
          {bloco.descricao && (
            <DescricaoTexto
              texto={bloco.descricao}
              className="text-body-md text-on-surface-variant mt-2"
            />
          )}
        </div>
      </div>

      {/* Links do bloco */}
      <LinksBlocoSection blocoId={blocoId} />

      {/* Error */}
      {error && (
        <Card>
          <p className="text-body-md text-error">{error}</p>
        </Card>
      )}

      <GridContainer className="space-y-6">
        {/* Create button */}
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          className="px-6 py-3 bg-primary text-on-primary rounded-full font-medium hover:bg-primary-container transition-colors"
        >
          + {t("block.newTask")}
        </button>

        {/* Tasks sections */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader key={i} variant="task" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-headline-sm text-on-surface mb-4 font-playfair">
              {t("block.noTasksTitle")}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {t("block.noTasks")}
            </p>
          </div>
        ) : (
        <div className="space-y-8">
            {/* Em andamento (In Progress) */}
            {inProgressTasks.length > 0 && (
              <div>
                <h2 className="text-headline-sm text-on-surface mb-4 font-playfair">
                  {t("block.inProgress")} ({inProgressTasks.length})
                </h2>
                <div className="space-y-6">
                {(() => {
                  const byPriority = organizeByPriority(inProgressTasks);
                  return (
                    <>
                      <TaskPriorityGroup
                        tasks={byPriority.urgent}
                        prioridade="urgente"
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                      <TaskPriorityGroup
                        tasks={byPriority.blocking}
                        prioridade="bloqueadora"
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                      <TaskPriorityGroup
                        tasks={byPriority.important}
                        prioridade="importante"
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                      <TaskPriorityGroup
                        tasks={byPriority.noPriority}
                        prioridade={null}
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                    </>
                  );
                })()}
                </div>
              </div>
            )}

            {/* Pendente */}
            {pendingTasks.length > 0 && (
              <div>
                <h2 className="text-headline-sm text-on-surface mb-4 font-playfair">
                  {t("block.pending")} ({pendingTasks.length})
                </h2>
                <div className="space-y-6">
                {(() => {
                  const byPriority = organizeByPriority(pendingTasks);
                  return (
                    <>
                      <TaskPriorityGroup
                        tasks={byPriority.urgent}
                        prioridade="urgente"
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                      <TaskPriorityGroup
                        tasks={byPriority.blocking}
                        prioridade="bloqueadora"
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                      <TaskPriorityGroup
                        tasks={byPriority.important}
                        prioridade="importante"
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                      <TaskPriorityGroup
                        tasks={byPriority.noPriority}
                        prioridade={null}
                        onToggle={(id, status) => toggleTask(id, status)}
                        onEdit={(task) => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onFocus={setFocusTask}
                        onStartPomodoro={handleStartPomodoro}
                        onPomodoroUpdate={handlePomodoroUpdate}
                      />
                    </>
                  );
                })()}
                </div>
              </div>
            )}

            {/* Concluída (Completed) - Collapsible */}
            {completedTasks.length > 0 && (
              <div>
                <button
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="flex items-center gap-2 text-headline-sm text-on-surface-variant mb-4 font-playfair hover:text-on-surface transition-colors"
                >
                  {isCompletedExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  {t("block.completed")} ({completedTasks.length})
                </button>
                {isCompletedExpanded && (
                  <div className="space-y-6">
                  {(() => {
                    const byPriority = organizeByPriority(completedTasks);
                    return (
                      <>
                        <TaskPriorityGroup
                          tasks={byPriority.urgent}
                          prioridade="urgente"
                          onToggle={(id, status) => toggleTask(id, status)}
                          onEdit={(task) => {
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                        <TaskPriorityGroup
                          tasks={byPriority.blocking}
                          prioridade="bloqueadora"
                          onToggle={(id, status) => toggleTask(id, status)}
                          onEdit={(task) => {
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                        <TaskPriorityGroup
                          tasks={byPriority.important}
                          prioridade="importante"
                          onToggle={(id, status) => toggleTask(id, status)}
                          onEdit={(task) => {
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                        <TaskPriorityGroup
                          tasks={byPriority.noPriority}
                          prioridade={null}
                          onToggle={(id, status) => toggleTask(id, status)}
                          onEdit={(task) => {
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            )}
        </div>
        )}
      </GridContainer>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        initialTask={selectedTask || undefined}
        blocoId={blocoId}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        loading={isSubmitting}
      />

      {/* Focus Mode */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          onClose={() => setFocusTask(null)}
          onSave={handleSaveFocusTime}
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
        }}
        title={t("block.deleteConfirm")}
        message={t("block.deleteConfirm")}
      />

      {/* Pomodoro Session Screen (Fullscreen) */}
      {isInSessionMode && !isSessionMinimized && (
        <PomodoroSessionScreen
          onCompleteTask={() => {
            if (currentPomodoroTask) {
              updateTask(currentPomodoroTask.id, { status: "concluida" });
              setIsInSessionMode(false);
              pomodoroTimer.stop();
            }
          }}
          onMinimize={() => setIsSessionMinimized(true)}
          isActive={pomodoroTimer.state.isActive}
          isPaused={pomodoroTimer.state.isPaused}
          timeRemaining={pomodoroTimer.state.timeRemaining}
          totalTime={pomodoroTimer.state.totalTime}
          isBreakTime={pomodoroTimer.state.isBreakTime}
          taskTitle={currentPomodoroTask?.titulo}
          taskId={currentPomodoroTask?.id}
          currentTask={currentPomodoroTask}
          blocTasks={tasks.filter(t => t.bloco_id === currentPomodoroTask?.bloco_id && t.status !== "concluida")}
          onPause={pomodoroTimer.pause}
          onResume={pomodoroTimer.resume}
          onClose={() => {
            setIsInSessionMode(false);
            pomodoroTimer.stop();
          }}
          totalFocusToday={0} // TODO: Calculate from tasks
        />
      )}

      {/* Pomodoro Timer Widget (shown when minimized or normal) */}
      {isInSessionMode && isSessionMinimized && (
        <PomodoroWidget
          isActive={pomodoroTimer.state.isActive}
          isPaused={pomodoroTimer.state.isPaused}
          timeRemaining={pomodoroTimer.state.timeRemaining}
          totalTime={pomodoroTimer.state.totalTime}
          isBreakTime={pomodoroTimer.state.isBreakTime}
          onPause={pomodoroTimer.pause}
          onResume={pomodoroTimer.resume}
          onStop={() => {
            pomodoroTimer.stop();
            setCurrentPomodoroTask(null);
            setIsInSessionMode(false);
            setIsSessionMinimized(false);
          }}
          onMaximize={() => setIsSessionMinimized(false)}
          taskTitle={currentPomodoroTask?.titulo}
        />
      )}
    </div>
  );
};
