import { useState, useMemo } from "react";
import {
  deleteUrl,
  deactivateUrl,
  activateUrl,
  getUrlStats
} from "../api/urlApi";
import {
  BarChart3,
  ExternalLink,
  Power,
  PowerOff,
  Trash2,
  QrCode,
  Edit2,
  Copy,
  Check,
  Search,
  Download,
  Filter,
  ArrowUpDown
} from "lucide-react";
import QrCodeModal from "./QrCodeModal";
import EditUrlModal from "./EditUrlModal";

const UrlTable = ({ urls = [], onRefresh, onShowStats }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedQrUrl, setSelectedQrUrl] = useState(null);
  const [selectedEditUrl, setSelectedEditUrl] = useState(null);

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const formatDate = (date) => {
    if (!date) return "No expiry";
    return new Date(date).toLocaleDateString();
  };

  const handleCopy = async (url) => {
    if (!url.shortUrl) return;
    await navigator.clipboard.writeText(url.shortUrl);
    setCopiedCode(url.shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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

  // Filter and sort URLs
  const filteredUrls = useMemo(() => {
    return urls
      .filter((url) => {
        // Search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchCode = url.shortCode?.toLowerCase().includes(term);
          const matchUrl = url.originalUrl?.toLowerCase().includes(term);
          if (!matchCode && !matchUrl) return false;
        }

        // Status filter
        if (statusFilter === "active") {
          return url.isActive && !isExpired(url.expiresAt);
        }
        if (statusFilter === "inactive") {
          return !url.isActive;
        }
        if (statusFilter === "expired") {
          return isExpired(url.expiresAt);
        }
        if (statusFilter === "singleUse") {
          return Boolean(url.singleUse);
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "mostClicks") {
          return (b.clicks || 0) - (a.clicks || 0);
        }
        if (sortBy === "leastClicks") {
          return (a.clicks || 0) - (b.clicks || 0);
        }
        return 0;
      });
  }, [urls, searchTerm, statusFilter, sortBy]);

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredUrls.length) return;

    const headers = ["Short Code", "Short URL", "Original URL", "Clicks", "Status", "Single Use", "Created At", "Expires At"];
    const rows = filteredUrls.map((u) => [
      `"${u.shortCode}"`,
      `"${u.shortUrl}"`,
      `"${u.originalUrl?.replace(/"/g, '""')}"`,
      u.clicks,
      isExpired(u.expiresAt) ? "Expired" : u.isActive ? "Active" : "Inactive",
      u.singleUse ? "Yes" : "No",
      `"${new Date(u.createdAt).toISOString()}"`,
      u.expiresAt ? `"${new Date(u.expiresAt).toISOString()}"` : "None"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `short-urls-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header with Title and CSV Export */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Short URLs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, edit, generate QR codes, and view stats for your links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-full text-slate-700">
            {filteredUrls.length} of {urls.length} URLs
          </span>

          <button
            onClick={handleExportCSV}
            disabled={filteredUrls.length === 0}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Export links to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code or destination..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 text-xs">
            <span className="text-slate-400 px-1.5 flex items-center">
              <Filter size={12} />
            </span>
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
              { key: "expired", label: "Expired" },
              { key: "singleUse", label: "Single Use" }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === tab.key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs gap-1.5 text-slate-600">
            <ArrowUpDown size={12} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer text-slate-700 py-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostClicks">Most Clicks</option>
              <option value="leastClicks">Least Clicks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100/70 text-slate-600 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-4">Short URL</th>
              <th className="text-left p-4">Original URL</th>
              <th className="text-left p-4">Clicks</th>
              <th className="text-left p-4">Expiry</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredUrls.map((url) => {
              const expired = isExpired(url.expiresAt);
              const isCopied = copiedCode === url.shortCode;

              return (
                <tr key={url._id || url.shortCode} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                      >
                        {url.shortCode}
                        <ExternalLink size={13} className="text-blue-400" />
                      </a>

                      <button
                        onClick={() => handleCopy(url)}
                        className={`p-1 rounded-md transition-colors ${
                          isCopied
                            ? "bg-green-100 text-green-700"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Copy short link"
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{url.shortUrl}</p>
                  </td>

                  <td className="p-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-slate-700" title={url.originalUrl}>
                        {url.originalUrl}
                      </p>
                      {url.isSafe === false && (
                        <span
                          className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 cursor-help flex items-center gap-0.5"
                          title={
                            url.safetyReasons && url.safetyReasons.length
                              ? `Flagged security risks: ${url.safetyReasons.join("; ")}`
                              : "Flagged as potentially suspicious or harmful"
                          }
                        >
                          ⚠️ UNSAFE
                        </span>
                      )}
                      {url.singleUse && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                          1-USE
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 font-bold text-slate-900">{url.clicks}</td>

                  <td className="p-4 text-xs">
                    <span
                      className={
                        expired
                          ? "text-red-600 font-semibold px-2 py-0.5 bg-red-50 rounded-full"
                          : "text-slate-600"
                      }
                    >
                      {expired ? "Expired" : formatDate(url.expiresAt)}
                    </span>
                  </td>

                  <td className="p-4">
                    {expired ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                        Expired
                      </span>
                    ) : url.isActive ? (
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* QR Code Action */}
                      <button
                        onClick={() => setSelectedQrUrl(url)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="View QR Code"
                      >
                        <QrCode size={13} />
                        QR
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => setSelectedEditUrl(url)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Edit link"
                      >
                        <Edit2 size={13} />
                        Edit
                      </button>

                      {/* Stats Action */}
                      <button
                        onClick={() => handleStats(url.shortCode)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="View stats"
                      >
                        <BarChart3 size={13} />
                        Stats
                      </button>

                      {/* Disable / Enable Toggle */}
                      {url.isActive ? (
                        <button
                          onClick={() => handleDeactivate(url.shortCode)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Deactivate URL"
                        >
                          <PowerOff size={13} />
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(url.shortCode)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Activate URL"
                        >
                          <Power size={13} />
                          Enable
                        </button>
                      )}

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDelete(url.shortCode)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete URL"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredUrls.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-slate-500">
                  {urls.length === 0
                    ? "No URLs created yet. Create your first short URL using the form above."
                    : "No links match your current search or filter criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QR Code Modal */}
      {selectedQrUrl && (
        <QrCodeModal
          urlData={selectedQrUrl}
          onClose={() => setSelectedQrUrl(null)}
        />
      )}

      {/* Edit URL Modal */}
      {selectedEditUrl && (
        <EditUrlModal
          url={selectedEditUrl}
          onClose={() => setSelectedEditUrl(null)}
          onUpdated={onRefresh}
        />
      )}
    </div>
  );
};

export default UrlTable;