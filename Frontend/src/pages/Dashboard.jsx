import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import UrlForm from "../components/UrlForm";
import UrlTable from "../components/UrlTable";
import StatsModal from "../components/StatsModal";
import { getAllUrls } from "../api/urlApi";
import { RefreshCw, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStats, setSelectedStats] = useState(null);

  const fetchUrls = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await getAllUrls();
      setUrls(res.data?.data || []);
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initFetch = async () => {
      try {
        const res = await getAllUrls();
        if (isMounted) setUrls(res.data?.data || []);
      } catch (err) {
        console.error(err.response?.data?.message || err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initFetch();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const activeUrls = urls.filter((url) => url.isActive).length;
  const inactiveUrls = urls.length - activeUrls;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Create short URLs, track clicks, generate QR codes, and manage links.
            </p>
          </div>

          <button
            onClick={fetchUrls}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium flex items-center gap-2 w-fit transition-colors disabled:opacity-60 shadow-sm"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total URLs</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{urls.length}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clicks</p>
            <h2 className="text-3xl font-extrabold text-blue-600 mt-1">{totalClicks}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active / Inactive</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {activeUrls} <span className="text-slate-400 font-normal text-xl">/</span> {inactiveUrls}
            </h2>
          </div>
        </div>

        <UrlForm onCreated={fetchUrls} />

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading your links...</p>
          </div>
        ) : (
          <UrlTable
            urls={urls}
            onRefresh={fetchUrls}
            onShowStats={setSelectedStats}
          />
        )}
      </main>

      <StatsModal
        stats={selectedStats}
        onClose={() => setSelectedStats(null)}
      />
    </div>
  );
};

export default Dashboard;