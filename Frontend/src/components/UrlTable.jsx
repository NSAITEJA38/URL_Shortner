import React from "react";
import {
  deleteUrl,
  deactivateUrl,
  activateUrl,
  getUrlStats
} from "../api/urlApi";
import { BarChart3, ExternalLink, Power, PowerOff, Trash2 } from "lucide-react";

const UrlTable = ({ urls, onRefresh, onShowStats }) => {
  const handleDelete = async (shortCode) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this URL?");
    if (!confirmDelete) return;

    await deleteUrl(shortCode);
    onRefresh();
  };

  const handleDeactivate = async (shortCode) => {
    await deactivateUrl(shortCode);
    onRefresh();
  };

  const handleActivate = async (shortCode) => {
    await activateUrl(shortCode);
    onRefresh();
  };

  const handleStats = async (shortCode) => {
    const res = await getUrlStats(shortCode);
    onShowStats(res.data.data);
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const formatDate = (date) => {
    if (!date) return "No expiry";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">All Short URLs</h2>
          <p className="text-sm text-slate-500">
            Manage all created links from here.
          </p>
        </div>

        <span className="text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-700">
          {urls.length} URLs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left p-4">Short URL</th>
              <th className="text-left p-4">Original URL</th>
              <th className="text-left p-4">Clicks</th>
              <th className="text-left p-4">Expiry</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {urls.map((url) => (
              <tr key={url._id} className="border-t border-slate-100">
                <td className="p-4">
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold flex items-center gap-1"
                  >
                    {url.shortCode}
                    <ExternalLink size={14} />
                  </a>
                  <p className="text-xs text-slate-400 mt-1">{url.shortUrl}</p>
                </td>

                <td className="p-4 max-w-xs">
                  <p className="truncate text-slate-700">{url.originalUrl}</p>
                </td>

                <td className="p-4 font-semibold">{url.clicks}</td>

                <td className="p-4">
                  <span
                    className={
                      isExpired(url.expiresAt)
                        ? "text-red-600 font-semibold"
                        : "text-slate-600"
                    }
                  >
                    {isExpired(url.expiresAt) ? "Expired" : formatDate(url.expiresAt)}
                  </span>
                </td>

                <td className="p-4">
                  {url.isActive ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStats(url.shortCode)}
                      className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 flex items-center gap-1"
                    >
                      <BarChart3 size={15} />
                      Stats
                    </button>

                    {url.isActive ? (
                      <button
                        onClick={() => handleDeactivate(url.shortCode)}
                        className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 flex items-center gap-1"
                      >
                        <PowerOff size={15} />
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(url.shortCode)}
                        className="px-3 py-2 rounded-lg bg-green-100 text-green-700 flex items-center gap-1"
                      >
                        <Power size={15} />
                        Enable
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(url.shortCode)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {urls.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No URLs created yet. Create your first short URL.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UrlTable;