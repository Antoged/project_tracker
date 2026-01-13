import { useState, useEffect, memo } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Fade,
  useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { Stage } from "../types";
import dayjs from "dayjs";
import { updateStageNotes, updateStageStatus, updateStageTitle, deleteStage } from "../api/projects";
import { StageDeleteDialog } from "./StageDeleteDialog";

const statusLabel = (status: Stage["status"]) => {
  switch (status) {
    case "done":
      return "Готово";
    case "in_progress":
      return "В работе";
    default:
      return "Заблокировано";
  }
};

const statusColor = (status: Stage["status"]) => {
  switch (status) {
    case "done":
      return "success";
    case "in_progress":
      return "info";
    default:
      return "default";
  }
};

interface Props {
  projectId: string;
  stage: Stage;
  canComplete: boolean;
  onUpdate: () => Promise<void>;
  isAdmin?: boolean;
}

const StageCardComponent = ({ projectId, stage, canComplete, onUpdate, isAdmin }: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(stage.notes || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(stage.title || "");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Локальное состояние для плавной анимации прогресс-бара
  const [animatingProgress, setAnimatingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(stage.status === "done" ? 100 : stage.status === "in_progress" ? 50 : 5);

  // Синхронизируем локальное состояние с пропсами
  useEffect(() => {
    setNotes(stage.notes || "");
    setTitle(stage.title || "");
    // Обновляем прогресс только если не идёт анимация
    if (!animatingProgress) {
      setProgressValue(stage.status === "done" ? 100 : stage.status === "in_progress" ? 50 : 5);
    }
  }, [stage.notes, stage.title, stage.status, animatingProgress]);

  const handleSaveTitle = async () => {
    const next = title.trim();
    if (!next) {
      alert("Название этапа не может быть пустым");
      return;
    }
    setSaving(true);
    setIsEditingTitle(false);
    try {
      await updateStageTitle(projectId, stage.id, next);
      await onUpdate();
    } catch (err) {
      console.error("Failed to save title:", err);
      setTitle(stage.title || "");
      setIsEditingTitle(true);
      alert("Не удалось обновить название этапа. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    setIsEditingNotes(false);
    try {
      await updateStageNotes(projectId, stage.id, notes);
      // Тихая синхронизация
      await onUpdate();
    } catch (err) {
      console.error("Failed to save notes:", err);
      setNotes(stage.notes || "");
      setIsEditingNotes(true);
      alert("Не удалось сохранить комментарии. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!canComplete) return;
    setCompleting(true);
    setAnimatingProgress(true);
    
    // Плавная анимация прогресс-бара от 50% до 100% и изменение цвета
    const animateProgress = () => {
      const startValue = 50;
      const endValue = 100;
      const duration = 1000; // 1 секунда
      const startTime = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        setProgressValue(startValue + (endValue - startValue) * easeOutCubic);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setProgressValue(100);
        }
      };
      animate();
    };
    
    // Запускаем анимацию
    animateProgress();
    
    try {
      // Ждём немного перед обновлением статуса, чтобы анимация началась
      await new Promise(resolve => setTimeout(resolve, 100));
      await updateStageStatus(projectId, stage.id, "done");
      // Ждём завершения анимации перед обновлением
      await new Promise(resolve => setTimeout(resolve, 900));
      // Тихая синхронизация без дергания
      await onUpdate();
      setAnimatingProgress(false);
    } catch (err) {
      console.error("Failed to complete stage:", err);
      setAnimatingProgress(false);
      setProgressValue(stage.status === "in_progress" ? 50 : 5);
      alert("Не удалось завершить этап. Убедитесь, что предыдущий этап завершён.");
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStage(projectId, stage.id);
      await onUpdate();
    } catch (err) {
      console.error("Failed to delete stage:", err);
      throw err;
    } finally {
      setDeleting(false);
    }
  };


  const isInProgress = stage.status === "in_progress";
  const isDone = stage.status === "done";

  return (
    <>
    <Fade in timeout={200}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          // Glassmorphism эффект
          background: isDark
            ? "rgba(17, 24, 39, 0.6)"
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid",
          borderColor: isInProgress 
            ? "primary.main" 
            : isDark 
              ? "rgba(255, 255, 255, 0.1)" 
              : "rgba(0, 0, 0, 0.1)",
          // Плавные переходы для всех свойств отдельно
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          "&:hover": {
            boxShadow: isInProgress 
              ? "0 6px 24px rgba(124, 58, 237, 0.18), 0 0 20px rgba(124, 58, 237, 0.1)" 
              : "0 6px 20px rgba(0, 0, 0, 0.08)",
            transform: "translateY(-2px) rotateX(1deg) rotateY(-1deg)",
            borderColor: isInProgress 
              ? "primary.main" 
              : isDark 
                ? "rgba(255, 255, 255, 0.18)" 
                : "rgba(0, 0, 0, 0.12)",
            background: isDark
              ? "linear-gradient(135deg, rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.6))"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7))",
          },
          // Glow эффект для активных этапов
          ...(isInProgress && {
            boxShadow: "0 0 15px rgba(124, 58, 237, 0.3), 0 4px 20px rgba(124, 58, 237, 0.15)",
            animation: "stage-glow 2s ease-in-out infinite",
            "@keyframes stage-glow": {
              "0%, 100%": {
                boxShadow: "0 0 15px rgba(124, 58, 237, 0.3), 0 4px 20px rgba(124, 58, 237, 0.15)",
              },
              "50%": {
                boxShadow: "0 0 25px rgba(124, 58, 237, 0.5), 0 4px 30px rgba(124, 58, 237, 0.25)",
              },
            },
          })
        }}
      >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ rowGap: 1 }}>
          {isEditingTitle ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}
            >
              <TextField
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                autoFocus
              />
              <IconButton size="small" color="primary" onClick={handleSaveTitle} disabled={saving}>
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setTitle(stage.title || "");
                  setIsEditingTitle(false);
                }}
                disabled={saving}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={stage.title} 
                size="small" 
                color={statusColor(stage.status)}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                  ...(isInProgress && {
                    animation: "chip-pulse 2s ease-in-out infinite",
                    "@keyframes chip-pulse": {
                      "0%, 100%": { transform: "scale(1)" },
                      "50%": { transform: "scale(1.05)" },
                    },
                  }),
                }}
              />
              <IconButton 
                size="small" 
                onClick={() => setIsEditingTitle(true)} 
                disabled={saving}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover:not(:disabled)": {
                    transform: "scale(1.2) rotate(15deg)",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
            {statusLabel(stage.status)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={animatingProgress ? progressValue : (isDone ? 100 : isInProgress ? 50 : 5)}
            sx={{ 
              flex: 1, 
              height: 8, 
              borderRadius: 999, 
              minWidth: 100,
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              "& .MuiLinearProgress-bar": {
                // Плавный переход цвета при анимации от синего к зелёному
                background: animatingProgress
                  ? (() => {
                      const progress = (progressValue - 50) / 50; // 0 to 1
                      // Переход от #7c3aed (фиолетовый) через #2563eb (синий) к #22c55e (зелёный)
                      const r1 = Math.round(124 + (34 - 124) * progress);
                      const g1 = Math.round(58 + (197 - 58) * progress);
                      const b1 = Math.round(237 + (94 - 237) * progress);
                      const r2 = Math.round(37 + (22 - 37) * progress);
                      const g2 = Math.round(99 + (197 - 99) * progress);
                      const b2 = Math.round(235 + (94 - 235) * progress);
                      return `linear-gradient(90deg, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`;
                    })()
                  : isDone
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : isInProgress
                  ? "linear-gradient(90deg, #7c3aed, #2563eb)"
                  : "linear-gradient(90deg, #6b7280, #4b5563)",
                transition: animatingProgress
                  ? "width 0.05s linear, background 0.05s linear"
                  : "width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: animatingProgress
                  ? (() => {
                      const progress = (progressValue - 50) / 50;
                      const opacity = 0.5 + (0.5 - 0.5) * progress; // Плавное изменение свечения
                      return `0 0 10px rgba(${Math.round(124 + (34 - 124) * progress)}, ${Math.round(58 + (197 - 58) * progress)}, ${Math.round(237 + (94 - 237) * progress)}, ${opacity})`;
                    })()
                  : isInProgress
                  ? "0 0 10px rgba(124, 58, 237, 0.5)"
                  : isDone
                  ? "0 0 10px rgba(34, 197, 94, 0.5)"
                  : "none",
              }
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: { xs: "100%", sm: 140 }, textAlign: { xs: "left", sm: "right" } }}
          >
            {stage.startedAt ? dayjs(stage.startedAt).format("DD.MM HH:mm") : "—"} →
            {stage.finishedAt ? dayjs(stage.finishedAt).format("DD.MM HH:mm") : " ..."}
          </Typography>
          {isAdmin && (
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
          )}
        </Stack>

        {isInProgress && canComplete && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
            disabled={completing}
            size="small"
            sx={{ 
              alignSelf: "flex-start",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover:not(:disabled)": {
                transform: "translateY(-2px)",
                boxShadow: 4
              }
            }}
          >
            {completing ? "Завершаем..." : "Завершить этап"}
          </Button>
        )}

        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Комментарии / Прогресс
            </Typography>
            {!isEditingNotes && (
              <IconButton size="small" onClick={() => setIsEditingNotes(true)} disabled={isDone}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          {isEditingNotes ? (
            <Stack spacing={1}>
              <TextField
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Опишите что делается, что уже сделано, какие есть проблемы..."
                variant="outlined"
                size="small"
                fullWidth
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setNotes(stage.notes || "");
                    setIsEditingNotes(false);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveNotes}
                  disabled={saving}
                  sx={{
                    transition: "all 0.2s ease-in-out",
                    "&:hover:not(:disabled)": {
                      transform: "translateY(-1px)",
                      boxShadow: 3
                    }
                  }}
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography
              variant="body2"
              color={stage.notes ? "text.primary" : "text.secondary"}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: stage.notes 
                  ? (isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)")
                  : "transparent",
                backdropFilter: stage.notes ? "blur(10px)" : "none",
                fontStyle: stage.notes ? "normal" : "italic",
                minHeight: 40,
                whiteSpace: "pre-wrap"
              }}
            >
              {stage.notes || "Нет комментариев. Нажмите редактировать, чтобы добавить."}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
    </Fade>
    <StageDeleteDialog
      open={deleteDialogOpen}
      stageTitle={stage.title}
      onClose={() => setDeleteDialogOpen(false)}
      onConfirm={handleDelete}
    />
  </>
  );
};

export const StageCard = memo(StageCardComponent);
StageCard.displayName = "StageCard";

