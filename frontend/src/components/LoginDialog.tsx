import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  Alert
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const LoginDialog = ({ open, onClose }: Props) => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email и пароль обязательны");
      return;
    }

    if (tab === 1 && !displayName.trim()) {
      setError("Имя пользователя обязательно");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (tab === 0) {
        await login(email, password);
      } else {
        await register(email, password, displayName.trim());
      }
      // Сброс формы
      setEmail("");
      setPassword("");
      setDisplayName("");
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Произошла ошибка. Проверьте подключение к серверу.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError(null);
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Вход" />
          <Tab label="Регистрация" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {tab === 1 && (
            <TextField
              label="Имя пользователя"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              autoFocus={tab === 1}
            />
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoFocus={tab === 0}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            transition: "all 0.2s ease-in-out",
            "&:hover:not(:disabled)": {
              transform: "translateY(-2px)",
              boxShadow: 4
            }
          }}
        >
          {loading ? "Загрузка..." : tab === 0 ? "Войти" : "Зарегистрироваться"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
