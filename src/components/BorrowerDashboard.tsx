import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, LayoutDashboard, CalendarPlus, Bell, Box, Check, RefreshCw, Wrench } from 'lucide-react';
import { BorrowRequest } from '../types';

export default function BorrowerDashboard() {
  const { currentUser, logout, equipment, requests, submitBorrowRequest, updateRequestStatus } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'borrow' | 'notifications'>('dashboard');

  const userRequests = requests.filter(r => r.userId === currentUser?.id);
  const activeBorrows = userRequests.filter(r => r.status === 'approved' || r.status === 'overdue').length;

  const totalUnits = equipment.reduce((acc, eq) => acc + eq.total, 0);
  const availableUnits = equipment.reduce((acc, eq) => acc + eq.available, 0);
  const forRepairUnits = equipment.reduce((acc, eq) => acc + eq.inRepair, 0);

  // Borrow Form State
  const [selectedEqId, setSelectedEqId] = useState(equipment[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const newReq: BorrowRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      equipmentId: selectedEqId,
      quantity: Number(quantity),
      purpose,
      pickupDate,
      returnDate,
      status: 'pending',
      requestDate: new Date().toISOString()
    };
    submitBorrowRequest(newReq);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('dashboard');
    }, 2000);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
            {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
          </div>
          <h3 className="font-bold">{currentUser.name}</h3>
          <p className="text-xs text-blue-700 uppercase tracking-wider">{currentUser.role} BORROWER</p>
        </div>
        
        <nav className="flex-1 py-4">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<CalendarPlus />} label="Borrow" active={activeTab === 'borrow'} onClick={() => setActiveTab('borrow')} />
          <NavItem icon={<Bell />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={userRequests.filter(r => r.status === 'pending').length} />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-500">
            CSU Sports Tracker - Borrower Access Panel
          </div>
          <div className="text-sm flex items-center space-x-2">
            <UserCircle className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Authenticated: </span>
            <span className="text-blue-700 font-medium">{currentUser.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">Personal Overview Dashboard</h2>
              <p className="text-slate-500 text-sm mb-8">Quick look into active items and sports tracking items counts</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="TOTAL EQUIPMENT" count={totalUnits} subtext="Campus stock listing" icon={<Box className="w-5 h-5" />} color="border-slate-200" />
                <StatCard title="AVAILABLE NOW" count={availableUnits} subtext="Ready to apply for" icon={<Check className="w-5 h-5 text-green-500" />} color="border-green-500/30" />
                <StatCard title="MY ACTIVE BORROWS" count={activeBorrows} subtext="Items currently held" icon={<RefreshCw className="w-5 h-5 text-blue-500" />} color="border-blue-500/30" />
                <StatCard title="IN MAINTENANCE" count={forRepairUnits} subtext="Temporarily stored away" icon={<Wrench className="w-5 h-5 text-orange-500" />} color="border-orange-500/30" />
              </div>

              <h3 className="text-lg font-bold text-blue-700 mb-4">My Equipment Activity Logs Ledger</h3>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-blue-700 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Equipment Details</th>
                      <th className="px-6 py-3">Requested Term Dates</th>
                      <th className="px-6 py-3">Date Requested</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Purpose</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {userRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">You hold no tracked checkout vouchers histories.</td>
                      </tr>
                    ) : (
                      userRequests.map(req => {
                        const eq = equipment.find(e => e.id === req.equipmentId);
                        return (
                          <tr key={req.id} className="hover:bg-slate-100">
                            <td className="px-6 py-4 font-medium">{eq?.name}</td>
                            <td className="px-6 py-4 text-slate-600 text-xs">
                              <div>Pickup: {new Date(req.pickupDate).toLocaleString()}</div>
                              <div>Return: {new Date(req.returnDate).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{req.quantity}</td>
                            <td className="px-6 py-4">{req.purpose}</td>
                            <td className="px-6 py-4 text-center">
                              <StatusBadge status={req.status} />
                              {req.status === 'approved' && (
                                <button 
                                  onClick={() => updateRequestStatus(req.id, 'return_pending')}
                                  className="mt-2 block w-full text-[10px] bg-blue-500 hover:bg-blue-600 text-white py-1 rounded transition"
                                >
                                  Return Item
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'borrow' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-bold text-blue-700 mb-2">New Sports Equipment Borrow Voucher</h2>
              <p className="text-slate-500 text-xs mb-6">Submit voucher credentials for administrator approval matching real-time availability.</p>

              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-green-400">
                  <Check className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-bold">Request Sent!</h3>
                </div>
              ) : (
                <form onSubmit={handleBorrowSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Select Desired Sports Equipment</label>
                    <select 
                      required
                      value={selectedEqId}
                      onChange={e => setSelectedEqId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                    >
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.available} available)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Quantity to Borrow</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Intended Purpose / Usage</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Class Activity"
                      value={purpose}
                      onChange={e => setPurpose(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Pickup Date & Time</label>
                    <input 
                      required
                      type="datetime-local" 
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Expected Return Deadline</label>
                    <input 
                      required
                      type="datetime-local" 
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-4 flex justify-center items-center space-x-2 transition"
                  >
                    <CalendarPlus className="w-5 h-5" />
                    <span>Send Request</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto">
               <h2 className="text-2xl font-bold text-blue-700 mb-2">Voucher & Account Notifications</h2>
               <p className="text-slate-500 text-sm mb-6">Real-time alerts regarding registration status and return countdown deadlines</p>

               <div className="space-y-4">
                  {userRequests.map(req => {
                    const eq = equipment.find(e => e.id === req.equipmentId);
                    return (
                      <div key={req.id} className="bg-white border-l-4 border-blue-700 p-4 rounded-r-lg">
                        <div className="font-semibold text-slate-900 mb-1">
                          {req.status === 'pending' && 'Borrow Request Submitted!'}
                          {req.status === 'approved' && <span className="text-green-400 flex items-center space-x-2"><Check className="w-4 h-4"/> <span>Borrow Request Approved!</span></span>}
                          {req.status === 'declined' && <span className="text-red-400">Borrow Request Declined.</span>}
                          {req.status === 'returned' && 'Return Confirmed by Admin!'}
                        </div>
                        <p className="text-slate-500 text-sm">
                          Your request for {req.quantity}x {eq?.name} {req.status === 'pending' ? 'has been sent to the admin for review' : `is currently marked as ${req.status}`}. Pickup: {new Date(req.pickupDate).toLocaleString()} | Return by: {new Date(req.returnDate).toLocaleString()}
                        </p>
                      </div>
                    )
                  })}
                  <div className="bg-white border-l-4 border-green-500 p-4 rounded-r-lg">
                    <div className="font-semibold text-green-400 mb-1">Account Registration Approved Successfully!</div>
                    <p className="text-slate-500 text-sm">Welcome to Capiz State University Sports Management hub. You are authenticated to file borrow requests.</p>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-6 py-3 cursor-pointer border-l-4 transition ${active ? 'border-blue-700 bg-slate-50 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </div>
  );
}

function StatCard({ title, count, subtext, icon, color }: any) {
  return (
    <div className={`bg-white border-t-2 ${color} p-4 rounded-lg flex flex-col`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{count}</div>
      <div className="text-xs text-slate-400">{subtext}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <span className="text-orange-400 bg-orange-400/10 px-2 py-1 rounded text-xs font-medium">Pending</span>;
  if (status === 'approved') return <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-medium">Approved</span>;
  if (status === 'overdue') return <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-medium">Overdue Returns</span>;
  if (status === 'declined') return <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-medium">Declined</span>;
  if (status === 'returned') return <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs font-medium">Returned</span>;
  if (status === 'return_pending') return <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs font-medium">Returning...</span>;
  return null;
}

function UserCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>;
}
