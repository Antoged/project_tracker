import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from "@mui/material";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, stageCount: number) => Promise<void> | void;
}

export const ProjectCreateDialog = ({ open, onClose, onCreate }: Props) => {
  const [name, setName] = useState("");
  const [stageCount, setStageCount] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await onCreate(name.trim(), stageCount || 1);
    setSubmitting(false);
    setName("");
    setStageCount(5);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      TransitionProps={{ timeout: 300 }}
      PaperProps={{
        sx: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }
      }}
    >
      <DialogTitle>Новый проект</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Название проекта"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            label="Количество этапов"
            type="number"
            inputProps={{ min: 1, max: 10 }}
            value={stageCount}
            onChange={(e) => setStageCount(Number(e.target.value))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
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
          onClick={handleSubmit} 
          disabled={submitting}
          sx={{
            transition: "all 0.2s ease-in-out",
            "&:hover:not(:disabled)": {
              transform: "translateY(-2px)",
              boxShadow: 4
            }
          }}
        >
          {submitting ? "Создаём..." : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

