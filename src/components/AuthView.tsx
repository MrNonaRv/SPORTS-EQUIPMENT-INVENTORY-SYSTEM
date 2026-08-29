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
      const user = users.find(u => u.id === idNumber && (u.role === 'student' || u.role === 'faculty'));
      if (user) {
        if (user.status === 'approved') {
          login(user);
        } else {
          setError(`Account is currently ${user.status}.`);
        }
      } else {
        setError('ID not found. Please register first.');
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
      status: 'pending'
    };

    registerUser(newUser);
    setSuccess('Registration submitted! Awaiting admin approval.');
    setTimeout(() => {
      setView('landing');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative">
      {/* Sporty Header Accent */}
      <div className="h-4 bg-emerald-900 w-full absolute top-0 left-0"></div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top colored banner for the card */}
          <div className="bg-emerald-900 p-6 flex flex-col items-center justify-center relative">
            <button 
              onClick={() => setView('landing')}
              className="absolute top-4 left-4 text-emerald-300 hover:text-white flex items-center text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <div className="bg-white p-3 rounded-full mb-3 shadow-md mt-6">
              {type === 'signup' ? (
                <ClipboardList className="w-8 h-8 text-emerald-900" />
              ) : type === 'login_admin' ? (
                <Key className="w-8 h-8 text-emerald-900" />
              ) : (
                <UserIcon className="w-8 h-8 text-emerald-900" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white text-center">
              {type === 'login_admin' && 'Admin Login'}
              {type === 'login_borrower' && 'Borrower Portal'}
              {type === 'signup' && 'Create Account'}
            </h2>
            <p className="text-emerald-200 text-sm text-center mt-2 max-w-[280px]">
              {type === 'login_admin' && 'Enter your administrator credentials'}
              {type === 'login_borrower' && 'Enter your student or faculty ID'}
              {type === 'signup' && 'Register to borrow athletic equipment'}
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={type === 'signup' ? handleSignup : handleLogin} className="space-y-5">
              {type === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {type === 'login_admin' ? 'Username' : 'ID Number'}
                </label>
                <input 
                  required
                  type="text" 
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition-all"
                />
              </div>

              {type === 'login_admin' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition-all"
                  />
                </div>
              )}

              {type === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Account Type</label>
                    <select 
                      value={accountType}
                      onChange={e => setAccountType(e.target.value as 'student' | 'faculty')}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition-all"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Course / Department</label>
                    <input 
                      required
                      type="text" 
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number</label>
                    <input 
                      required
                      type="text" 
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition-all"
                    />
                  </div>
                </>
              )}

              {error && <div className="text-red-700 text-sm font-medium bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
              {success && <div className="text-emerald-700 text-sm font-medium bg-emerald-50 border border-emerald-200 p-3 rounded-lg">{success}</div>}

              {type === 'login_borrower' && idNumber && !error && (
                <div className="text-emerald-700 text-sm font-medium bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  Ready to access your dashboard.
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-md mt-4 text-lg"
              >
                {type === 'signup' ? 'Submit for Approval' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
              {type !== 'signup' ? (
                <p>Don't have an account? <span onClick={() => setView('signup')} className="text-emerald-700 font-bold cursor-pointer hover:underline">Sign Up</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => setView('login_borrower')} className="text-emerald-700 font-bold cursor-pointer hover:underline">Sign In</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

