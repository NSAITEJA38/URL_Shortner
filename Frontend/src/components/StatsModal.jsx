import React from "react";
import { X } from "lucide-react";

const StatsModal = ({ stats, onClose }) => {
  if (!stats) return null;

  const formatDate = (date) => {
    if (!date) return "No expiry";
    return new Date(date).toLocaleString();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">URL Analytics</h2>
            <p className="text-sm text-slate-500">{stats.shortCode}</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid gap-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50">
              <p className="text-sm text-blue-600">Total Clicks</p>
              <h3 className="text-3xl font-bold text-blue-900">{stats.clicks}</h3>
            </div>

            <div className="p-4 rounded-xl bg-green-50">
              <p className="text-sm text-green-600">Status</p>
              <h3 className="text-lg font-bold text-green-900">
                {stats.isActive ? "Active" : "Inactive"}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-purple-50">
              <p className="text-sm text-purple-600">Expiry</p>
              <h3 className="text-sm font-bold text-purple-900">
                {formatDate(stats.expiresAt)}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">Original URL</p>
            <a
              href={stats.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 break-all"
            >
              {stats.originalUrl}
            </a>
          </div>

          <div className="p-4 rounded-xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Click History
            </p>

            {stats.clickHistory?.length === 0 ? (
              <p className="text-sm text-slate-500">No clicks yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.clickHistory?.slice().reverse().map((click, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {formatDate(click.clickedAt)}
                    </p>
                    <p className="text-xs text-slate-500 break-all mt-1">
                      IP: {click.ipAddress || "Not available"}
                    </p>
                    <p className="text-xs text-slate-500 break-all mt-1">
                      Device: {click.userAgent || "Not available"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;