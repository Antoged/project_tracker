import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";
import { Project, ProjectRole, Stage, StageStatus } from "../types";
import { durationMs, nowIso } from "../utils/time";

const router = Router();

const canAdvance = (stages: Array<{ order: number; status: string }>, target: { order: number }) => {
  const prev = stages.find((s: { order: number; status: string }) => s.order === target.order - 1);
  return !prev || prev.status === "done";
};

async function getProjectRole(client: any, projectId: string, userId: string): Promise<ProjectRole | null> {
  const result = await client.query(
    "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId]
  );
  return result.rows.length ? (result.rows[0].role as ProjectRole) : null;
}

async function requireProjectMember(client: any, projectId: string, userId: string) {
  const role = await getProjectRole(client, projectId, userId);
  return role;
}

async function requireProjectAdmin(client: any, projectId: string, userId: string) {
  const role = await getProjectRole(client, projectId, userId);
  return role === "admin" ? role : null;
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Необходим токен" });
  const client = await pool.connect();
  try {
    const projectsResult = await client.query(
      `SELECT p.id, p.name, pm.role AS my_role
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const projects: Project[] = [];

    for (const projRow of projectsResult.rows) {
      const stagesResult = await client.query(
        `SELECT s.id, s.title, s."order", s.status, s.assignee_id, u.username AS assignee_username, s.notes, s.started_at, s.finished_at
         FROM stages s
         LEFT JOIN users u ON u.id = s.assignee_id
         WHERE s.project_id = $1
         ORDER BY s."order"`,
        [projRow.id]
      );

      const stages: Stage[] = stagesResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        order: row.order,
        status: row.status,
        assigneeId: row.assignee_id || undefined,
        assigneeUsername: row.assignee_username || undefined,
        notes: row.notes || undefined,
        startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
        finishedAt: row.finished_at ? new Date(row.finished_at).toISOString() : undefined
      }));

      projects.push({
        id: projRow.id,
        name: projRow.name,
        stages,
        myRole: projRow.my_role
      });
    }

    const list = projects.map((p) => ({
      ...p,
      durationMs: p.stages.reduce((acc, stage) => acc + durationMs(stage.startedAt, stage.finishedAt), 0)
    }));

    res.json(list);
  } catch (err) {
    console.error("[projects] List error:", err);
    res.status(500).json({ message: "Ошибка получения проектов" });
  } finally {
    client.release();
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Необходим токен" });
  const { id, name, stages } = req.body ?? {};
  if (!id || !name) {
    return res.status(400).json({ message: "id и name обязательны" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query("SELECT id FROM projects WHERE id = $1", [id]);
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Проект с таким id уже есть" });
    }

    await client.query("INSERT INTO projects (id, name) VALUES ($1, $2)", [id, name]);

    // Создатель проекта становится admin этого проекта
    await client.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING",
      [id, userId]
    );

    const preparedStages: Stage[] = (stages ?? []).map((s: Stage, idx: number) => ({
      id: s.id ?? `${id}-${idx + 1}`,
      title: s.title ?? `Этап ${idx + 1}`,
      order: s.order ?? idx + 1,
      status: s.status ?? (idx === 0 ? "in_progress" : "blocked"),
      assigneeId: s.assigneeId,
      startedAt: idx === 0 && s.status !== "blocked" ? nowIso() : undefined
    }));

    for (const stage of preparedStages) {
      await client.query(
        'INSERT INTO stages (id, project_id, title, "order", status, assignee_id, started_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [stage.id, id, stage.title, stage.order, stage.status, stage.assigneeId || null, stage.startedAt || null]
      );
    }

    await client.query("COMMIT");

    const project: Project = { id, name, stages: preparedStages, myRole: "admin" };
    return res.status(201).json(project);
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("[projects] Create error:", err);
    return res.status(500).json({ message: "Ошибка создания проекта" });
  } finally {
    client.release();
  }
});

router.post("/:projectId/invite", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const { projectId } = req.params;
  const { username, role } = req.body ?? {};
  if (!userId) return res.status(401).json({ message: "Необходим токен" });
  if (!projectId || !username) return res.status(400).json({ message: "projectId и username обязательны" });

  const normalizedUsername = String(username).trim().toLowerCase();
  const memberRole: ProjectRole = role === "admin" ? "admin" : "executor";

  const client = await pool.connect();
  try {
    const adminRole = await requireProjectAdmin(client, projectId, userId);
    if (!adminRole) return res.status(403).json({ message: "Требуются права администратора проекта" });

    const targetUserRes = await client.query("SELECT id, username, email, display_name FROM users WHERE username = $1", [normalizedUsername]);
    if (targetUserRes.rows.length === 0) return res.status(404).json({ message: "Пользователь с таким никнеймом не найден" });
    const targetUserId = targetUserRes.rows[0].id;

    await client.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role",
      [projectId, targetUserId, memberRole]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("[projects] Invite error:", err);
    return res.status(500).json({ message: "Ошибка приглашения пользователя" });
  } finally {
    client.release();
  }
});

router.patch("/:projectId/stages/:stageId/assignee", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const { projectId, stageId } = req.params;
  const { username } = req.body ?? {};
  if (!userId) return res.status(401).json({ message: "Необходим токен" });
  if (!projectId || !stageId) return res.status(400).json({ message: "Параметры не заданы" });

  const client = await pool.connect();
  try {
    const memberRole = await requireProjectAdmin(client, projectId, userId);
    if (!memberRole) return res.status(403).json({ message: "Требуются права администратора проекта" });

    // Проверяем этап
    const stageResult = await client.query(
      "SELECT id FROM stages WHERE id = $1 AND project_id = $2",
      [stageId, projectId]
    );
    if (stageResult.rows.length === 0) return res.status(404).json({ message: "Этап не найден" });

    let assigneeId: string | null = null;
    if (username && String(username).trim()) {
      const normalizedUsername = String(username).trim().toLowerCase();
      const userRes = await client.query("SELECT id FROM users WHERE username = $1", [normalizedUsername]);
      if (userRes.rows.length === 0) return res.status(404).json({ message: "Пользователь с таким никнеймом не найден" });
      assigneeId = userRes.rows[0].id;

      // Назначать можно только участника проекта
      const memberRes = await client.query(
        "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
        [projectId, assigneeId]
      );
      if (memberRes.rows.length === 0) {
        return res.status(400).json({ message: "Пользователь не является участником проекта (сначала пригласите)" });
      }
    }

    await client.query("UPDATE stages SET assignee_id = $1 WHERE id = $2", [assigneeId, stageId]);

    const updatedProjectResult = await client.query("SELECT id, name FROM projects WHERE id = $1", [projectId]);
    const updatedStagesResult = await client.query(
      `SELECT s.id, s.title, s."order", s.status, s.assignee_id, u.username AS assignee_username, s.notes, s.started_at, s.finished_at
       FROM stages s
       LEFT JOIN users u ON u.id = s.assignee_id
       WHERE s.project_id = $1
       ORDER BY s."order"`,
      [projectId]
    );

    const project: Project = {
      id: updatedProjectResult.rows[0].id,
      name: updatedProjectResult.rows[0].name,
      stages: updatedStagesResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        order: row.order,
        status: row.status,
        assigneeId: row.assignee_id || undefined,
        assigneeUsername: row.assignee_username || undefined,
        notes: row.notes || undefined,
        startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
        finishedAt: row.finished_at ? new Date(row.finished_at).toISOString() : undefined
      })),
      myRole: memberRole
    };

    return res.json({ project });
  } catch (err) {
    console.error("[projects] Assign error:", err);
    return res.status(500).json({ message: "Ошибка назначения исполнителя" });
  } finally {
    client.release();
  }
});

router.patch("/:projectId/stages/:stageId/status", requireAuth, async (req: AuthRequest, res) => {
  const { projectId, stageId } = req.params;
  const { status } = req.body ?? {};
  if (!projectId || !stageId) return res.status(400).json({ message: "Параметры не заданы" });
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Необходим токен" });

  const client = await pool.connect();
  try {
    const memberRole = await requireProjectMember(client, projectId, userId);
    if (!memberRole) return res.status(403).json({ message: "Нет доступа к проекту" });

    const projectResult = await client.query("SELECT id, name FROM projects WHERE id = $1", [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    const stageResult = await client.query(
      'SELECT id, title, "order", status, assignee_id, started_at, finished_at FROM stages WHERE id = $1 AND project_id = $2',
      [stageId, projectId]
    );
    if (stageResult.rows.length === 0) {
      return res.status(404).json({ message: "Этап не найден" });
    }

    const stageRow = stageResult.rows[0];
    const nextStatus: StageStatus = ["blocked", "in_progress", "done"].includes(status)
      ? status
      : undefined;
    if (!nextStatus) return res.status(400).json({ message: "Некорректный статус" });

    const allStagesResult = await client.query(
      'SELECT id, "order", status FROM stages WHERE project_id = $1 ORDER BY "order"',
      [projectId]
    );
    const allStages = allStagesResult.rows;
    const currentStage = { order: stageRow.order, status: stageRow.status };

    if (!canAdvance(allStages.map((s: Stage) => ({ order: s.order, status: s.status })), { order: stageRow.order }) && nextStatus !== "blocked") {
      return res.status(400).json({ message: "Нельзя перейти, предыдущий этап не завершён" });
    }

    // Исполнитель может завершать только назначенный ему этап
    if (memberRole !== "admin") {
      if (nextStatus === "done" && stageRow.assignee_id !== userId) {
        return res.status(403).json({ message: "Этап может завершить только назначенный исполнитель" });
      }
    }

    const startedAt = nextStatus === "in_progress" && !stageRow.started_at ? nowIso() : stageRow.started_at;
    const finishedAt = nextStatus === "done" && !stageRow.finished_at ? nowIso() : stageRow.finished_at;

    await client.query(
      'UPDATE stages SET status = $1, started_at = $2, finished_at = $3 WHERE id = $4',
      [nextStatus, startedAt || null, finishedAt || null, stageId]
    );

    if (nextStatus !== "done") {
      await client.query(
        'UPDATE stages SET status = $1, started_at = NULL, finished_at = NULL WHERE project_id = $2 AND "order" > $3',
        ["blocked", projectId, stageRow.order]
      );
    } else {
      const nextStage = allStages.find((s: Stage) => s.order === stageRow.order + 1);
      if (nextStage && nextStage.status === "blocked") {
        await client.query(
          'UPDATE stages SET status = $1, started_at = $2 WHERE id = $3',
          ["in_progress", nowIso(), nextStage.id]
        );
      }
    }

    const updatedProjectResult = await client.query("SELECT id, name FROM projects WHERE id = $1", [projectId]);
    const updatedStagesResult = await client.query(
      `SELECT s.id, s.title, s."order", s.status, s.assignee_id, u.username AS assignee_username, s.notes, s.started_at, s.finished_at
       FROM stages s
       LEFT JOIN users u ON u.id = s.assignee_id
       WHERE s.project_id = $1
       ORDER BY s."order"`,
      [projectId]
    );

    const project: Project = {
      id: updatedProjectResult.rows[0].id,
      name: updatedProjectResult.rows[0].name,
      stages: updatedStagesResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        order: row.order,
        status: row.status,
        assigneeId: row.assignee_id || undefined,
        assigneeUsername: row.assignee_username || undefined,
        notes: row.notes || undefined,
        startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
        finishedAt: row.finished_at ? new Date(row.finished_at).toISOString() : undefined
      })),
      myRole: memberRole
    };

    return res.json({ project });
  } catch (err) {
    console.error("[projects] Update status error:", err);
    return res.status(500).json({ message: "Ошибка обновления статуса" });
  } finally {
    client.release();
  }
});

router.patch("/:projectId/stages/:stageId/notes", requireAuth, async (req: AuthRequest, res) => {
  const { projectId, stageId } = req.params;
  const { notes } = req.body ?? {};
  if (!projectId || !stageId) return res.status(400).json({ message: "Параметры не заданы" });
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Необходим токен" });

  const client = await pool.connect();
  try {
    const memberRole = await requireProjectMember(client, projectId, userId);
    if (!memberRole) return res.status(403).json({ message: "Нет доступа к проекту" });

    const stageResult = await client.query(
      "SELECT id FROM stages WHERE id = $1 AND project_id = $2",
      [stageId, projectId]
    );
    if (stageResult.rows.length === 0) {
      return res.status(404).json({ message: "Этап не найден" });
    }

    await client.query("UPDATE stages SET notes = $1 WHERE id = $2", [notes || null, stageId]);

    const updatedProjectResult = await client.query("SELECT id, name FROM projects WHERE id = $1", [projectId]);
    const updatedStagesResult = await client.query(
      `SELECT s.id, s.title, s."order", s.status, s.assignee_id, u.username AS assignee_username, s.notes, s.started_at, s.finished_at
       FROM stages s
       LEFT JOIN users u ON u.id = s.assignee_id
       WHERE s.project_id = $1
       ORDER BY s."order"`,
      [projectId]
    );

    const project: Project = {
      id: updatedProjectResult.rows[0].id,
      name: updatedProjectResult.rows[0].name,
      stages: updatedStagesResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        order: row.order,
        status: row.status,
        assigneeId: row.assignee_id || undefined,
        assigneeUsername: row.assignee_username || undefined,
        notes: row.notes || undefined,
        startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
        finishedAt: row.finished_at ? new Date(row.finished_at).toISOString() : undefined
      })),
      myRole: memberRole
    };

    return res.json({ project });
  } catch (err) {
    console.error("[projects] Update notes error:", err);
    return res.status(500).json({ message: "Ошибка обновления комментариев" });
  } finally {
    client.release();
  }
});

router.patch("/:projectId", requireAuth, async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { name } = req.body ?? {};
  if (!projectId || !name) {
    return res.status(400).json({ message: "projectId и name обязательны" });
  }
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Необходим токен" });

  const client = await pool.connect();
  try {
    const memberRole = await requireProjectAdmin(client, projectId, userId);
    if (!memberRole) return res.status(403).json({ message: "Требуются права администратора проекта" });

    const projectResult = await client.query("SELECT id FROM projects WHERE id = $1", [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    await client.query("UPDATE projects SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [name, projectId]);

    const updatedProjectResult = await client.query("SELECT id, name FROM projects WHERE id = $1", [projectId]);
    const updatedStagesResult = await client.query(
      `SELECT s.id, s.title, s."order", s.status, s.assignee_id, u.username AS assignee_username, s.notes, s.started_at, s.finished_at
       FROM stages s
       LEFT JOIN users u ON u.id = s.assignee_id
       WHERE s.project_id = $1
       ORDER BY s."order"`,
      [projectId]
    );

    const project: Project = {
      id: updatedProjectResult.rows[0].id,
      name: updatedProjectResult.rows[0].name,
      stages: updatedStagesResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        order: row.order,
        status: row.status,
        assigneeId: row.assignee_id || undefined,
        assigneeUsername: row.assignee_username || undefined,
        notes: row.notes || undefined,
        startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
        finishedAt: row.finished_at ? new Date(row.finished_at).toISOString() : undefined
      })),
      myRole: memberRole
    };

    return res.json({ project });
  } catch (err) {
    console.error("[projects] Update project error:", err);
    return res.status(500).json({ message: "Ошибка обновления проекта" });
  } finally {
    client.release();
  }
});

router.delete("/:projectId/stages/:stageId", requireAuth, async (req: AuthRequest, res) => {
  const { projectId, stageId } = req.params;
  if (!projectId || !stageId) {
    return res.status(400).json({ message: "projectId и stageId обязательны" });
  }
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Необходим токен" });

  const client = await pool.connect();
  try {
    const memberRole = await requireProjectAdmin(client, projectId, userId);
    if (!memberRole) return res.status(403).json({ message: "Требуются права администратора проекта" });

    const projectResult = await client.query("SELECT id FROM projects WHERE id = $1", [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    const stageResult = await client.query(
      'SELECT id, "order" FROM stages WHERE id = $1 AND project_id = $2',
      [stageId, projectId]
    );
    if (stageResult.rows.length === 0) {
      return res.status(404).json({ message: "Этап не найден" });
    }

    const deletedOrder = stageResult.rows[0].order;

    // Удаляем этап
    await client.query("DELETE FROM stages WHERE id = $1", [stageId]);

    // Пересчитываем порядок остальных этапов
    await client.query(
      'UPDATE stages SET "order" = "order" - 1 WHERE project_id = $1 AND "order" > $2',
      [projectId, deletedOrder]
    );

    // Если удалили первый этап или этап "В работе", разблокируем следующий
    const remainingStagesResult = await client.query(
      'SELECT id, "order", status FROM stages WHERE project_id = $1 ORDER BY "order"',
      [projectId]
    );

    if (remainingStagesResult.rows.length > 0) {
      const firstStage = remainingStagesResult.rows[0];
      if (firstStage.status === "blocked") {
        await client.query(
          'UPDATE stages SET status = $1, started_at = $2 WHERE id = $3',
          ["in_progress", nowIso(), firstStage.id]
        );
      }
    }

    // Возвращаем обновленный проект
    const updatedProjectResult = await client.query("SELECT id, name FROM projects WHERE id = $1", [projectId]);
    const updatedStagesResult = await client.query(
      `SELECT s.id, s.title, s."order", s.status, s.assignee_id, u.username AS assignee_username, s.notes, s.started_at, s.finished_at
       FROM stages s
       LEFT JOIN users u ON u.id = s.assignee_id
       WHERE s.project_id = $1
       ORDER BY s."order"`,
      [projectId]
    );

    const project: Project = {
      id: updatedProjectResult.rows[0].id,
      name: updatedProjectResult.rows[0].name,
      stages: updatedStagesResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        order: row.order,
        status: row.status,
        assigneeId: row.assignee_id || undefined,
        assigneeUsername: row.assignee_username || undefined,
        notes: row.notes || undefined,
        startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
        finishedAt: row.finished_at ? new Date(row.finished_at).toISOString() : undefined
      })),
      myRole: memberRole
    };

    return res.json({ project });
  } catch (err) {
    console.error("[projects] Delete stage error:", err);
    return res.status(500).json({ message: "Ошибка удаления этапа" });
  } finally {
    client.release();
  }
});

router.delete("/:projectId", requireAuth, async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).json({ message: "projectId обязателен" });
  }
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Необходим токен" });

  const client = await pool.connect();
  try {
    const memberRole = await requireProjectAdmin(client, projectId, userId);
    if (!memberRole) return res.status(403).json({ message: "Требуются права администратора проекта" });

    const projectResult = await client.query("SELECT id FROM projects WHERE id = $1", [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    // CASCADE удалит все связанные этапы автоматически
    await client.query("DELETE FROM projects WHERE id = $1", [projectId]);

    return res.json({ success: true });
  } catch (err) {
    console.error("[projects] Delete project error:", err);
    return res.status(500).json({ message: "Ошибка удаления проекта" });
  } finally {
    client.release();
  }
});

export default router;

