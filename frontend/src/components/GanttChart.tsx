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
  const isDraggingTouchRef = useRef(false);

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
  }, [
    project.id,
    JSON.stringify(
      project.stages.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        status: s.status,
        startedAt: s.startedAt,
        finishedAt: s.finishedAt
      }))
    )
  ]);

  // Touch → Mouse bridge для мобильных устройств (frappe-gantt в основном слушает mouse events)
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Проверяем, что касание именно по бару этапа (не по всей области диаграммы)
    const shouldSimulateDrag = (el: Element | null) => {
      if (!el) return false;
      const closest = (el as any).closest?.bind(el) as ((s: string) => Element | null) | undefined;
      if (!closest) return false;
      // Убрали .gantt и .bar-group - проверяем только конкретные элементы баров
      return !!closest(".bar-wrapper, .bar, .handle");
    };

    const dispatchMouse = (type: "mousedown" | "mousemove" | "mouseup", touch: Touch, target: EventTarget) => {
      const ev = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY
      });
      target.dispatchEvent(ev);
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTime = Date.now();
      const el = document.elementFromPoint(t.clientX, t.clientY);
      // Если касание не по бару — не перехватываем, позволяем скролл
      if (!shouldSimulateDrag(el)) {
        isDraggingTouchRef.current = false;
        return;
      }
      isDraggingTouchRef.current = true;
      e.preventDefault();
      dispatchMouse("mousedown", t, el || container);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      
      // Если не начали drag, проверяем: если движение большое — это скролл, не перехватываем
      if (!isDraggingTouchRef.current) {
        const dx = Math.abs(t.clientX - touchStartX);
        const dy = Math.abs(t.clientY - touchStartY);
        // Если движение больше 10px — скорее всего это скролл, не перехватываем
        if (dx > 10 || dy > 10) {
          return;
        }
        // Если прошло время и движение маленькое — возможно это tap, не перехватываем
        if (Date.now() - touchStartTime > 200) {
          return;
        }
      }
      
      if (!isDraggingTouchRef.current) return;
      e.preventDefault();
      const el = document.elementFromPoint(t.clientX, t.clientY);
      dispatchMouse("mousemove", t, el || document);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isDraggingTouchRef.current) return;
      const t = e.changedTouches[0];
      if (!t) return;
      e.preventDefault();
      const el = document.elementFromPoint(t.clientX, t.clientY);
      dispatchMouse("mouseup", t, el || document);
      isDraggingTouchRef.current = false;
    };

    const onTouchCancel = () => {
      isDraggingTouchRef.current = false;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: false });
    container.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart as any);
      container.removeEventListener("touchmove", onTouchMove as any);
      container.removeEventListener("touchend", onTouchEnd as any);
      container.removeEventListener("touchcancel", onTouchCancel as any);
    };
  }, [project.id]);

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
        WebkitOverflowScrolling: "touch",
        // Разрешаем скролл по обеим осям, перехватываем только drag баров
        touchAction: "pan-x pan-y",
        "&::-webkit-scrollbar": {
          height: "14px", // Увеличили для лучшей видимости на мобильных
          background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          borderRadius: "10px"
        },
        "&::-webkit-scrollbar-track": {
          background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
          borderRadius: "10px"
        },
        "&::-webkit-scrollbar-thumb": {
          background: isDark
            ? "linear-gradient(90deg, rgba(124, 58, 237, 0.7), rgba(37, 99, 235, 0.7))"
            : "linear-gradient(90deg, rgba(124, 58, 237, 0.6), rgba(37, 99, 235, 0.6))",
          borderRadius: "10px",
          border: isDark ? "2px solid rgba(0, 0, 0, 0.1)" : "2px solid rgba(255, 255, 255, 0.9)",
          minHeight: "20px", // Минимальная высота для удобства на мобильных
          transition: "all 0.3s ease",
          "&:hover": {
            background: isDark
              ? "linear-gradient(90deg, rgba(124, 58, 237, 0.9), rgba(37, 99, 235, 0.9))"
              : "linear-gradient(90deg, rgba(124, 58, 237, 0.8), rgba(37, 99, 235, 0.8))",
            border: isDark ? "2px solid rgba(0, 0, 0, 0.15)" : "2px solid rgba(255, 255, 255, 1)"
          },
          "&:active": {
            background: isDark
              ? "linear-gradient(90deg, rgba(124, 58, 237, 0.9), rgba(37, 99, 235, 0.9))"
              : "linear-gradient(90deg, rgba(124, 58, 237, 0.8), rgba(37, 99, 235, 0.8))"
          }
        },
        // Для Firefox - более заметный скроллбар
        scrollbarWidth: "auto",
        scrollbarColor: isDark
          ? "rgba(124, 58, 237, 0.6) rgba(255, 255, 255, 0.08)"
          : "rgba(124, 58, 237, 0.5) rgba(0, 0, 0, 0.08)"
      }}
    />
  );
};

