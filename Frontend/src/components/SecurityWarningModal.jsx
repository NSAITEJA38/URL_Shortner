import { ShieldAlert, AlertTriangle, X, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

const SecurityWarningModal = ({ safetyData, onClose, onProceed, loading = false }) => {
  if (!safetyData) return null;

  const { isBlocked, reasons = [], url } = safetyData;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Top Banner */}
        <div
          className={`p-6 text-center relative ${
            isBlocked
              ? "bg-red-50/80 border-b border-red-100"
              : "bg-amber-50/80 border-b border-amber-100"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xs ${
              isBlocked
                ? "bg-red-100 text-red-600 border border-red-200"
                : "bg-amber-100 text-amber-600 border border-amber-200"
            }`}
          >
            {isBlocked ? <ShieldAlert size={28} /> : <AlertTriangle size={28} />}
          </div>

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
              isBlocked
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isBlocked ? "Prohibited Link Blocked" : "Security Warning"}
          </span>

          <h3 className="text-xl font-bold text-slate-900">
            {isBlocked
              ? "This URL Cannot Be Shortened"
              : "Potentially Harmful Link Detected"}
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            {isBlocked
              ? "Our automated security scanners have blocked this link because it poses severe security risks."
              : "Our threat detection system identified potential safety issues with this destination."}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Target URL Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Target URL
            </p>
            <p className="font-mono text-slate-800 break-all">{url}</p>
          </div>

          {/* Detected Threats */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <AlertCircle size={14} className={isBlocked ? "text-red-500" : "text-amber-500"} />
              Detected Security Issues:
            </p>
            <ul className="space-y-2">
              {reasons.length > 0 ? (
                reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    className={`text-xs p-2.5 rounded-xl border flex items-start gap-2.5 leading-relaxed ${
                      isBlocked
                        ? "bg-red-50/50 border-red-100 text-red-800"
                        : "bg-amber-50/50 border-amber-100 text-amber-900"
                    }`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">Flagged by threat protection rules.</li>
              )}
            </ul>
          </div>

          {!isBlocked && (
            <p className="text-[11px] text-slate-400 italic">
              Note: If you proceed, anyone visiting this short link will be presented with a safety interstitial warning before redirection.
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              Cancel & Edit Link
            </button>

            {!isBlocked && onProceed && (
              <button
                type="button"
                onClick={onProceed}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                <span>Proceed Anyway</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityWarningModal;
