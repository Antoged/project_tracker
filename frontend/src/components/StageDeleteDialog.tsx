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
  stageTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const StageDeleteDialog = ({ open, stageTitle, onClose, onConfirm }: Props) => {
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
      console.error("Failed to delete stage:", err);
      alert("Не удалось удалить этап. Попробуйте ещё раз.");
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
      <DialogTitle>Удаление этапа</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Это действие нельзя отменить. Все данные этапа будут удалены, порядок остальных этапов будет пересчитан.
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Вы точно хотите удалить этап <strong>"{stageTitle}"</strong>?
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              color="error"
            />
          }
          label="Да, я хочу удалить этот этап"
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
          {deleting ? "Удаляем..." : "Удалить этап"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
