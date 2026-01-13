import { useState, MouseEvent } from "react";
import {
  Popover,
  Box,
  Stack,
  Typography,
  Avatar,
  Divider,
  Button,
  useTheme
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { User } from "../api/auth";

interface Props {
  user: User;
  onLogout: () => void;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const getInitials = (name: string | undefined, email: string | undefined): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "U";
};

export const ProfilePopover = ({ user, onLogout, anchorEl, onClose }: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const open = Boolean(anchorEl);
  const initials = getInitials(user.displayName, user.email);

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right"
      }}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 240,
          borderRadius: 3,
          // Glassmorphism эффект
          background: isDark
            ? "rgba(17, 24, 39, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          overflow: "hidden"
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "primary.main",
              backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
              fontWeight: 600,
              fontSize: "1.1rem"
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {user.username ? `@${user.username}` : user.displayName || "Пользователь"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Button
          onClick={handleLogout}
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{
            justifyContent: "flex-start",
            px: 1.5,
            py: 1,
            borderRadius: 2,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: isDark ? "rgba(211, 47, 47, 0.1)" : "rgba(211, 47, 47, 0.05)",
              transform: "translateX(4px)"
            }
          }}
        >
          Выйти
        </Button>
      </Box>
    </Popover>
  );
};
