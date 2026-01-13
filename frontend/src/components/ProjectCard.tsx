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
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transformStyle: "preserve-3d",
        perspective: "1000px",
        "&:hover": {
          transform: "translateY(-4px) rotateX(2deg) rotateY(-2deg)",
          boxShadow: selected 
            ? "0 12px 40px rgba(124, 58, 237, 0.3), 0 0 30px rgba(124, 58, 237, 0.2)" 
            : "0 8px 32px rgba(0, 0, 0, 0.15)",
          borderColor: selected ? "primary.main" : isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)",
          background: isDark
            ? "linear-gradient(135deg, rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.6))"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7))",
        },
        // Glow эффект для выбранного проекта (без пульсации)
        ...(selected && {
          boxShadow: "0 0 20px rgba(124, 58, 237, 0.4), 0 8px 32px rgba(124, 58, 237, 0.2)",
        }),
        // Убираем засвет самой карточки при hover (CardActionArea делает background ярче)
        "& .MuiCardActionArea-root": {
          "&:hover": {
            backgroundColor: "transparent"
          }
        }
      }}
    >
    <CardActionArea onClick={onSelect} sx={{ "&:hover": { backgroundColor: "transparent !important" } }}>
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
                sx={{ 
                  flex: 1, 
                  height: 8, 
                  borderRadius: 999,
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    background: stage.status === "done"
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : stage.status === "in_progress"
                      ? "linear-gradient(90deg, #7c3aed, #2563eb)"
                      : "linear-gradient(90deg, #6b7280, #4b5563)",
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: stage.status === "in_progress" 
                      ? "0 0 10px rgba(124, 58, 237, 0.5)"
                      : "none",
                  }
                }}
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
