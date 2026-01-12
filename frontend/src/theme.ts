import { createTheme } from "@mui/material/styles";

const primaryGradient = "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)";
const surfaceGradient = "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#7c3aed" },
    secondary: { main: "#2563eb" },
    background: {
      default: "#f6f7fb",
      paper: "#ffffff"
    }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: surfaceGradient
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundImage: primaryGradient,
          color: "#fff"
        }
      }
    }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#a78bfa" },
    secondary: { main: "#60a5fa" },
    background: {
      default: "#0f172a",
      paper: "#111827"
    }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: surfaceGradient
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundImage: primaryGradient,
          color: "#fff"
        }
      }
    }
  }
});

