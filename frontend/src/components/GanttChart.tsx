import { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";
import { Project, Stage } from "../types";
import dayjs from "dayjs";
import Gantt from "frappe-gantt";
import "frappe-gantt/dist/frappe-gantt.css";

interface Props {
  project: Project;
}

const toTasks = (stages: Stage[]) =>
  stages.map((stage) => {
    const prev = stages.find((s) => s.order === stage.order - 1);
    return {
      id: stage.id,
      name: stage.title,
      start: stage.startedAt ? dayjs(stage.startedAt).toDate() : dayjs().toDate(),
      end: stage.finishedAt
        ? dayjs(stage.finishedAt).toDate()
        : dayjs(stage.startedAt ?? new Date()).add(2, "day").toDate(),
      progress: stage.status === "done" ? 100 : stage.status === "in_progress" ? 50 : 5,
      dependencies: prev ? [prev.id] : []
    };
  });

export const GanttChart = ({ project }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<Gantt | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    if (!ref.current) return;
    
    // Уничтожаем предыдущий экземпляр
    if (ganttRef.current) {
      try {
        ganttRef.current.destroy?.();
      } catch (e) {
        // Игнорируем ошибки при уничтожении
      }
      ganttRef.current = null;
    }
    
    // Очищаем контейнер
    if (ref.current) {
      ref.current.innerHTML = "";
    }
    
    // Создаем новый экземпляр
    const gantt = new Gantt(ref.current, toTasks(project.stages), {
      view_mode: "Day",
      custom_popup_html: (task: any) =>
        `<div class="p-2"><div>${task.name}</div><div>${task.progress}%</div></div>`
    });
    
    ganttRef.current = gantt;
    
    return () => {
      try {
        if (ganttRef.current) {
          ganttRef.current.destroy?.();
          ganttRef.current = null;
        }
      } catch (e) {
        // Игнорируем ошибки
      }
    };
  }, [project.id, JSON.stringify(project.stages.map(s => ({ id: s.id, status: s.status, startedAt: s.startedAt, finishedAt: s.finishedAt })))]);

  return (
    <Box
      ref={ref}
      key={`gantt-${project.id}`}
      className="gantt-scroll-container"
      sx={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        minHeight: 300,
        "&::-webkit-scrollbar": {
          height: "12px",
          background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          borderRadius: "10px"
        },
        "&::-webkit-scrollbar-track": {
          background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
          borderRadius: "10px"
        },
        "&::-webkit-scrollbar-thumb": {
          background: isDark
            ? "linear-gradient(90deg, rgba(124, 58, 237, 0.6), rgba(37, 99, 235, 0.6))"
            : "linear-gradient(90deg, rgba(124, 58, 237, 0.5), rgba(37, 99, 235, 0.5))",
          borderRadius: "10px",
          border: isDark ? "2px solid rgba(0, 0, 0, 0.05)" : "2px solid rgba(255, 255, 255, 0.8)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: isDark
              ? "linear-gradient(90deg, rgba(124, 58, 237, 0.8), rgba(37, 99, 235, 0.8))"
              : "linear-gradient(90deg, rgba(124, 58, 237, 0.7), rgba(37, 99, 235, 0.7))",
            border: isDark ? "2px solid rgba(0, 0, 0, 0.1)" : "2px solid rgba(255, 255, 255, 1)"
          }
        },
        // Для Firefox
        scrollbarWidth: "thin",
        scrollbarColor: isDark
          ? "rgba(124, 58, 237, 0.5) rgba(255, 255, 255, 0.05)"
          : "rgba(124, 58, 237, 0.4) rgba(0, 0, 0, 0.05)"
      }}
    />
  );
};

