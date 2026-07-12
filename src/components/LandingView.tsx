import React from 'react';
import { Settings, Lock, FileText, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LandingView: React.FC = () => {
  const { setView } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="flex justify-between items-center p-6 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-blue-700 font-semibold tracking-wide">
          <Settings className="w-5 h-5 text-slate-900" />
          <span>CSU - MSAC Sports Inventory</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView('public_dashboard')}
            className="flex items-center space-x-2 px-4 py-2 border border-blue-700/50 text-blue-700 rounded hover:bg-blue-600/10 transition"
          >
            <Settings className="w-4 h-4" />
            <span>View Dashboard</span>
          </button>
          <Settings className="w-5 h-5 text-slate-600 hover:text-slate-900 cursor-pointer" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4 tracking-tight">
            SPORTS & EQUIPMENT<br />INVENTORY SYSTEM
          </h1>
          <p className="text-slate-500 text-lg">Capiz State University - Mambusao Satellite College</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div 
            onClick={() => setView('login_admin')}
            className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition group"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-8 h-8 text-blue-700" />
            </div>
            <h2 className="text-blue-700 font-semibold text-lg mb-2">Admin</h2>
            <p className="text-slate-500 text-sm text-center">Manage inventory, users & approvals</p>
          </div>

          <div 
            onClick={() => setView('signup')}
            className="bg-slate-50 border border-blue-700/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition group"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-slate-900" />
            </div>
            <h2 className="text-blue-700 font-semibold text-lg mb-2">Sign Up</h2>
            <p className="text-slate-500 text-sm text-center">New borrower? Create your account</p>
          </div>

          <div 
            onClick={() => setView('login_borrower')}
            className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition group"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-[#00B4D8]" />
            </div>
            <h2 className="text-blue-700 font-semibold text-lg mb-2">Sign In</h2>
            <p className="text-slate-500 text-sm text-center">Students & Faculty borrowers</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingView;
