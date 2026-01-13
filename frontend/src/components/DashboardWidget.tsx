import { Box, Stack, Typography, useTheme } from "@mui/material";
import { Project, Stage } from "../types";
import { useEffect, useState, useRef } from "react";

interface Props {
  projects: Project[];
}

export const DashboardWidget = ({ projects }: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  const [activeProjects, setActiveProjects] = useState(0);
  const [completedStages, setCompletedStages] = useState(0);
  const [totalStages, setTotalStages] = useState(0);
  
  // Храним предыдущие значения для плавной анимации
  const prevValuesRef = useRef({ active: 0, completed: 0, total: 0 });

  // Подсчитываем статистику
  useEffect(() => {
    const active = projects.filter(p => 
      p.stages.some(s => s.status === "in_progress")
    ).length;
    
    const completed = projects.reduce((acc, p) => 
      acc + p.stages.filter(s => s.status === "done").length, 0
    );
    
    const total = projects.reduce((acc, p) => acc + p.stages.length, 0);
    
    // Анимируем счётчики от предыдущего значения к новому (не с нуля!)
    const animateValue = (
      setter: (val: number) => void,
      start: number,
      end: number,
      duration: number
    ) => {
      // Если значения одинаковые, не анимируем
      if (start === end) {
        setter(end);
        return;
      }
      
      const startTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setter(Math.round(start + (end - start) * easeOutQuart));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setter(end); // Убеждаемся, что финальное значение точное
        }
      };
      animate();
    };
    
    // Анимируем от предыдущих значений к новым
    animateValue(setActiveProjects, prevValuesRef.current.active, active, 600);
    animateValue(setCompletedStages, prevValuesRef.current.completed, completed, 800);
    animateValue(setTotalStages, prevValuesRef.current.total, total, 1000);
    
    // Сохраняем новые значения для следующего обновления
    prevValuesRef.current = { active, completed, total };
  }, [projects]);

  const progressPercent = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: isDark
          ? "rgba(17, 24, 39, 0.6)"
          : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, opacity: 0.9 }}>
        Статистика
      </Typography>
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Активных проектов
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {activeProjects}
            </Typography>
          </Stack>
        </Box>
        
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Завершённых этапов
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {completedStages} / {totalStages}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 6,
              borderRadius: 3,
              background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #7c3aed, #2563eb)",
                borderRadius: 3,
                transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 0 10px rgba(124, 58, 237, 0.5)",
              }}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
