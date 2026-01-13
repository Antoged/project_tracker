import { api } from "./client";
import { Project, Stage } from "../types";

export interface CreateProjectPayload {
  id: string;
  name: string;
  stages: Partial<Stage>[];
}

export const fetchProjects = async () => {
  const res = await api.get<Project[]>("/projects");
  return res.data;
};

export const createProject = async (payload: CreateProjectPayload) => {
  const res = await api.post<Project>("/projects", payload);
  return res.data;
};

export const updateStageStatus = async (projectId: string, stageId: string, status: Stage["status"]): Promise<Project> => {
  const res = await api.patch<{ project: Project }>(`/projects/${projectId}/stages/${stageId}/status`, { status });
  return res.data.project;
};

export const updateStageNotes = async (projectId: string, stageId: string, notes: string): Promise<Project> => {
  const res = await api.patch<{ project: Project }>(`/projects/${projectId}/stages/${stageId}/notes`, { notes });
  return res.data.project;
};

export const updateStageTitle = async (projectId: string, stageId: string, title: string): Promise<Project> => {
  const res = await api.patch<{ project: Project }>(`/projects/${projectId}/stages/${stageId}/title`, { title });
  return res.data.project;
};

export const updateProjectName = async (projectId: string, name: string): Promise<Project> => {
  const res = await api.patch<{ project: Project }>(`/projects/${projectId}`, { name });
  return res.data.project;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}`);
};

export const deleteStage = async (projectId: string, stageId: string): Promise<Project> => {
  const res = await api.delete<{ project: Project }>(`/projects/${projectId}/stages/${stageId}`);
  return res.data.project;
};

export const inviteToProject = async (projectId: string, username: string, role: "executor" | "admin" = "executor"): Promise<void> => {
  await api.post(`/projects/${projectId}/invite`, { username, role });
};

export const assignStageAssignee = async (projectId: string, stageId: string, username: string | null): Promise<Project> => {
  const res = await api.patch<{ project: Project }>(`/projects/${projectId}/stages/${stageId}/assignee`, { username });
  return res.data.project;
};

export const leaveProject = async (projectId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/members/me`);
};
