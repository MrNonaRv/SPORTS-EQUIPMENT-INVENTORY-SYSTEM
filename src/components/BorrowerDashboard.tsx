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
  const [cart, setCart] = useState<{equipmentId: string, quantity: number}[]>([]);
  const [purpose, setPurpose] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const addToCartDirect = (eqId: string) => {
    const existingIndex = cart.findIndex(item => item.equipmentId === eqId);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { equipmentId: eqId, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (index: number, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(index);
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQty;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || cart.length === 0) return;
    
    const newReq: BorrowRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      items: cart,
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
      setCart([]);
      setPurpose('');
      setPickupDate('');
      setReturnDate('');
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
              <div className="flex flex-wrap items-center justify-between gap-2 mb-8">
                <p className="text-slate-500 text-sm">Quick look into active items and sports tracking items counts</p>
                <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Cloud Real-Time Sync Active
                </span>
              </div>

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
                        const items = req.items && req.items.length > 0 ? req.items : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                        return (
                          <tr key={req.id} className="hover:bg-slate-100">
                            <td className="px-6 py-4 font-medium">
                              {items.map((item, idx) => {
                                const eq = equipment.find(e => e.id === item.equipmentId);
                                return <div key={idx} className="mb-1">{item.quantity}x {eq?.name || 'Unknown Item'}</div>
                              })}
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs">
                              <div>Pickup: {new Date(req.pickupDate).toLocaleString()}</div>
                              <div>Return: {new Date(req.returnDate).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                            <td className="px-6 py-4">{req.purpose}</td>
                            <td className="px-6 py-4 text-center">
                              <StatusBadge status={req.status} />
                              {req.status === 'approved' && (
                                <button 
                                  onClick={() => updateRequestStatus(req.id, 'return_pending')}
                                  className="mt-2 block w-full text-[10px] bg-blue-500 hover:bg-blue-600 text-white py-1 rounded transition"
                                >
                                  Return Items
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
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-700 mb-1">Equipment Catalog</h2>
                <p className="text-slate-500 text-sm">Select items to build your borrow voucher, then submit for administrator approval.</p>
              </div>

              {submitSuccess ? (
                <div className="bg-white border border-green-200 rounded-xl p-12 flex flex-col items-center justify-center text-green-600 shadow-sm">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Request Submitted Successfully!</h3>
                  <p className="text-slate-500 text-sm">Your voucher has been sent to the admin. Check the Notifications tab for updates.</p>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Equipment Grid */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {equipment.map(eq => {
                        const inCartCount = cart.find(c => c.equipmentId === eq.id)?.quantity || 0;
                        const availableToAdd = eq.available - inCartCount;
                        return (
                          <div key={eq.id} className="border border-slate-200 bg-white p-5 rounded-xl hover:border-blue-300 hover:shadow-sm transition flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{eq.name}</h3>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{eq.category}</p>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${eq.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {eq.available} Left
                              </span>
                            </div>
                            
                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                              <span className="text-xs text-slate-500">
                                {inCartCount > 0 && <span className="font-semibold text-blue-600">{inCartCount} in cart</span>}
                              </span>
                              <button 
                                type="button"
                                disabled={availableToAdd <= 0}
                                onClick={() => addToCartDirect(eq.id)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                                  availableToAdd > 0 
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {availableToAdd <= 0 && eq.available > 0 ? 'Max Added' : '+ Add'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Checkout Form */}
                  <div className="w-full lg:w-[400px]">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Box className="w-5 h-5 text-blue-600" />
                        Your Voucher Cart
                      </h3>
                      
                      <form onSubmit={handleBorrowSubmit}>
                        {/* Cart Items List */}
                        <div className="mb-6">
                          {cart.length > 0 ? (
                            <ul className="space-y-3">
                              {cart.map((item, index) => {
                                const eq = equipment.find(e => e.id === item.equipmentId);
                                const maxAvail = eq?.available || 0;
                                return (
                                  <li key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex-1 min-w-0 pr-4">
                                      <div className="text-sm font-semibold text-slate-800 truncate">{eq?.name}</div>
                                      <button type="button" onClick={() => removeFromCart(index)} className="text-[10px] text-red-500 hover:text-red-700 uppercase font-bold mt-1">Remove</button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button type="button" onClick={() => updateCartQuantity(index, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 font-bold">-</button>
                                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                      <button type="button" disabled={item.quantity >= maxAvail} onClick={() => updateCartQuantity(index, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50 font-bold">+</button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                              <p className="text-sm font-medium">Cart is empty</p>
                              <p className="text-xs mt-1">Add equipment from the catalog</p>
                            </div>
                          )}
                        </div>

                        {/* Form Details */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Intended Purpose</label>
                            <input 
                              required
                              type="text" 
                              placeholder="e.g. Class Activity, Practice"
                              value={purpose}
                              onChange={e => setPurpose(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Pickup Time</label>
                            <input 
                              required
                              type="datetime-local" 
                              value={pickupDate}
                              onChange={e => setPickupDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Return Deadline</label>
                            <input 
                              required
                              type="datetime-local" 
                              value={returnDate}
                              onChange={e => setReturnDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                          </div>

                          <button 
                            type="submit"
                            disabled={cart.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg mt-2 flex justify-center items-center space-x-2 transition shadow-sm"
                          >
                            <CalendarPlus className="w-5 h-5" />
                            <span>Submit Request</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto">
               <h2 className="text-2xl font-bold text-blue-700 mb-2">Voucher & Account Notifications</h2>
               <p className="text-slate-500 text-sm mb-6">Real-time alerts regarding registration status and return countdown deadlines</p>

               <div className="space-y-4">
                  {userRequests.map(req => {
                    const items = req.items && req.items.length > 0 ? req.items : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                    const itemDescriptions = items.map(item => {
                      const eq = equipment.find(e => e.id === item.equipmentId);
                      return `${item.quantity}x ${eq?.name || 'Item'}`;
                    }).join(', ');
                    
                    return (
                      <div key={req.id} className="bg-white border-l-4 border-blue-700 p-4 rounded-r-lg shadow-sm">
                        <div className="font-semibold text-slate-900 mb-1">
                          {req.status === 'pending' && 'Borrow Request Submitted!'}
                          {req.status === 'approved' && <span className="text-green-600 flex items-center space-x-2"><Check className="w-4 h-4"/> <span>Borrow Request Approved!</span></span>}
                          {req.status === 'declined' && <span className="text-red-500">Borrow Request Declined.</span>}
                          {req.status === 'returned' && 'Return Confirmed by Admin!'}
                        </div>
                        <p className="text-slate-500 text-sm">
                          Your request for <span className="font-medium text-slate-700">{itemDescriptions}</span> {req.status === 'pending' ? 'has been sent to the admin for review' : `is currently marked as ${req.status}`}. Pickup: {new Date(req.pickupDate).toLocaleString()} | Return by: {new Date(req.returnDate).toLocaleString()}
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
