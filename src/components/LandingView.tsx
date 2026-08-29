import React from 'react';
import { Settings, Lock, FileText, User, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LandingView: React.FC = () => {
  const { setView } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-emerald-900 text-white relative z-10 shadow-md">
        <div className="flex items-center space-x-3 font-semibold tracking-wide text-lg">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <span>CSU - MSAC Sports Inventory</span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setView('public_dashboard')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 transition shadow-md"
          >
            <span>Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-emerald-900 pt-16 pb-32 px-6 relative z-0">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Sports & Equipment <br/>
            <span className="text-amber-500">Inventory System</span>
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Capiz State University - Mambusao Satellite College. <br className="hidden md:block" />
            A streamlined portal for administrators, faculty, and students to manage and borrow athletic equipment.
          </p>
        </div>
      </div>

      {/* Main Content - Cards */}
      <main className="flex-1 px-6 pb-16 -mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          {/* Admin Card */}
          <div 
            onClick={() => setView('login_admin')}
            className="bg-white border-b-4 border-amber-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group shadow-lg"
          >
            <div className="bg-emerald-50 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <Lock className="w-10 h-10 text-emerald-900" />
            </div>
            <h2 className="text-emerald-900 font-bold text-2xl mb-3">Administrator</h2>
            <p className="text-slate-600 text-center text-base leading-relaxed">
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
            className="bg-white border-b-4 border-amber-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group shadow-lg"
          >
            <div className="bg-emerald-50 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <FileText className="w-10 h-10 text-emerald-900" />
            </div>
            <h2 className="text-emerald-900 font-bold text-2xl mb-3">Create Account</h2>
            <p className="text-slate-600 text-center text-base leading-relaxed">
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
            className="bg-white border-b-4 border-amber-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group shadow-lg"
          >
            <div className="bg-emerald-50 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <User className="w-10 h-10 text-emerald-900" />
            </div>
            <h2 className="text-emerald-900 font-bold text-2xl mb-3">Borrower Login</h2>
            <p className="text-slate-600 text-center text-base leading-relaxed">
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
      <footer className="py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Capiz State University - MSAC. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingView;

