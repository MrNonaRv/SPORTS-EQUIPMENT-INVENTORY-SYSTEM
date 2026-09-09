import React from 'react';
import { Settings, Lock, FileText, User, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LandingView: React.FC = () => {
  const { setView } = useAppContext();

  return (
    <div 
      className="min-h-screen text-slate-900 flex flex-col font-sans relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2000&auto=format&fit=crop")' }}
    >
      <div className="absolute inset-0 bg-emerald-900/85 backdrop-blur-sm z-0"></div>
      
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-emerald-900/50 backdrop-blur-md text-white relative z-10 shadow-md border-b border-emerald-800/50">
        <div className="flex items-center space-x-3 tracking-wide">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <span className="font-teko text-3xl tracking-widest uppercase mt-1">CSU - MSAC Sports Inventory</span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setView('public_dashboard')}
            className="flex items-center space-x-2 px-5 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 transition shadow-md"
          >
            <span>Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-20 pb-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-teko text-7xl md:text-8xl font-medium text-white mb-2 tracking-wide leading-none uppercase drop-shadow-xl">
            Sports & Equipment <br/>
            <span className="text-amber-500 drop-shadow-xl">Inventory System</span>
          </h1>
          <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Capiz State University - Mambusao Satellite College. <br className="hidden md:block" />
            A streamlined portal for administrators, faculty, and students to manage and borrow athletic equipment.
          </p>
        </div>
      </div>

      {/* Main Content - Cards */}
      <main className="flex-1 px-6 pb-16 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          {/* Admin Card */}
          <div 
            onClick={() => setView('login_admin')}
            className="bg-white/95 backdrop-blur-md border-b-4 border-amber-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:bg-white transition-all duration-300 group shadow-xl"
          >
            <div className="bg-emerald-50 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all shadow-inner">
              <Lock className="w-10 h-10 text-emerald-900" />
            </div>
            <h2 className="font-teko text-emerald-900 text-4xl mb-2 uppercase tracking-wide">Administrator</h2>
            <p className="text-slate-600 text-center text-sm leading-relaxed">
              System management, inventory oversight, and request approvals.
            </p>
            <div className="mt-6 text-amber-600 font-semibold flex items-center space-x-2 group-hover:text-amber-700">
              <span>Admin Login</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Sign Up Card */}
          <div 
            onClick={() => setView('signup')}
            className="bg-white/95 backdrop-blur-md border-b-4 border-amber-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:bg-white transition-all duration-300 group shadow-xl"
          >
            <div className="bg-emerald-50 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all shadow-inner">
              <FileText className="w-10 h-10 text-emerald-900" />
            </div>
            <h2 className="font-teko text-emerald-900 text-4xl mb-2 uppercase tracking-wide">Create Account</h2>
            <p className="text-slate-600 text-center text-sm leading-relaxed">
              New faculty or student borrower? Register for access here.
            </p>
            <div className="mt-6 text-amber-600 font-semibold flex items-center space-x-2 group-hover:text-amber-700">
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Sign In Card */}
          <div 
            onClick={() => setView('login_borrower')}
            className="bg-white/95 backdrop-blur-md border-b-4 border-amber-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:bg-white transition-all duration-300 group shadow-xl"
          >
            <div className="bg-emerald-50 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all shadow-inner">
              <User className="w-10 h-10 text-emerald-900" />
            </div>
            <h2 className="font-teko text-emerald-900 text-4xl mb-2 uppercase tracking-wide">Borrower Login</h2>
            <p className="text-slate-600 text-center text-sm leading-relaxed">
              Returning students & faculty. View catalog and request items.
            </p>
            <div className="mt-6 text-amber-600 font-semibold flex items-center space-x-2 group-hover:text-amber-700">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-emerald-100/60 text-sm relative z-10 font-medium tracking-wide">
        <p>&copy; {new Date().getFullYear()} Capiz State University - MSAC. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingView;

