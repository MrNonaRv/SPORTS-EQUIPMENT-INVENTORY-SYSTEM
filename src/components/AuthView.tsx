import React, { useState } from 'react';
import { Key, User as UserIcon, ClipboardList } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 relative">
        <button 
          onClick={() => setView('landing')}
          className="absolute top-4 left-4 text-slate-500 hover:text-slate-900 flex items-center text-sm"
        >
          &larr; Back
        </button>

        <div className="flex justify-center mb-6 mt-4">
          {type === 'signup' ? (
            <ClipboardList className="w-12 h-12 text-slate-900" />
          ) : (
            <Key className="w-12 h-12 text-blue-700" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">
          {type === 'login_admin' && 'Admin Sign In Cluster'}
          {type === 'login_borrower' && 'Borrower Sign In Portal'}
          {type === 'signup' && 'Create Account'}
        </h2>

        <p className="text-slate-500 text-sm text-center mb-8">
          {type === 'login_admin' && 'Enter your specialized administrator authentication credentials'}
          {type === 'login_borrower' && 'Enter your authorized Student or Faculty registration ID key'}
          {type === 'signup' && 'Your account needs admin approval before you can borrow.'}
        </p>

        <form onSubmit={type === 'signup' ? handleSignup : handleLogin} className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Full Name</label>
              <input 
                required
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              {type === 'login_admin' ? 'Username' : 'ID Number'}
            </label>
            <input 
              required
              type="text" 
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          {type === 'login_admin' && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
          )}

          {type === 'signup' && (
            <>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Account Type</label>
                <select 
                  value={accountType}
                  onChange={e => setAccountType(e.target.value as 'student' | 'faculty')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Course / Department</label>
                <input 
                  required
                  type="text" 
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Contact Number</label>
                <input 
                  required
                  type="text" 
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>
            </>
          )}

          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded">{error}</div>}
          {success && <div className="text-green-400 text-sm bg-green-400/10 p-3 rounded">{success}</div>}

          {type === 'login_borrower' && idNumber && !error && (
            <div className="text-green-400 text-xs bg-green-400/10 p-2 rounded">
              Ready to access your dashboard.
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition mt-4"
          >
            {type === 'signup' ? 'Submit for Approval' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {type !== 'signup' ? (
            <p>Don't have an account? <span onClick={() => setView('signup')} className="text-blue-700 cursor-pointer hover:underline">Sign Up</span> | <span onClick={() => setView('landing')} className="cursor-pointer hover:underline">Cancel</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setView('login_borrower')} className="text-blue-700 cursor-pointer hover:underline">Sign In</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
