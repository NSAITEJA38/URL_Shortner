import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import { User, Mail, Shield, Link2, BarChart2, Calendar, Activity } from "lucide-react";
import { getAllUrls } from "../api/urlApi";

const Profile = () => {
  const { user } = useContext(UserContext);
  const [urls, setUrls] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAllUrls();
        setUrls(res.data.data);
      } catch (error) {
        console.error("Failed to fetch URLs for stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!user) return null;

  const totalUrls = urls.length;
  const totalClicks = urls.reduce((acc, curr) => acc + curr.clicks, 0);
  const activeUrls = urls.filter(u => u.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 mt-4 sm:mt-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          {/* Gradient Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          </div>
          
          <div className="px-6 sm:px-8 pb-8 relative">
            {/* Avatar & Info */}
            <div className="-mt-16 mb-8 relative z-10 flex flex-col items-center sm:items-start">
              <div className="h-32 w-32 rounded-3xl bg-white p-2 shadow-lg transform transition-transform hover:scale-105 mb-4">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 text-5xl font-bold border border-blue-100">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-blue-600 font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-2 bg-blue-50 w-fit mx-auto sm:mx-0 px-3 py-1 rounded-md text-sm">
                  <Shield size={14} /> Verified Member
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md hover:border-blue-200 group">
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Link2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total URLs</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{loadingStats ? "..." : totalUrls}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md hover:border-indigo-200 group">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clicks</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{loadingStats ? "..." : totalClicks}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md hover:border-green-200 group">
                <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Links</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{loadingStats ? "..." : activeUrls}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-6 relative z-10">Account Information</h2>
          <div className="space-y-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                <User size={20} />
              </div>
              <div className="flex-1 border-b border-slate-100 pb-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Full Name</p>
                <p className="text-slate-900 font-medium text-base mt-1">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                <Mail size={20} />
              </div>
              <div className="flex-1 border-b border-slate-100 pb-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-slate-900 font-medium text-base mt-1">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Account ID</p>
                <div className="mt-1 flex items-center">
                  <p className="text-slate-700 font-medium font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm tracking-wide">{user._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Profile;
