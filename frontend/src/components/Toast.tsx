import { Snackbar, Alert, AlertTitle, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

export type ToastSeverity = "success" | "error" | "info" | "warning";

interface ToastProps {
  open: boolean;
  message: string;
  severity?: ToastSeverity;
  title?: string;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({
  open,
  message,
  severity = "info",
  title,
  duration = 4000,
  onClose,
}: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const getGradient = () => {
    switch (severity) {
      case "success":
        return "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))";
      case "error":
        return "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))";
      case "warning":
        return "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))";
      default:
        return "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(37, 99, 235, 0.2))";
    }
  };

  return (
    <Snackbar
      open={open && !isExiting}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          minWidth: 300,
        },
      }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{
          background: getGradient(),
          backdropFilter: "blur(20px)",
          border: `1px solid ${severity === "success" ? "rgba(34, 197, 94, 0.3)" : severity === "error" ? "rgba(239, 68, 68, 0.3)" : "rgba(124, 58, 237, 0.3)"}`,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          animation: "toast-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "@keyframes toast-slide-in": {
            from: {
              transform: "translateX(100%)",
              opacity: 0,
            },
            to: {
              transform: "translateX(0)",
              opacity: 1,
            },
          },
          "& .MuiAlert-icon": {
            animation: "icon-pulse 0.6s ease-in-out",
            "@keyframes icon-pulse": {
              "0%, 100%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.1)" },
            },
          },
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};
