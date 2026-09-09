import { useMemo } from "react";
import {
  X,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Users,
  Calendar,
  ExternalLink
} from "lucide-react";

const StatsModal = ({ stats, onClose }) => {
  const formatDate = (date) => {
    if (!date) return "No expiry";
    return new Date(date).toLocaleString();
  };

  // Compute Analytics Metrics
  const metrics = useMemo(() => {
    const history = stats?.clickHistory || [];
    const uniqueIps = new Set(history.map((c) => c.ipAddress).filter(Boolean));

    // Countries aggregation
    const countryCounts = {};
    history.forEach((c) => {
      const country = c.country || "Unknown";
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const sortedCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Device aggregation from User-Agent
    let mobile = 0;
    let desktop = 0;
    let tablet = 0;
    let other = 0;

    history.forEach((c) => {
      const ua = (c.userAgent || "").toLowerCase();
      if (/tablet|ipad/.test(ua)) {
        tablet++;
      } else if (/mobile|iphone|android/.test(ua)) {
        mobile++;
      } else if (/windows|macintosh|linux|x11/.test(ua)) {
        desktop++;
      } else {
        other++;
      }
    });

    return {
      uniqueCount: uniqueIps.size,
      countries: sortedCountries,
      devices: { mobile, desktop, tablet, other }
    };
  }, [stats]);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full max-h-[88vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Analytics Overview</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold">
                /{stats.shortCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Detailed performance and audience metrics</p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Clicks</p>
              <h3 className="text-2xl font-extrabold text-blue-900 mt-1">{stats.clicks}</h3>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Users size={12} /> Unique IP Visitors
              </p>
              <h3 className="text-2xl font-extrabold text-indigo-900 mt-1">{metrics.uniqueCount}</h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Link Status</p>
              <h3 className="text-lg font-bold text-emerald-900 mt-1 flex items-center gap-1">
                {stats.isActive ? "Active" : "Inactive"}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> Expiration
              </p>
              <h3 className="text-xs font-semibold text-purple-900 mt-1.5 truncate" title={formatDate(stats.expiresAt)}>
                {stats.expiresAt ? new Date(stats.expiresAt).toLocaleDateString() : "No Expiry"}
              </h3>
            </div>
          </div>

          {/* Device & Country Breakdown */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Device breakdown */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Monitor size={14} className="text-slate-500" />
                Device Breakdown
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Monitor size={14} className="text-blue-600" /> Desktop
                  </span>
                  <span className="font-semibold text-slate-900">{metrics.devices.desktop} clicks</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Smartphone size={14} className="text-green-600" /> Mobile
                  </span>
                  <span className="font-semibold text-slate-900">{metrics.devices.mobile} clicks</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Tablet size={14} className="text-purple-600" /> Tablet
                  </span>
                  <span className="font-semibold text-slate-900">{metrics.devices.tablet} clicks</span>
                </div>
              </div>
            </div>

            {/* Top Countries */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Globe size={14} className="text-slate-500" />
                Top Geographic Locations
              </h4>
              {metrics.countries.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No geo data recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.countries.map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{country}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-800">
                        {count} {count === 1 ? "click" : "clicks"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Target URL Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Destination URL</p>
            <a
              href={stats.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 font-medium break-all flex items-center gap-1.5 hover:underline"
            >
              <span>{stats.originalUrl}</span>
              <ExternalLink size={14} className="shrink-0" />
            </a>
          </div>

          {/* Click History Log */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Click Activity</h4>
              <span className="text-xs text-slate-500">{stats.clickHistory?.length || 0} recorded</span>
            </div>

            {(!stats.clickHistory || stats.clickHistory.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No clicks recorded for this URL yet. Share your short link to start tracking.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {stats.clickHistory
                  .slice()
                  .reverse()
                  .map((click, index) => (
                    <div key={index} className="p-3.5 hover:bg-slate-50 transition-colors text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">
                          {formatDate(click.clickedAt)}
                        </p>
                        <p className="text-slate-400 mt-0.5 font-mono text-[11px] truncate max-w-sm" title={click.userAgent}>
                          {click.userAgent || "Unknown Device"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {click.country && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px]">
                            {click.country}{click.region ? `, ${click.region}` : ""}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px]">
                          {click.ipAddress || "Unknown IP"}
                        </span>
                      </div>
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