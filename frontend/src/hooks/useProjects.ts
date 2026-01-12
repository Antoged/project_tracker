import { useCallback, useEffect, useMemo, useState } from "react";
import { Project, StageStatus } from "../types";
import { createProject, fetchProjects } from "../api/projects";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
      if (data.length && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (e) {
      setError("Не удалось загрузить проекты");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? projects[0],
    [projects, selectedId]
  );

  const handleCreate = useCallback(
    async (name: string, stageCount: number) => {
      setLoading(true);
      setError(null);
      try {
        const id = `p-${Date.now()}`;
        const stages = Array.from({ length: Math.max(stageCount, 1) }).map((_, idx) => ({
          id: `${id}-s${idx + 1}`,
          title: `Этап ${idx + 1}`,
          order: idx + 1,
          status: (idx === 0 ? "in_progress" : "blocked") as StageStatus
        }));
        await createProject({ id, name, stages });
        await load();
        setSelectedId(id);
      } catch (e) {
        setError("Не удалось создать проект");
      } finally {
        setLoading(false);
      }
    },
    [load]
  );

  const updateProject = useCallback((projectId: string, updater: (project: Project) => Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updater(p) : p))
    );
  }, []);

  const refreshProject = useCallback(async (projectId: string) => {
    try {
      const data = await fetchProjects();
      const updated = data.find((p) => p.id === projectId);
      if (updated) {
        // Обновляем только нужный проект, не трогая остальные
        // Используем функциональное обновление для избежания race conditions
        setProjects((prev) => {
          const index = prev.findIndex((p) => p.id === projectId);
          if (index === -1) return prev;
          // Проверяем, действительно ли нужно обновление
          const current = prev[index];
          if (JSON.stringify(current) === JSON.stringify(updated)) {
            return prev; // Не обновляем, если ничего не изменилось
          }
          const newProjects = [...prev];
          newProjects[index] = updated;
          return newProjects;
        });
      }
    } catch (e) {
      console.error("Failed to refresh project:", e);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    await load(true); // Тихая перезагрузка без показа loading
  }, [load]);

  return {
    projects,
    loading,
    error,
    selectedProject,
    setSelectedId,
    createProject: handleCreate,
    reload: load,
    refreshProjects,
    updateProject,
    refreshProject
  };
};

