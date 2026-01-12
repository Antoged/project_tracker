export type Role = "admin" | "user";

export type StageStatus = "blocked" | "in_progress" | "done";

export interface Stage {
  id: string;
  title: string;
  order: number;
  status: StageStatus;
  assigneeId?: string;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  stages: Stage[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  displayName: string;
}

