import { memo, useState, useEffect } from "react";
import { 
  Box, 
  Divider, 
  Stack, 
  Typography, 
  IconButton, 
  TextField, 
  Button,
  Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import { Project, Stage } from "../types";
import { GanttChart } from "./GanttChart";
import { StageCard } from "./StageCard";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import { LeaveProjectDialog } from "./LeaveProjectDialog";
import { inviteToProject, updateProjectName, deleteProject, leaveProject } from "../api/projects";
import { useAuth } from "../auth/AuthContext";

const canAdvance = (stages: Stage[], target: Stage) => {
  const prev = stages.find((s) => s.order === target.order - 1);
  return !prev || prev.status === "done";
};

interface Props {
  project: Project;
  onUpdate: () => Promise<void>;
  onDelete: () => Promise<void>;
}

const ProjectDetailComponent = ({ project, onUpdate, onDelete }: Props) => {
  const { user } = useAuth();
  const isAdmin = project.myRole === "admin";
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviting, setInviting] = useState(false);
  
  // Автоматическое обновление проекта каждые 30 секунд (только если вкладка активна)
  useEffect(() => {
    let intervalId: number | undefined;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Вкладка неактивна - останавливаем обновление
        if (intervalId) clearInterval(intervalId);
      } else {
        // Вкладка активна - запускаем обновление
        intervalId = setInterval(() => {
          onUpdate().catch(console.error);
        }, 30000); // 30 секунд
      }
    };
    
    // Запускаем обновление если вкладка активна
    if (!document.hidden) {
      intervalId = setInterval(() => {
        onUpdate().catch(console.error);
      }, 30000);
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onUpdate]);

  // Синхронизируем название с пропсами
  useEffect(() => {
    if (!isEditingName) {
      setProjectName(project.name);
    }
  }, [project.name, isEditingName]);

  const handleSaveName = async () => {
    if (!projectName.trim()) {
      alert("Название проекта не может быть пустым");
      return;
    }
    const newName = projectName.trim();
    setSaving(true);
    setIsEditingName(false);
    try {
      // Оптимистичное обновление - сразу применяем изменения
      await updateProjectName(project.id, newName);
      // Тихая синхронизация без дергания
      await onUpdate();
    } catch (err) {
      console.error("Failed to update project name:", err);
      setProjectName(project.name);
      setIsEditingName(true);
      alert("Не удалось обновить название проекта. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    const u = inviteUsername.trim();
    if (!u) return;
    setInviting(true);
    try {
      await inviteToProject(project.id, u, "executor");
      setInviteUsername("");
      alert(`Пользователь @${u} приглашён в проект`);
    } catch (err: any) {
      console.error("Failed to invite:", err);
      alert(err?.response?.data?.message || "Не удалось пригласить пользователя");
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      await onDelete();
    } catch (err) {
      console.error("Failed to delete project:", err);
      throw err;
    }
  };

  const handleLeave = async () => {
    try {
      await leaveProject(project.id);
      await onDelete(); // Удаляем проект из списка
    } catch (err: any) {
      console.error("Failed to leave project:", err);
      throw err; // Пробрасываем ошибку в диалог
    }
  };

  return (
    <>
    <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s ease-in-out"
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 3, gap: 1 }}
          >
            {isEditingName ? (
              <>
                <TextField
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  autoFocus
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Сохранить">
                  <IconButton
                    color="primary"
                    onClick={handleSaveName}
                    disabled={saving}
                    sx={{
                      transition: "all 0.2s ease-in-out",
                      "&:hover:not(:disabled)": {
                        transform: "scale(1.1)"
                      }
                    }}
                  >
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Отмена">
                  <IconButton
                    onClick={() => {
                      setProjectName(project.name);
                      setIsEditingName(false);
                    }}
                    disabled={saving}
                    sx={{
                      transition: "all 0.2s ease-in-out",
                      "&:hover:not(:disabled)": {
                        transform: "scale(1.1)"
                      }
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ flex: 1, wordBreak: "break-word" }}>
                  {project.name}
                </Typography>
                {isAdmin && (
                  <>
                    <Tooltip title="Редактировать название">
                      <IconButton
                        size="small"
                        onClick={() => setIsEditingName(true)}
                        sx={{
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.1)"
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить проект">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                        sx={{
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.1)"
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </>
            )}
          </Stack>

          {isAdmin && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 3 }}>
              <TextField
                label="Пригласить по никнейму"
                placeholder="например: alex_123"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                size="small"
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleInvite}
                disabled={inviting || !inviteUsername.trim()}
              >
                {inviting ? "Приглашаем..." : "Пригласить"}
              </Button>
            </Stack>
          )}

          {!isAdmin && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setLeaveDialogOpen(true)}
              sx={{ mb: 3 }}
            >
              Покинуть проект
            </Button>
          )}

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Этапы
      </Typography>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {project.stages.map((stage) => (
          <StageCard
            key={stage.id}
            projectId={project.id}
            stage={stage}
            canComplete={
              canAdvance(project.stages, stage) &&
              stage.status === "in_progress"
            }
            onUpdate={onUpdate}
            isAdmin={isAdmin}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Диаграмма Ганта
      </Typography>
      <GanttChart project={project} />
    </Box>
    <ProjectDeleteDialog
    open={deleteDialogOpen}
    projectName={project.name}
    onClose={() => setDeleteDialogOpen(false)}
    onConfirm={handleDelete}
  />
  <LeaveProjectDialog
    open={leaveDialogOpen}
    projectName={project.name}
    onClose={() => setLeaveDialogOpen(false)}
    onConfirm={handleLeave}
  />
  </>
  );
};

export const ProjectDetail = memo(ProjectDetailComponent, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации ре-рендеров
  // Возвращает true если НЕ нужно перерисовывать (пропсы одинаковые)
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.name === nextProps.project.name &&
    JSON.stringify(prevProps.project.stages) === JSON.stringify(nextProps.project.stages)
  );
});

ProjectDetail.displayName = "ProjectDetail";

