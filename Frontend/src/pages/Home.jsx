import Navbar from "../components/Navbar";
import UrlForm from "../components/UrlForm";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6 mt-10 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Shorten Your Links <span className="text-blue-600">Instantly</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-2">
            Create short, memorable links in seconds. No registration required.
            Sign up to track clicks, manage your links, and more!
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* We pass a no-op to onCreated since there is no table to refresh on the home page */}
          <UrlForm onCreated={() => {}} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-center mt-16 pt-10 border-t border-slate-200">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Paste your URL</h3>
            <p className="text-slate-500 text-sm">Any long link from any website will work perfectly.</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Customize it</h3>
            <p className="text-slate-500 text-sm">Add a custom alias so people remember your link easily.</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Share anywhere</h3>
            <p className="text-slate-500 text-sm">Copy your new short link and paste it in emails, social media, or anywhere.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
