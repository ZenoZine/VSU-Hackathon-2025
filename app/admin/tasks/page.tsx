"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUserProfile } from "@/lib/useCurrentUserProfile";

type Status = { id: string; name: string };
type User = { id: string; full_name: string | null; role: string };
type Group = { id: string; name: string };

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status?: { name: string };
  assignee_user?: { full_name: string | null };
  assignee_group?: { name: string };
};

export default function AdminTasksPage() {
  const { profile, loading: profileLoading } = useCurrentUserProfile();
  const router = useRouter();

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [statusId, setStatusId] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [assigneeGroupId, setAssigneeGroupId] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (profileLoading) return;

    // route guards
    if (!profile) {
      router.replace("/login");
      return;
    }

    if (profile.role !== "admin") {
      router.replace("/me/tasks");
      return;
    }

    const load = async () => {
      // dropdown data
      const [{ data: statusData }, { data: userData }, { data: groupData }] =
        await Promise.all([
          supabase.from("task_statuses").select("id, name").order("sort_order"),
          supabase.from("profiles").select("id, full_name, role"),
          supabase.from("groups").select("id, name"),
        ]);

      if (statusData) setStatuses(statusData);
      if (userData) setUsers(userData);
      if (groupData) setGroups(groupData);

      // tasks list
      const { data: taskData, error } = await supabase
        .from("tasks")
        .select(
          `
          id,
          title,
          description,
          due_date,
          task_statuses ( name ),
          profiles!assignee_user_id ( full_name ),
          groups ( name )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading tasks", error);
      } else if (taskData) {
        const mapped = taskData.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          due_date: t.due_date,
          status: t.task_statuses ? { name: t.task_statuses.name } : undefined,
          assignee_user: t.profiles
            ? { full_name: t.profiles.full_name }
            : undefined,
          assignee_group: t.groups ? { name: t.groups.name } : undefined,
        }));
        setTasks(mapped);
      }

      setLoading(false);
    };

    load();
  }, [profile, profileLoading, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !statusId) {
      setErrorMsg("Title and status are required.");
      return;
    }

    if (!assigneeUserId && !assigneeGroupId) {
      setErrorMsg("Assign the task to a user or a group.");
      return;
    }

    setCreating(true);

    const { error } = await supabase.from("tasks").insert({
      title,
      description: description || null,
      due_date: dueDate || null,
      status_id: statusId,
      assignee_user_id: assigneeUserId || null,
      assignee_group_id: assigneeGroupId || null,
    });

    if (error) {
      console.error("Error creating task", error);
      setErrorMsg("Failed to create task.");
      setCreating(false);
      return;
    }

    // refresh list
    const { data: taskData } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        due_date,
        task_statuses ( name ),
        profiles!assignee_user_id ( full_name ),
        groups ( name )
      `
      )
      .order("created_at", { ascending: false });

    if (taskData) {
      const mapped = taskData.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        due_date: t.due_date,
        status: t.task_statuses ? { name: t.task_statuses.name } : undefined,
        assignee_user: t.profiles
          ? { full_name: t.profiles.full_name }
          : undefined,
        assignee_group: t.groups ? { name: t.groups.name } : undefined,
      }));
      setTasks(mapped);
    }

    // reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatusId("");
    setAssigneeUserId("");
    setAssigneeGroupId("");
    setCreating(false);
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading admin tasks…</p>
      </div>
    );
  }

  // page UI
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header + nav */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Admin console
            </p>
            <h1 className="text-3xl font-bold">Tasks &amp; queue</h1>
            <p className="text-sm text-slate-300">
              Logged in as{" "}
              <span className="font-semibold">
                {profile?.full_name || "Admin"}
              </span>
              . Create tasks for staff and groups, then track their progress.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-xs">
            <a
              href="/admin/tasks"
              className="rounded-full bg-slate-900/80 border border-blue-500/50 px-3 py-1 font-medium text-blue-200"
            >
              Tasks
            </a>
            <a
              href="/admin/employees"
              className="rounded-full bg-slate-900/60 border border-slate-700 px-3 py-1 text-slate-200 hover:border-slate-500"
            >
              Employees
            </a>
            <a
              href="/admin/groups"
              className="rounded-full bg-slate-900/60 border border-slate-700 px-3 py-1 text-slate-200 hover:border-slate-500"
            >
              Groups
            </a>
            <a
              href="/me/tasks"
              className="rounded-full bg-slate-900/40 border border-slate-700 px-3 py-1 text-slate-300 hover:border-slate-500"
            >
              My Tasks
            </a>
            <a
              href="/logout"
              className="rounded-full bg-slate-900/40 border border-red-500/60 px-3 py-1 text-[11px] font-medium text-red-200 hover:bg-red-500/10"
            >
              Log out
            </a>
          </nav>
        </header>

        {/* Create task card */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-slate-950/50 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">Create new task</h2>
              <p className="text-xs text-slate-400">
                Assign work to an individual staff member or an entire group.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-full bg-blue-500/10 px-3 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-500/40">
              Admin action
            </span>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <form
            onSubmit={handleCreateTask}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs mb-1 text-slate-200">Title</label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prep labs for Dr. Singh's 2 PM"
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs mb-1 text-slate-200">
                Description (optional)
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short instructions or context for staff…"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Status
              </label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                required
              >
                <option value="">Select status…</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Due date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Assign to user
              </label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assigneeUserId}
                onChange={(e) => setAssigneeUserId(e.target.value)}
              >
                <option value="">(none)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.id} {u.role === "admin" ? "(admin)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-xs mb-1 text-slate-200">
                Assign to group
              </label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assigneeGroupId}
                onChange={(e) => setAssigneeGroupId(e.target.value)}
              >
                <option value="">(none)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create task"}
              </button>
            </div>
          </form>
        </section>

        {/* Existing tasks list */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h2 className="text-xl font-semibold mb-1">Existing tasks</h2>
          <p className="text-xs text-slate-400 mb-3">
            This mirrors what staff see in their queue, with extra context for
            admins (assignee, group, and status).
          </p>

          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400">
              No tasks yet. Use the form above to create the first one.
            </p>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-50">
                      {task.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {task.description || "No description provided."}
                    </p>
                    {task.due_date && (
                      <p className="text-[11px] text-slate-500">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 md:text-right space-y-0.5">
                    <p>
                      Status:{" "}
                      <span className="font-semibold">
                        {task.status?.name ?? "—"}
                      </span>
                    </p>
                    <p>
                      User:{" "}
                      <span className="font-semibold">
                        {task.assignee_user?.full_name ?? "—"}
                      </span>
                    </p>
                    <p>
                      Group:{" "}
                      <span className="font-semibold">
                        {task.assignee_group?.name ?? "—"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
