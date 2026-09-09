import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check, QrCode } from "lucide-react";

const QrCodeModal = ({ urlData, onClose }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (urlData?.shortUrl && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        urlData.shortUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff"
          }
        },
        (error) => {
          if (!error) {
            setQrGenerated(true);
          } else {
            console.error("QR Code generation error:", error);
          }
        }
      );
    }
  }, [urlData]);

  if (!urlData) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${urlData.shortCode || "shorturl"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    if (!urlData.shortUrl) return;
    await navigator.clipboard.writeText(urlData.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">QR Code</h2>
              <p className="text-xs text-slate-500 font-mono">/{urlData.shortCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" />
          </div>

          <p className="mt-4 text-xs text-slate-500 text-center max-w-xs break-all">
            Scan with any phone camera to visit:
            <span className="block font-semibold text-blue-600 mt-0.5">{urlData.shortUrl}</span>
          </p>

          <div className="flex w-full gap-2 mt-6">
            <button
              onClick={handleDownload}
              disabled={!qrGenerated}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download size={16} />
              Download PNG
            </button>
            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Copy short link"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
