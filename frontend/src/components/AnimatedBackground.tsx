import { Box } from "@mui/material";
import { useTheme } from "@mui/material";

export const AnimatedBackground = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(180deg, #0b1021 0%, #0f172a 50%, #0b1021 100%)"
          : "linear-gradient(180deg, #eef2ff 0%, #f8fafc 50%, #eef2ff 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "200%",
          height: "200%",
          top: "-50%",
          left: "-50%",
          background: isDark
            ? `radial-gradient(circle at 20% 20%, rgba(124,58,237,0.15), transparent 35%),
               radial-gradient(circle at 80% 0%, rgba(37,99,235,0.18), transparent 30%)`
            : `radial-gradient(circle at 20% 20%, rgba(124,58,237,0.08), transparent 35%),
               radial-gradient(circle at 80% 0%, rgba(37,99,235,0.1), transparent 30%)`,
          animation: "gradient-wave 20s ease-in-out infinite",
          "@keyframes gradient-wave": {
            "0%, 100%": {
              transform: "translate(0, 0) rotate(0deg)",
            },
            "25%": {
              transform: "translate(-5%, -5%) rotate(5deg)",
            },
            "50%": {
              transform: "translate(5%, 5%) rotate(-5deg)",
            },
            "75%": {
              transform: "translate(-3%, 3%) rotate(3deg)",
            },
          },
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "150%",
          height: "150%",
          top: "-25%",
          left: "-25%",
          background: isDark
            ? `radial-gradient(circle at 60% 60%, rgba(37,99,235,0.12), transparent 40%),
               radial-gradient(circle at 40% 80%, rgba(124,58,237,0.1), transparent 35%)`
            : `radial-gradient(circle at 60% 60%, rgba(37,99,235,0.06), transparent 40%),
               radial-gradient(circle at 40% 80%, rgba(124,58,237,0.05), transparent 35%)`,
          animation: "gradient-wave-reverse 25s ease-in-out infinite",
          "@keyframes gradient-wave-reverse": {
            "0%, 100%": {
              transform: "translate(0, 0) rotate(0deg)",
            },
            "25%": {
              transform: "translate(3%, 3%) rotate(-3deg)",
            },
            "50%": {
              transform: "translate(-5%, -5%) rotate(5deg)",
            },
            "75%": {
              transform: "translate(5%, 5%) rotate(-5deg)",
            },
          },
        },
      }}
    />
  );
};
