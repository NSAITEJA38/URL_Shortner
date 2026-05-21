import React, { useState } from "react";
import { createShortUrl } from "../api/urlApi";
import { Plus, Loader2 } from "lucide-react";

const UrlForm = ({ onCreated }) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [createdUrl, setCreatedUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setCreatedUrl(null);

    try {
      setLoading(true);

      const payload = {
        originalUrl,
        customCode: customCode || undefined,
        expiresAt: expiresAt || undefined
      };

      const res = await createShortUrl(payload);

      setMessage(res.data.message);
      setMessageType("success");
      setCreatedUrl(res.data.data);

      setOriginalUrl("");
      setCustomCode("");
      setExpiresAt("");

      onCreated();
    } catch (err) {
      console.log("Create URL Error:", err);
      console.log("Backend response:", err.response?.data);

      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!createdUrl?.shortUrl) return;

    await navigator.clipboard.writeText(createdUrl.shortUrl);

    setMessage("Short URL copied to clipboard");
    setMessageType("success");
  };

  const handleShare = async () => {
    if (!createdUrl?.shortUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this link',
          url: createdUrl.shortUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setMessage("Sharing is not supported on this browser.");
      setMessageType("error");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Create Short URL</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter a long URL and optionally add a custom alias and expiry date.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label htmlFor="originalUrl" className="text-sm font-medium text-slate-700">
            Original URL
          </label>
          <input
            type="text"
            id="originalUrl"
            name="originalUrl"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customCode" className="text-sm font-medium text-slate-700">
              Custom Alias Optional
            </label>
            <input
              type="text"
              id="customCode"
              name="customCode"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="amazon, portfolio, github"
              className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="expiresAt" className="text-sm font-medium text-slate-700">
              Expiry Date Optional
            </label>
            <input
              type="date"
              id="expiresAt"
              name="expiresAt"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-fit px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Plus size={18} />
          )}
          {loading ? "Creating..." : "Create Short URL"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-semibold ${
            messageType === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      {createdUrl && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-500">Generated Short URL</p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
            <a
              href={createdUrl.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-semibold break-all"
            >
              {createdUrl.shortUrl}
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors shadow-sm"
              >
                Share
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm transition-colors shadow-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm;