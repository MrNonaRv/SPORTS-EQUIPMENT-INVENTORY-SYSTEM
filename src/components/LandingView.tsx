import React from 'react';
import { Settings, Lock, FileText, User, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LandingView: React.FC = () => {
  const { setView, theme, toggleTheme } = useAppContext();
  const isLight = theme === 'light';

  return (
    <div 
      className={`min-h-screen ${isLight ? 'bg-white text-[#0a1c38]' : 'bg-[#0a1c38] text-slate-300'} flex flex-col font-sans relative bg-cover bg-center bg-fixed`}
      style={{ backgroundImage: isLight ? 'none' : 'url("https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2000&auto=format&fit=crop")' }}
    >
      <div className={`absolute inset-0 ${isLight ? 'bg-white' : 'bg-blue-950/90'} backdrop-blur-sm z-0`}></div>
      
      {/* Header */}
      <header className={`flex justify-between items-center p-6 ${isLight ? 'bg-white text-[#0a1c38] border-b border-slate-200' : 'bg-[#0a1228]/80 text-white border-b border-blue-900/50'} backdrop-blur-md relative z-10 shadow-md`}>
        <div className="flex items-center space-x-3 tracking-wide">
          <img src="/capsu-logo.png" alt="CapSU Logo" className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 shadow-md" />
          <span className={`font-display text-2xl sm:text-3xl font-bold tracking-wider uppercase ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>CAPSU SPORTS INVENTORY</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg ${isLight ? 'bg-slate-100 text-[#0a1c38] border border-slate-300 hover:bg-slate-200' : 'bg-blue-900/60 text-yellow-400 border border-blue-500/40 hover:bg-blue-800'} transition cursor-pointer flex items-center space-x-2 text-xs font-bold`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-[#0a1c38]" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={() => setView('public_dashboard')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-yellow-400 text-blue-950 font-bold rounded-lg hover:bg-yellow-300 transition shadow-md cursor-pointer"
          >
            <span>Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-20 pb-28 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className={`font-display text-6xl md:text-8xl font-bold mb-3 tracking-wide leading-none uppercase drop-shadow-xl ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>
            Sports &amp; Equipment <br/>
            <span className="text-yellow-500 drop-shadow-xl">Inventory System</span>
          </h1>
          <p className={`text-base md:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>
            Capiz State University - CapSu. <br className="hidden md:block" />
            A streamlined portal for administrators, faculty, and students to manage and borrow athletic equipment.
          </p>
        </div>
      </div>

      {/* Main Content - Cards */}
      <main className="flex-1 px-6 pb-16 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          {/* Admin Card */}
          <div 
            onClick={() => setView('login_admin')}
            className={`${isLight ? 'bg-white text-[#0a1c38] border border-slate-200' : 'bg-[#0e264c]/95 text-white border border-blue-600/40'} backdrop-blur-md border-t-4 border-t-yellow-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:border-yellow-400 hover:shadow-[0_10px_25px_-5px_rgba(250,204,21,0.2)] transition-all duration-300 group shadow-xl`}
          >
            <div className={`${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#07152b] border-blue-600/50'} border p-5 rounded-full mb-6 group-hover:scale-110 group-hover:border-yellow-400 transition-all shadow-md`}>
              <Lock className="w-9 h-9 text-yellow-500" />
            </div>
            <h2 className={`font-display text-3xl mb-2 uppercase tracking-wide font-bold ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>Administrator</h2>
            <p className={`text-center text-sm leading-relaxed ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>
              System management, inventory oversight, and request approvals.
            </p>
            <div className="mt-6 text-yellow-500 font-bold flex items-center space-x-2 group-hover:text-yellow-600">
              <span>Admin Login</span>
              <ArrowRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Sign Up Card */}
          <div 
            onClick={() => setView('signup')}
            className={`${isLight ? 'bg-white text-[#0a1c38] border border-slate-200' : 'bg-[#0e264c]/95 text-white border border-blue-600/40'} backdrop-blur-md border-t-4 border-t-yellow-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:border-yellow-400 hover:shadow-[0_10px_25px_-5px_rgba(250,204,21,0.2)] transition-all duration-300 group shadow-xl`}
          >
            <div className={`${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#07152b] border-blue-600/50'} border p-5 rounded-full mb-6 group-hover:scale-110 group-hover:border-yellow-400 transition-all shadow-md`}>
              <FileText className="w-9 h-9 text-yellow-500" />
            </div>
            <h2 className={`font-display text-3xl mb-2 uppercase tracking-wide font-bold ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>Create Account</h2>
            <p className={`text-center text-sm leading-relaxed ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>
              New faculty or student borrower? Register for access here.
            </p>
            <div className="mt-6 text-yellow-500 font-bold flex items-center space-x-2 group-hover:text-yellow-600">
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Sign In Card */}
          <div 
            onClick={() => setView('login_borrower')}
            className={`${isLight ? 'bg-white text-[#0a1c38] border border-slate-200' : 'bg-[#0e264c]/95 text-white border border-blue-600/40'} backdrop-blur-md border-t-4 border-t-yellow-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:border-yellow-400 hover:shadow-[0_10px_25px_-5px_rgba(250,204,21,0.2)] transition-all duration-300 group shadow-xl`}
          >
            <div className={`${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#07152b] border-blue-600/50'} border p-5 rounded-full mb-6 group-hover:scale-110 group-hover:border-yellow-400 transition-all shadow-md`}>
              <User className="w-9 h-9 text-yellow-500" />
            </div>
            <h2 className={`font-display text-3xl mb-2 uppercase tracking-wide font-bold ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>Borrower Login</h2>
            <p className={`text-center text-sm leading-relaxed ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>
              Returning students &amp; faculty. View catalog and request items.
            </p>
            <div className="mt-6 text-yellow-500 font-bold flex items-center space-x-2 group-hover:text-yellow-600">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className={`py-8 text-center text-sm relative z-10 font-medium tracking-wide border-t ${isLight ? 'border-slate-200 text-[#0a1c38]' : 'border-blue-900/40 text-slate-400'}`}>
        <p>&copy; {new Date().getFullYear()} Capiz State University - CapSu. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingView;

