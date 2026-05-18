import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import UrlForm from "../components/UrlForm";
import UrlTable from "../components/UrlTable";
import StatsModal from "../components/StatsModal";
import { getAllUrls } from "../api/urlApi";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStats, setSelectedStats] = useState(null);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const res = await getAllUrls();
      setUrls(res.data.data);
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeUrls = urls.filter((url) => url.isActive).length;
  const inactiveUrls = urls.length - activeUrls;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Create short URLs, track clicks, and manage link status.
            </p>
          </div>

          <button
            onClick={fetchUrls}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2 w-fit"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total URLs</p>
            <h2 className="text-3xl font-bold text-slate-900">{urls.length}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total Clicks</p>
            <h2 className="text-3xl font-bold text-blue-600">{totalClicks}</h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Active / Inactive</p>
            <h2 className="text-3xl font-bold text-slate-900">
              {activeUrls} / {inactiveUrls}
            </h2>
          </div>
        </div>

        <UrlForm onCreated={fetchUrls} />

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            Loading URLs...
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