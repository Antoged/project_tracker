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

export const LeaveProjectDialog = ({ open, projectName, onClose, onConfirm }: Props) => {
  const [confirmed, setConfirmed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleConfirm = async () => {
    if (!confirmed) return;
    setLeaving(true);
    try {
      await onConfirm();
      setConfirmed(false);
      onClose();
    } catch (err) {
      console.error("Failed to leave project:", err);
      alert("Не удалось покинуть проект. Попробуйте ещё раз.");
    } finally {
      setLeaving(false);
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
      PaperProps={{
        sx: {
          background: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }
      }}
    >
      <DialogTitle>Покинуть проект</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Вы больше не сможете видеть этапы и прогресс этого проекта. Чтобы вернуться, администратор должен пригласить вас снова.
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Вы точно хотите покинуть проект <strong>"{projectName}"</strong>?
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              color="error"
            />
          }
          label="Да, я хочу покинуть этот проект"
          sx={{ mb: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={leaving}
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
          disabled={!confirmed || leaving}
          sx={{
            transition: "all 0.2s ease-in-out",
            "&:hover:not(:disabled)": {
              transform: "translateY(-2px)",
              boxShadow: 4
            }
          }}
        >
          {leaving ? "Покидаем..." : "Покинуть проект"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
