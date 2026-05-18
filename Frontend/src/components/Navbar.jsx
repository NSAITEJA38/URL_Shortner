import React from "react";
import { Link2 } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
          <Link2 size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">URL Shortener</h1>
          <p className="text-xs text-slate-500">Shorten, manage and track links</p>
        </div>
      </div>

      <div className="text-sm text-slate-500">
        MERN Project
      </div>
    </nav>
  );
};

export default Navbar;