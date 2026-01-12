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
  Fade
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useMemo, useState } from "react";
import { lightTheme, darkTheme } from "./theme";
import { useProjects } from "./hooks/useProjects";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectDetail } from "./components/ProjectDetail";
import { ProjectCreateDialog } from "./components/ProjectCreateDialog";
import { fetchProjects } from "./api/projects";

const gradientBg =
  "radial-gradient(circle at 20% 20%, rgba(124,58,237,0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(37,99,235,0.18), transparent 30%), linear-gradient(180deg,#0b1021,#0f172a 35%,#0b1021)";

export default function App() {
  const [dark, setDark] = useState(true);
  const theme = useMemo(() => (dark ? darkTheme : lightTheme), [dark]);
  const { projects, loading, error, selectedProject, setSelectedId, createProject, refreshProject, refreshProjects } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Проектный трекер
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Этапы, блокировки, учёт времени и диаграмма Ганта
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button 
                variant="contained" 
                onClick={() => setDialogOpen(true)}
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

          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Загружаем проекты...
            </Typography>
          )}

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
        </Container>

        <ProjectCreateDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={createProject}
        />
      </Box>
    </ThemeProvider>
  );
}

