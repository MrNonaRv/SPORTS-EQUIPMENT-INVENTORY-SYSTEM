import React, { useState } from 'react';
import { Key, User as UserIcon, ClipboardList, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';

interface AuthViewProps {
  type: 'login_admin' | 'login_borrower' | 'signup';
}

const AuthView: React.FC<AuthViewProps> = ({ type }) => {
  const { setView, login, users, registerUser } = useAppContext();
  
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'faculty'>('student');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (type === 'login_admin') {
      const user = users.find(u => u.id === idNumber && u.password === password && u.role === 'admin');
      if (user) {
        login(user);
      } else {
        setError('Invalid admin credentials.');
      }
    } else {
      const user = users.find(u => u.id === idNumber && u.password === password && (u.role === 'student' || u.role === 'faculty'));
      if (user) {
        if (user.status === 'approved') {
          login(user);
        } else {
          setError(`Account is currently ${user.status}.`);
        }
      } else {
        setError('Invalid ID or password. Please register if you do not have an account.');
      }
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (users.find(u => u.id === idNumber)) {
      setError('ID already registered.');
      return;
    }

    const newUser: User = {
      id: idNumber,
      name: fullName,
      role: accountType,
      department,
      contact,
      status: 'pending',
      password
    };

    registerUser(newUser);
    setSuccess('Registration submitted! Awaiting admin approval.');
    setTimeout(() => {
      setView('landing');
    }, 2000);
  };

  return (
    <div 
      className="min-h-screen bg-[#080e1e] text-slate-300 flex flex-col font-sans relative bg-cover bg-center"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2000&auto=format&fit=crop")' }}
    >
      {/* Dark Navy Overlay */}
      <div className="absolute inset-0 bg-[#070d1e]/85 backdrop-blur-sm z-0"></div>

      {/* Sporty Yellow Accent Bar */}
      <div className="h-2 bg-yellow-400 w-full absolute top-0 left-0 z-10"></div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-[#101b38] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top colored banner for the card */}
          <div className="bg-[#0b142a] p-6 flex flex-col items-center justify-center relative border-b border-blue-900/50">
            <button 
              onClick={() => setView('landing')}
              className="absolute top-4 left-4 text-slate-400 hover:text-yellow-400 flex items-center text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <div className="bg-blue-900/60 p-3 rounded-full mb-3 shadow-md mt-6 border border-blue-700/50">
              {type === 'signup' ? (
                <ClipboardList className="w-8 h-8 text-yellow-400" />
              ) : type === 'login_admin' ? (
                <Key className="w-8 h-8 text-yellow-400" />
              ) : (
                <UserIcon className="w-8 h-8 text-yellow-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white text-center font-display tracking-wide uppercase">
              {type === 'login_admin' && 'Admin Login'}
              {type === 'login_borrower' && 'Borrower Portal'}
              {type === 'signup' && 'Create Account'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm text-center mt-1.5 max-w-[280px]">
              {type === 'login_admin' && 'Enter your administrator credentials'}
              {type === 'login_borrower' && 'Enter your student or faculty ID'}
              {type === 'signup' && 'Register to borrow athletic equipment'}
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={type === 'signup' ? handleSignup : handleLogin} className="space-y-4">
              {type === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 text-sm transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  {type === 'login_admin' ? 'Username' : 'ID Number'}
                </label>
                <input 
                  required
                  type="text" 
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Password</label>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 text-sm transition-all"
                />
              </div>

              {type === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Account Type</label>
                    <select 
                      value={accountType}
                      onChange={e => setAccountType(e.target.value as 'student' | 'faculty')}
                      className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 text-sm transition-all"
                    >
                      <option value="student" className="bg-[#0a1122] text-slate-200">Student</option>
                      <option value="faculty" className="bg-[#0a1122] text-slate-200">Faculty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Course / Department</label>
                    <input 
                      required
                      type="text" 
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Contact Number</label>
                    <input 
                      required
                      type="text" 
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 text-sm transition-all"
                    />
                  </div>
                </>
              )}

              {error && <div className="text-red-400 text-xs font-medium bg-red-950/60 border border-red-800/60 p-3 rounded-lg">{error}</div>}
              {success && <div className="text-yellow-300 text-xs font-medium bg-yellow-400/10 border border-yellow-400/40 p-3 rounded-lg">{success}</div>}

              {type === 'login_borrower' && idNumber && !error && (
                <div className="text-blue-300 text-xs font-medium bg-blue-950/60 border border-blue-800/60 p-3 rounded-lg">
                  Ready to access your dashboard.
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold py-3 rounded-lg transition-colors shadow-md mt-4 text-base cursor-pointer"
              >
                {type === 'signup' ? 'Submit for Approval' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              {type !== 'signup' ? (
                <p>Don't have an account? <span onClick={() => setView('signup')} className="text-yellow-400 font-bold cursor-pointer hover:underline">Sign Up</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => setView('login_borrower')} className="text-yellow-400 font-bold cursor-pointer hover:underline">Sign In</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

