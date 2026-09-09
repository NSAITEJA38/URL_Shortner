import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/userApi";
import { Mail, ArrowLeft, Send, ExternalLink, Copy, Check } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    setResetUrl("");

    try {
      const res = await forgotPassword({ email });
      setMessage(res.data.message || "Password reset link generated.");
      if (res.data.resetUrl || res.data.data) {
        setResetUrl(res.data.resetUrl || res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!resetUrl) return;
    await navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert full reset URL to relative path if on same domain
  const getRelativeResetPath = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname;
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password</h2>
          <p className="text-slate-500 mt-2 text-sm">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-4 border border-green-100 font-medium">
            {message}
          </div>
        )}

        {resetUrl ? (
          <div className="space-y-4 my-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Direct Password Reset Link
            </p>
            <div className="flex items-center gap-2">
              <Link
                to={getRelativeResetPath(resetUrl)}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Reset Password Now</span>
                <ExternalLink size={15} />
              </Link>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Copy Link"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-mono break-all bg-white p-2 rounded-lg border border-slate-100">
              {resetUrl}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 focus:bg-white transition-colors"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:shadow-none"
            >
              {loading ? "Generating..." : "Send Reset Link"}
              {!loading && <Send size={18} />}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
