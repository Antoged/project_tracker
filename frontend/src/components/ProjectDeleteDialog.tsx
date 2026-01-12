import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
  Alert
} from "@mui/material";

interface Props {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ProjectDeleteDialog = ({ open, projectName, onClose, onConfirm }: Props) => {
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!confirmed) return;
    setDeleting(true);
    try {
      await onConfirm();
      setConfirmed(false);
      onClose();
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Не удалось удалить проект. Попробуйте ещё раз.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      TransitionProps={{ timeout: 300 }}
    >
      <DialogTitle>Удаление проекта</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Это действие нельзя отменить. Все этапы и данные проекта будут удалены навсегда.
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Вы точно хотите удалить проект <strong>"{projectName}"</strong>?
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              color="error"
            />
          }
          label="Да, я хочу удалить этот проект"
          sx={{ mb: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={deleting}
          sx={{
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)"
            }
          }}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={!confirmed || deleting}
          sx={{
            transition: "all 0.2s ease-in-out",
            "&:hover:not(:disabled)": {
              transform: "translateY(-2px)",
              boxShadow: 4
            }
          }}
        >
          {deleting ? "Удаляем..." : "Удалить проект"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
