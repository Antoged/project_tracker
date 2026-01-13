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
          background: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "dialog-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "@keyframes dialog-fade-in": {
            from: {
              opacity: 0,
              transform: "scale(0.95) translateY(-10px)",
            },
            to: {
              opacity: 1,
              transform: "scale(1) translateY(0)",
            },
          },
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
            background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 3s ease infinite",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
            "@keyframes gradient-shift": {
              "0%, 100%": { backgroundPosition: "0% 50%" },
              "50%": { backgroundPosition: "100% 50%" },
            },
            "&:hover:not(:disabled)": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.6)",
              animation: "gradient-shift 1.5s ease infinite, button-glow 2s ease-in-out infinite",
              "@keyframes button-glow": {
                "0%, 100%": { boxShadow: "0 6px 20px rgba(124, 58, 237, 0.6)" },
                "50%": { boxShadow: "0 6px 30px rgba(124, 58, 237, 0.8)" },
              },
            }
          }}
        >
          {submitting ? "Создаём..." : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

