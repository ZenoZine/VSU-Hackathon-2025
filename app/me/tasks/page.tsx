"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUserProfile } from "@/lib/useCurrentUserProfile";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status_id: string | null;
  assignee_group_id: string | null;
  due_date: string | null;
  status?: { name: string };
  group?: { name: string };
};

type Status = { id: string; name: string };

function statusPillClasses(name?: string) {
  const n = name?.toLowerCase();
  if (!n) {
    return "inline-flex items-center rounded-full bg-slate-700 px-2.5 py-0.5 text-[11px] font-medium text-slate-100";
  }
  if (n.includes("open")) {
    return "inline-flex items-center rounded-full bg-slate-900 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-medium text-amber-300";
  }
  if (n.includes("progress")) {
    return "inline-flex items-center rounded-full bg-slate-900 border border-blue-500/40 px-2.5 py-0.5 text-[11px] font-medium text-blue-300";
  }
  if (n.includes("complete") || n.includes("done")) {
    return "inline-flex items-center rounded-full bg-slate-900 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300";
  }
  return "inline-flex items-center rounded-full bg-slate-900 border border-slate-500/40 px-2.5 py-0.5 text-[11px] font-medium text-slate-100";
}

export default function MyTasksPage() {
  const { profile, loading: profileLoading } = useCurrentUserProfile();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // guard: must be logged in
      if (!profile) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      // 1. Load statuses
      const { data: statusData } = await supabase
        .from("task_statuses")
        .select("id, name")
        .order("sort_order");

      if (statusData) {
        setStatuses(statusData);
      }

      // 2. Get groups this user belongs to
      const { data: memberships } = await supabase
        .from("user_groups")
        .select("group_id")
        .eq("user_id", profile.id);

      const groupIds = memberships?.map((m) => m.group_id) ?? [];

      // 3. Load tasks assigned to this user OR these groups
      let query = supabase.from("tasks").select(
        `
          id,
          title,
          description,
          status_id,
          assignee_group_id,
          due_date,
          task_statuses ( name ),
          groups ( name )
        `
      );

      if (groupIds.length > 0) {
        query = query.or(
          `assignee_user_id.eq.${
            profile.id
          },assignee_group_id.in.(${groupIds.join(",")})`
        );
      } else {
        query = query.eq("assignee_user_id", profile.id);
      }

      const { data: taskData, error } = await query;

      if (error) {
        console.error("Error loading tasks", error);
      } else if (taskData) {
        const mapped = taskData.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status_id: t.status_id,
          assignee_group_id: t.assignee_group_id,
          due_date: t.due_date,
          status: t.task_statuses ? { name: t.task_statuses.name } : undefined,
          group: t.groups ? { name: t.groups.name } : undefined,
        }));
        setTasks(mapped);
      }

      setLoading(false);
    };

    if (!profileLoading) {
      loadData();
    }
  }, [profile, profileLoading, router]);

  const handleStatusChange = async (taskId: string, newStatusId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        status_id: newStatusId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating status", error);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status_id: newStatusId } : t))
    );
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading your queue…</p>
      </div>
    );
  }

  // MAIN UI – matches the landing-page "Today's queue" card
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Staff dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Today&apos;s queue
            </h1>
            <p className="text-sm text-slate-300">
              What your team is working on right now. Logged in as{" "}
              <span className="font-semibold">
                {profile?.full_name || "User"}
              </span>
              .
            </p>
          </div>

          <div className="flex gap-2">
            {/* Only show Admin view if they're actually an admin */}
            {profile?.role === "admin" && (
              <a
                href="/admin/tasks"
                className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-blue-200 border border-slate-700 hover:border-blue-400 hover:text-blue-100 transition"
              >
                Admin view
              </a>
            )}

            {/* Logout button for all staff/admin */}
            <a
              href="/logout"
              className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-red-200 border border-red-500/50 hover:bg-red-600/20 hover:border-red-400 transition"
            >
              Logout
            </a>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/60">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Today&apos;s queue
              </p>
              <p className="text-xs text-slate-400">
                What your team is working on right now
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/40">
              Live data
            </span>
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400">
              You don&apos;t have any tasks yet. Once an admin assigns work to
              you or your group, it will show up here.
            </p>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                    index === 0 ? "bg-slate-900/90" : "bg-slate-900/70"
                  } border border-slate-800/70`}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-50">
                      {task.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {task.group ? (
                        <>{task.group.name} · </>
                      ) : (
                        "Assigned to you · "
                      )}
                      {task.description
                        ? task.description
                        : task.due_date
                        ? `Due ${new Date(task.due_date).toLocaleDateString()}`
                        : "No additional details"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {/* Nice status pill */}
                    <span className={statusPillClasses(task.status?.name)}>
                      {task.status?.name ?? "No status"}
                    </span>

                    {/* Subtle inline status changer */}
                    <select
                      className="mt-1 border border-slate-700 bg-slate-900 text-[11px] text-slate-100 rounded-full px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={task.status_id ?? ""}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Update…
                      </option>
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-[11px] text-slate-500">
            This view mirrors what front-desk or nursing staff would see during
            a real clinic day: a single, prioritized queue of their work.
          </p>
        </div>
      </div>
    </div>
  );
}
