import { memo } from "react";
import {
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  CardActionArea,
  useTheme
} from "@mui/material";
import { Project, Stage } from "../types";
import dayjs from "dayjs";

const statusColor = (status: Stage["status"]) => {
  switch (status) {
    case "done":
      return "success";
    case "in_progress":
      return "info";
    default:
      return "default";
  }
};

const stageDuration = (stage: Stage) => {
  if (!stage.startedAt) return 0;
  const end = stage.finishedAt ? dayjs(stage.finishedAt) : dayjs();
  return end.diff(dayjs(stage.startedAt), "hour");
};

interface Props {
  project: Project;
  onSelect?: () => void;
  selected?: boolean;
}

const ProjectCardComponent = ({ project, onSelect, selected }: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: selected ? "primary.main" : isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        // Glassmorphism эффект
        background: isDark
          ? "rgba(17, 24, 39, 0.6)"
          : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: selected ? "0 12px 40px rgba(124, 58, 237, 0.3)" : "0 8px 32px rgba(0, 0, 0, 0.15)",
          borderColor: selected ? "primary.main" : isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)"
        }
      }}
    >
    <CardActionArea onClick={onSelect}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {project.name}
        </Typography>
        <Stack direction="column" spacing={1.2}>
          {project.stages.map((stage) => (
            <Stack
              key={stage.id}
              direction="row"
              alignItems="center"
              spacing={1.2}
              sx={{ 
                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                p: 1.25, 
                borderRadius: 2,
                backdropFilter: "blur(10px)"
              }}
            >
              <Chip label={stage.title} color={statusColor(stage.status)} size="small" />
              <Typography variant="body2" color="text.secondary">
                {stage.status === "blocked"
                  ? "Заблокировано"
                  : stage.status === "done"
                    ? "Готово"
                    : "В работе"}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stage.status === "done" ? 100 : stage.status === "in_progress" ? 50 : 5}
                sx={{ flex: 1, height: 8, borderRadius: 999 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 64, textAlign: "right" }}
              >
                {stageDuration(stage)} ч
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
  );
};

export const ProjectCard = memo(ProjectCardComponent, (prevProps, nextProps) => {
  // Оптимизация: перерисовываем только если изменился selected или данные проекта
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.name === nextProps.project.name &&
    JSON.stringify(prevProps.project.stages) === JSON.stringify(nextProps.project.stages)
  );
});

ProjectCard.displayName = "ProjectCard";
