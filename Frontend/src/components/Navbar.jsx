import React, { useContext } from "react";
import { Link2, LogOut, User } from "lucide-react";
import { UserContext } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
          <Link2 size={22} />
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">URL Shortener</h1>
          <p className="text-xs text-slate-500 hidden sm:block">Shorten, manage and track links</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-all bg-blue-50 hover:bg-blue-100 px-3 py-2 sm:px-4 rounded-xl border border-blue-200/50 shadow-sm">
              <User size={16} className="text-blue-600 shrink-0" />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-all bg-red-50 hover:bg-red-100 px-3 py-2 sm:px-4 rounded-xl border border-red-200/50 shadow-sm">
              <LogOut size={16} className="shrink-0" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;