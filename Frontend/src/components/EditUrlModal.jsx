import { useState } from "react";
import { updateUrl } from "../api/urlApi";
import { X, Loader2, Save, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import SecurityWarningModal from "./SecurityWarningModal";

const EditUrlModal = ({ url, onClose, onUpdated }) => {
  const [originalUrl, setOriginalUrl] = useState(url?.originalUrl || "");
  const [expiresAt, setExpiresAt] = useState(
    url?.expiresAt ? new Date(url.expiresAt).toISOString().split("T")[0] : ""
  );
  const [isActive, setIsActive] = useState(url?.isActive ?? true);
  const [singleUse, setSingleUse] = useState(url?.singleUse ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [safetyWarning, setSafetyWarning] = useState(null);

  if (!url) return null;

  const handleSubmit = async (e, allowUnsafe = false) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!originalUrl.trim()) {
      setError("Original URL cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        originalUrl: originalUrl.trim(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive,
        singleUse,
        allowUnsafe
      };

      const res = await updateUrl(url.shortCode, payload);
      setSuccess(res.data?.message || "URL updated successfully");
      setSafetyWarning(null);

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 700);
    } catch (err) {
      const data = err.response?.data;
      if (data?.isUnsafe || data?.blocked) {
        setSafetyWarning({
          url: originalUrl.trim(),
          isBlocked: Boolean(data.blocked),
          reasons: data.reasons || [data.message]
        });
      } else {
        setError(
          data?.message ||
          err.message ||
          "Failed to update URL"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Short URL</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">/{url.shortCode}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
              Original Destination URL
            </label>
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Calendar size={13} />
                Expiration Date
              </label>
              {expiresAt && (
                <button
                  type="button"
                  onClick={() => setExpiresAt("")}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Clear Expiry
                </button>
              )}
            </div>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Leave empty for a link that never expires.</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">Link is Active (accepts clicks)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={singleUse}
                onChange={(e) => setSingleUse(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">Single Use Link (deactivates after first click)</span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
              <CheckCircle size={15} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>

      {safetyWarning && (
        <SecurityWarningModal
          safetyData={safetyWarning}
          onClose={() => setSafetyWarning(null)}
          onProceed={() => handleSubmit(null, true)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default EditUrlModal;
