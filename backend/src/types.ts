export type Role = "admin" | "user";
export type ProjectRole = "admin" | "executor";

export type StageStatus = "blocked" | "in_progress" | "done";

export interface Stage {
  id: string;
  title: string;
  order: number;
  status: StageStatus;
  assigneeId?: string;
  assigneeUsername?: string;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  stages: Stage[];
  myRole?: ProjectRole;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: Role;
  displayName: string;
}

