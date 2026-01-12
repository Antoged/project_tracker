import {
  CssBaseline,
  Box,
  Container,
  Stack,
  Typography,
  IconButton,
  Button,
  Grid,
  Alert,
  Fade,
  Chip
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useMemo, useState } from "react";
import { lightTheme, darkTheme } from "./theme";
import { useProjects } from "./hooks/useProjects";
import { useAuth } from "./auth/AuthContext";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectDetail } from "./components/ProjectDetail";
import { ProjectCreateDialog } from "./components/ProjectCreateDialog";
import { LoginDialog } from "./components/LoginDialog";
import { fetchProjects } from "./api/projects";

const gradientBg =
  "radial-gradient(circle at 20% 20%, rgba(124,58,237,0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(37,99,235,0.18), transparent 30%), linear-gradient(180deg,#0b1021,#0f172a 35%,#0b1021)";

export default function App() {
  const [dark, setDark] = useState(true);
  const theme = useMemo(() => (dark ? darkTheme : lightTheme), [dark]);
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  // Загружаем проекты только если пользователь авторизован
  const { projects, loading, error, selectedProject, setSelectedId, createProject, refreshProject, refreshProjects, reload } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // После успешного логина / регистрации подгружаем проекты
  useEffect(() => {
    if (isAuthenticated) {
      reload(true);
    }
  }, [isAuthenticated, reload]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          background: dark ? gradientBg : "linear-gradient(180deg,#eef2ff,#f8fafc)",
          // Скрытие скроллбара
          "&::-webkit-scrollbar": {
            width: "0px",
            background: "transparent"
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 3, gap: 1.5 }}
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15
                }}
              >
                Project Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
                Управляй проектами по этапам: статусы, комментарии и сроки — наглядно в диаграмме Ганта и с блокировками по порядку.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, opacity: 0.8 }}>
                made by Anton Gedziun
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 1 }}>
              {isAuthenticated ? (
                <>
                  <Chip 
                    label={user?.username ? `@${user.username}` : (user?.displayName || user?.email)} 
                    color="primary" 
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={() => setDialogOpen(true)}
                    fullWidth={false}
                    sx={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4
                      }
                    }}
                  >
                    Новый проект
                  </Button>
                  <IconButton 
                    onClick={logout}
                    color="error"
                    title="Выйти"
                    sx={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "scale(1.1)"
                      }
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={() => setLoginDialogOpen(true)}
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4
                    }
                  }}
                >
                  Войти
                </Button>
              )}
              <IconButton 
                onClick={() => setDark((v) => !v)} 
                color="primary"
                sx={{
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "rotate(15deg) scale(1.1)"
                  }
                }}
              >
                {dark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!isAuthenticated && !authLoading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Войдите или зарегистрируйтесь, чтобы начать работу с проектами
            </Alert>
          )}

          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Загружаем проекты...
            </Typography>
          )}

          {isAuthenticated && (
            <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                {projects.map((project) => (
                  <Fade in key={project.id} timeout={300}>
                    <div>
                      <ProjectCard
                        project={project}
                        onSelect={() => setSelectedId(project.id)}
                        selected={selectedProject?.id === project.id}
                      />
                    </div>
                  </Fade>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              {selectedProject ? (
                <ProjectDetail 
                  key={selectedProject.id} 
                  project={selectedProject} 
                  onUpdate={async () => {
                    // Плавное обновление без дергания
                    await refreshProject(selectedProject.id);
                  }}
                  onDelete={async () => {
                    const currentSelectedId = selectedProject.id;
                    // Сначала выбираем другой проект, потом удаляем
                    const currentProjects = projects.filter(p => p.id !== currentSelectedId);
                    if (currentProjects.length > 0) {
                      setSelectedId(currentProjects[0].id);
                    } else {
                      setSelectedId(null);
                    }
                    // Тихая перезагрузка списка
                    await refreshProjects();
                  }}
                />
              ) : (
                <Fade in timeout={300}>
                  <Box
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 3,
                      p: 3,
                      border: "1px dashed",
                      borderColor: "divider",
                      textAlign: "center"
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Нет проектов. Создайте первый, чтобы увидеть детали.
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Grid>
          </Grid>
          )}

          {!isAuthenticated && !authLoading && (
            <Fade in timeout={300}>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  p: { xs: 3, sm: 6 },
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "center"
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Добро пожаловать в Project Tracker
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Войдите или зарегистрируйтесь, чтобы создавать проекты, вести этапы и отмечать прогресс в диаграмме Ганта.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setLoginDialogOpen(true)}
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4
                    }
                  }}
                >
                  Войти / Зарегистрироваться
                </Button>
              </Box>
            </Fade>
          )}
        </Container>

        <ProjectCreateDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={createProject}
        />
        <LoginDialog
          open={loginDialogOpen}
          onClose={() => setLoginDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

