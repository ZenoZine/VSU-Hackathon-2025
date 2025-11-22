"use client";
import { useState } from "react";

export default function DownloadModal() {
  const [open, setOpen] = useState(false);

  const downloads = [
    {
      os: "Windows",
      ext: ".exe",
      url: "/downloads/Valdosta-Medicine-Setup-1.0.0.exe",
      available: true,
    },
    {
      os: "macOS",
      ext: ".dmg",
      url: "#",
      available: false,
    },
    {
      os: "Linux",
      ext: ".AppImage",
      url: "#",
      available: false,
    },
  ];

  return (
    <>
      {/* Button that triggers the modal */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 transition"
      >
        Download Desktop App
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[90%] max-w-md space-y-5 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-100">
              Choose your operating system
            </h2>

            <div className="space-y-3">
              {downloads.map((item) => (
                <button
                  key={item.os}
                  disabled={!item.available}
                  onClick={() => {
                    if (item.available) {
                      window.location.href = item.url;
                      setOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border ${
                    item.available
                      ? "border-emerald-600 hover:bg-emerald-600/10 text-slate-200"
                      : "border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span className="font-semibold">{item.os}</span>{" "}
                  <span className="text-xs opacity-60">{item.ext}</span>
                  {!item.available && (
                    <span className="ml-2 text-[10px] text-amber-400">
                      coming soon
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-md bg-slate-800 text-slate-300 py-2 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
