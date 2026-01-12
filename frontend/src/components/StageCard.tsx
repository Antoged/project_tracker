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
  Fade
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
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(stage.notes || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(stage.title || "");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Синхронизируем локальное состояние с пропсами
  useEffect(() => {
    setNotes(stage.notes || "");
    setTitle(stage.title || "");
  }, [stage.notes, stage.title]);

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
    try {
      await updateStageStatus(projectId, stage.id, "done");
      // Тихая синхронизация без дергания
      await onUpdate();
    } catch (err) {
      console.error("Failed to complete stage:", err);
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
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: isInProgress ? "primary.main" : "divider",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: 2,
            transform: "translateY(-2px)"
          }
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
              <Chip label={stage.title} size="small" color={statusColor(stage.status)} />
              <IconButton size="small" onClick={() => setIsEditingTitle(true)} disabled={saving}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
            {statusLabel(stage.status)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={isDone ? 100 : isInProgress ? 50 : 5}
            sx={{ flex: 1, height: 8, borderRadius: 999, minWidth: 100 }}
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
                bgcolor: stage.notes ? "action.hover" : "transparent",
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

