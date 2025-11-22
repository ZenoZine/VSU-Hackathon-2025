import DownloadModal from "@/components/DownloadModal";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center">
      <div className="mx-auto max-w-5xl px-6 py-16 grid gap-10 md:grid-cols-[3fr,2fr]">
        {/* Left column: hero copy */}
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
            VSU Hackathon 2025 · Valdosta Medicine
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Keep your clinic&apos;s{" "}
            <span className="text-blue-400">team, tasks,</span> and{" "}
            <span className="text-emerald-400">patients on track.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl">
            Valdosta Medicine is a lightweight workflow hub for small clinics:
            track staff, assign tasks to individuals or groups, and give
            everyone a simple &quot;today view&quot; of what needs to get done.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              Log in to Valdosta Medicine
            </a>
            <a
              href="/me/tasks"
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900/60 transition"
            >
              View my tasks
            </a>

            <DownloadModal />
          </div>

          <div className="grid gap-3 text-xs sm:text-sm text-slate-300 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="font-semibold text-slate-100">
                Staff &amp; employees
              </p>
              <p>Track who works where, their role, and salary details.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-100">
                Tasks &amp; statuses
              </p>
              <p>Assign work to individuals or groups and follow progress.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-100">
                Admin vs staff views
              </p>
              <p>
                Admins manage data; staff see a focused &quot;My Tasks&quot;
                dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: fake UI preview card */}
        <div className="hidden md:flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-blue-900/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Today&apos;s queue
                </p>
                <p className="text-xs text-slate-400">
                  What your team is working on right now
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/40">
                Live demo
              </span>
            </div>

            <div className="space-y-2">
              {/* Faux task rows */}
              <div className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    New patient intake – front desk
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Verify insurance &amp; update contact info.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-500/40">
                  In progress
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Prep labs for Dr. Singh&apos;s 2 PM
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Nursing · 2 tasks outstanding
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/40">
                  Due soon
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Submit weekly billing batch
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Billing · Completed by front desk
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/40">
                  Complete
                </span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500">
              This preview mirrors the real &quot;My Tasks&quot; view used by
              staff in the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
