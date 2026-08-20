import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, LayoutDashboard, Users, Bell, UserCog, PackagePlus, FileBarChart, Check, X, RefreshCw, Box, Wrench, XCircle, Trophy } from 'lucide-react';
import { BorrowRequest, Equipment } from '../types';

export default function AdminDashboard() {
  const { currentUser, logout, users, equipment, requests, updateRequestStatus, updateUserStatus, addEquipment, updateUserDetails } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'users' | 'arrivals' | 'reports' | 'active_borrowers'>('dashboard');
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');

  // New Equipment State
  const [eqName, setEqName] = useState('');
  const [eqCat, setEqCat] = useState('Basketball');
  const [eqQty, setEqQty] = useState(1);
  const [eqCondition, setEqCondition] = useState('Good / Available');
  const [eqSupplier, setEqSupplier] = useState('');
  const [eqNotes, setEqNotes] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeRequests = requests.filter(r => r.status === 'approved' || r.status === 'overdue');
  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved' && u.role !== 'admin');

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      name: eqName,
      category: eqCat,
      total: eqQty,
      available: eqCondition === 'Good / Available' ? eqQty : 0,
      borrowed: 0,
      inRepair: eqCondition === 'For Repair' ? eqQty : 0,
      damaged: eqCondition === 'Damaged' ? eqQty : 0,
    };
    addEquipment(newEq);
    setAddSuccess(true);
    setEqName('');
    setTimeout(() => setAddSuccess(false), 3000);
  };

  const totalUnits = equipment.reduce((acc, eq) => acc + eq.total, 0);
  const availableUnits = equipment.reduce((acc, eq) => acc + eq.available, 0);
  const borrowedUnits = equipment.reduce((acc, eq) => acc + eq.borrowed, 0);
  const forRepairUnits = equipment.reduce((acc, eq) => acc + eq.inRepair, 0);
  const damagedUnits = equipment.reduce((acc, eq) => acc + eq.damaged, 0);
  const sportsTracksCount = new Set(equipment.map(e => e.category)).size;

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US');

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
          <p className="text-xs text-blue-700 uppercase tracking-wider">ADMINISTRATOR</p>
        </div>
        
        <nav className="flex-1 py-4">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users />} label="Active Borrowers" active={activeTab === 'active_borrowers'} onClick={() => setActiveTab('active_borrowers')} />
          <NavItem icon={<Bell />} label="Borrow Requests" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} badge={pendingRequests.length} />
          <NavItem icon={<UserCog />} label="Manage Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} badge={pendingUsers.length} />
          <NavItem icon={<PackagePlus />} label="New Arrivals" active={activeTab === 'arrivals'} onClick={() => setActiveTab('arrivals')} />
          <NavItem icon={<FileBarChart />} label="Reports Center" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-500">
            CSU Sports Inventory - Admin Control Center
          </div>
          <div className="text-sm flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-slate-500">Admin Profile: </span>
            {isEditingProfile ? (
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={editProfileName} 
                  onChange={e => setEditProfileName(e.target.value)}
                  className="px-2 py-0.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    if (editProfileName.trim() !== '') {
                      updateUserDetails(currentUser.id, { name: editProfileName.trim() });
                    }
                    setIsEditingProfile(false);
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">{currentUser.name}</span>
                <button 
                  onClick={() => {
                    setEditProfileName(currentUser.name);
                    setIsEditingProfile(true);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">

          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto relative">
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 border-b border-slate-200 pb-4">
                <span>📍 Location: Mambusao Campus</span>
                <span>🕒 Clock: {dateStr} - {timeStr}</span>
                <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Cloud Real-Time Sync Active
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 relative z-10">
                <StatCard onClick={() => setActiveOverlay('total')} title="TOTAL EQUIPMENT" count={totalUnits} subtext="Across all sports" icon={<Box className="w-6 h-6 text-slate-300" />} color="border-slate-200" />
                <StatCard onClick={() => setActiveOverlay('available')} title="AVAILABLE ITEMS" count={availableUnits} subtext="Ready to borrow" icon={<Check className="w-6 h-6 text-green-500/50" />} color="border-green-500/30" />
                <StatCard onClick={() => setActiveOverlay('borrowed')} title="BORROWED" count={borrowedUnits} subtext="Currently out" icon={<RefreshCw className="w-6 h-6 text-blue-500/50" />} color="border-blue-500/30" />
                <StatCard onClick={() => setActiveOverlay('repair')} title="FOR REPAIR" count={forRepairUnits} subtext="Under maintenance" icon={<Wrench className="w-6 h-6 text-orange-500/50" />} color="border-orange-500/30" />
                <StatCard onClick={() => setActiveOverlay('damaged')} title="DAMAGED UNITS" count={damagedUnits} subtext="Unserviceable" icon={<XCircle className="w-6 h-6 text-red-500/50" />} color="border-red-500/30" />
                <StatCard onClick={() => setActiveOverlay('sports')} title="SPORTS TRACKS" count={sportsTracksCount} subtext="Active sports" icon={<Trophy className="w-6 h-6 text-blue-700/50" />} color="border-blue-700/30" />
              </div>

              {activeOverlay && (
                <div className="absolute left-0 right-0 top-[180px] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-6">
                  <ActiveLogsOverlay type={activeOverlay} onClose={() => setActiveOverlay(null)} equipment={equipment} requests={requests} users={users} />
                </div>
              )}

              <h2 className="text-xl font-bold text-blue-700 mb-4">Public Equipment Status Availability</h2>
              
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-blue-700 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Equipment Name</th>
                      <th className="px-6 py-4 font-semibold">Sport</th>
                      <th className="px-6 py-4 font-semibold text-center">Total Units</th>
                      <th className="px-6 py-4 font-semibold text-center">Available</th>
                      <th className="px-6 py-4 font-semibold text-center">Borrowed</th>
                      <th className="px-6 py-4 font-semibold text-center">In Repair</th>
                      <th className="px-6 py-4 font-semibold text-center">Damaged</th>
                      <th className="px-6 py-4 font-semibold text-center">Status Badge</th>
                      <th className="px-6 py-4 font-semibold text-center">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {equipment.map((eq, i) => (
                      <tr key={eq.id} className="hover:bg-slate-100 transition">
                        <td className="px-6 py-4 font-medium flex items-center space-x-2">
                          <span>{eq.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{eq.category}</td>
                        <td className="px-6 py-4 text-center">{eq.total}</td>
                        <td className="px-6 py-4 text-center text-green-400 font-semibold">{eq.available} Units</td>
                        <td className="px-6 py-4 text-center text-blue-400">{eq.borrowed}</td>
                        <td className="px-6 py-4 text-center text-orange-400">{eq.inRepair}</td>
                        <td className="px-6 py-4 text-center text-red-400">{eq.damaged}</td>
                        <td className="px-6 py-4 text-center">
                          {eq.available > 0 ? (
                            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Available</span>
                          ) : (
                            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">Unavailable</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500">{eq.lastChecked || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">Borrow Requests & Log Records</h2>
              <p className="text-slate-500 text-sm mb-8">Accept or decline pending equipment borrow requests and view log records</p>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-blue-700 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Borrower Full Name</th>
                      <th className="px-6 py-3">Account Type</th>
                      <th className="px-6 py-3">Equipment To Borrow</th>
                      <th className="px-6 py-3">Requested Date & Time</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-center">Action Buttons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {requests.map(req => {
                      const user = users.find(u => u.id === req.userId);
                      const items = req.items && req.items.length > 0 ? req.items : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                      return (
                        <tr key={req.id} className="hover:bg-slate-100">
                          <td className="px-6 py-4 font-medium flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">{user?.name?.[0]}</span>
                            <span>{user?.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">{user?.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            {items.map((item, idx) => {
                              const eq = equipment.find(e => e.id === item.equipmentId);
                              return <div key={idx} className="mb-1 text-slate-700">{item.quantity}× {eq?.name || 'Item'}</div>
                            })}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            Pickup: {new Date(req.pickupDate).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            {req.status === 'pending' && (
                              <div className="flex flex-col space-y-2">
                                <button onClick={() => updateRequestStatus(req.id, 'approved')} className="text-xs border border-green-500/50 text-green-400 hover:bg-green-500/10 px-2 py-1 rounded transition">Accept</button>
                                <button onClick={() => updateRequestStatus(req.id, 'declined')} className="text-xs border border-red-500/50 text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition">Decline</button>
                              </div>
                            )}
                            {(req.status === 'approved' || req.status === 'overdue' || req.status === 'return_pending') && (
                              <button onClick={() => updateRequestStatus(req.id, 'returned')} className="text-xs bg-green-500/20 text-green-400 border border-green-500 hover:bg-green-500/30 px-3 py-1.5 rounded flex items-center space-x-1 mx-auto transition">
                                <Check className="w-3 h-3" />
                                <span>Confirm Return</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">Manage System Accounts</h2>
              <p className="text-slate-500 text-sm mb-6">Review active approved website users or open pending registrations log logs.</p>

              {pendingUsers.length > 0 && (
                <div className="bg-white border border-orange-500/30 rounded-xl overflow-hidden mb-8">
                  <div className="bg-orange-500/10 px-6 py-3 font-semibold text-orange-400 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>Users Pending Registration Review</span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-blue-700 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3">Full Name</th>
                        <th className="px-6 py-3">ID Number</th>
                        <th className="px-6 py-3">Account Type</th>
                        <th className="px-6 py-3">Course / Department</th>
                        <th className="px-6 py-3 text-center">Actions Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pendingUsers.map(u => (
                        <tr key={u.id}>
                          <td className="px-6 py-4 font-medium flex items-center space-x-2">
                             <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                             <span>{u.name}</span>
                          </td>
                          <td className="px-6 py-4">{u.id}</td>
                          <td className="px-6 py-4 capitalize">{u.role}</td>
                          <td className="px-6 py-4">{u.department}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-xs border border-green-500/50 text-green-400 hover:bg-green-500/10 px-3 py-1 rounded transition">Accept Account</button>
                              <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-xs border border-red-500/50 text-red-400 hover:bg-red-500/10 px-3 py-1 rounded transition">Decline</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 font-bold text-blue-700 border-b border-slate-200">
                  Already Approved Users
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-blue-700 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">ID Number</th>
                      <th className="px-6 py-3">Account Type</th>
                      <th className="px-6 py-3">Course / Department</th>
                      <th className="px-6 py-3">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {approvedUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-100">
                        <td className="px-6 py-4 font-medium flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>{u.name}</span>
                        </td>
                        <td className="px-6 py-4">{u.id}</td>
                        <td className="px-6 py-4 capitalize">{u.role}</td>
                        <td className="px-6 py-4">{u.department}</td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-medium">Approved Member</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'arrivals' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">New Equipment Arrivals</h2>
              <p className="text-slate-500 text-sm mb-6">Encode newly arrived sports equipment to automatically update the inventory records.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center space-x-2"><PackagePlus className="w-5 h-5"/> <span>Encode New Arrival</span></h3>
                  
                  {addSuccess && (
                    <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4 text-sm flex items-center space-x-2">
                      <Check className="w-4 h-4" /> <span>Equipment added and inventory updated!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddEquipment} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Equipment Name</label>
                      <input required type="text" value={eqName} onChange={e => setEqName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Sport Category</label>
                      <select value={eqCat} onChange={e => setEqCat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700">
                        <option value="Basketball">Basketball</option>
                        <option value="Volleyball">Volleyball</option>
                        <option value="Football">Football</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Table Tennis">Table Tennis</option>
                        <option value="Chess">Chess</option>
                        <option value="Boxing">Boxing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Quantity Received</label>
                        <input required type="number" min="1" value={eqQty} onChange={e => setEqQty(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Condition on Arrival</label>
                        <select value={eqCondition} onChange={e => setEqCondition(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700">
                          <option value="Good / Available">Good / Available</option>
                          <option value="For Repair">For Repair</option>
                          <option value="Damaged">Damaged</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Delivery Source / Supplier</label>
                      <input type="text" value={eqSupplier} onChange={e => setEqSupplier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Remarks / Notes (Optional)</label>
                      <textarea value={eqNotes} onChange={e => setEqNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-700 h-24" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-4 flex justify-center items-center space-x-2 transition">
                      <PackagePlus className="w-5 h-5" />
                      <span>Save to Inventory</span>
                    </button>
                  </form>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-600 mb-4 flex items-center space-x-2"><FileBarChart className="w-5 h-5"/> <span>Arrival Log Records</span></h3>
                  <div className="space-y-4">
                     <div className="bg-white border border-slate-200 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-blue-700">3x Basketball</span>
                          <span className="text-green-400 text-xs bg-green-400/10 px-2 py-0.5 rounded flex items-center space-x-1"><Check className="w-3 h-3"/> <span>Good</span></span>
                        </div>
                        <div className="text-xs text-slate-500 grid grid-cols-2 gap-2">
                          <div>Sport: Basketball</div>
                          <div>Source: DepEd Allocation</div>
                          <div>By: Prof. Maria Santos</div>
                          <div>Date: June 1, 2026</div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'active_borrowers' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">Active Borrowers</h2>
              <p className="text-slate-500 text-sm mb-6">Explicitly filtered view displaying all current users holding equipment and their items.</p>
              
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-blue-700 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Borrower</th>
                      <th className="px-6 py-4 font-semibold">Contact / Dept</th>
                      <th className="px-6 py-4 font-semibold">Currently Held Items</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.filter(u => requests.some(r => r.userId === u.id && (r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending'))).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No active borrowers holding equipment.</td>
                      </tr>
                    ) : (
                      users.filter(u => requests.some(r => r.userId === u.id && (r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending'))).map(user => {
                        const activeUserRequests = requests.filter(r => r.userId === user.id && (r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending'));
                        
                        return (
                          <tr key={user.id} className="hover:bg-slate-100">
                            <td className="px-6 py-4 font-medium flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">{user.name[0]}</div>
                              <div>
                                <div>{user.name}</div>
                                <div className="text-xs text-slate-500">{user.role}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              <div>{user.department || 'N/A'}</div>
                              <div className="text-xs">{user.contact || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-3">
                                {activeUserRequests.map(req => {
                                  const items = req.items && req.items.length > 0 ? req.items : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                                  return (
                                    <div key={req.id} className="border-l-2 border-blue-400 pl-3">
                                      {items.map((item, idx) => {
                                        const eq = equipment.find(e => e.id === item.equipmentId);
                                        return <div key={idx} className="font-medium text-slate-800">{item.quantity}× {eq?.name || 'Item'}</div>
                                      })}
                                      <div className="text-xs text-slate-500">Return by: {new Date(req.returnDate).toLocaleString()}</div>
                                      <div className="mt-1"><StatusBadge status={req.status} /></div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {activeUserRequests.some(r => r.status === 'overdue') ? (
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">Has Overdue</span>
                              ) : (
                                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">In Good Standing</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-blue-700 mb-2">REPORTS CENTER</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-md">Access and generate key reports to monitor equipment availability, inventory health, and repair activity.</p>
              
              <div className="bg-white border border-slate-200 rounded-xl p-8 relative">
                 <div className="absolute top-8 right-8 flex space-x-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-blue-700 transition">Print Report</button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-blue-700 transition">Export as PDF</button>
                 </div>
                 
                 <div className="mb-8">
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Public Equipment Status Availability Report</h3>
                   <div className="text-sm text-slate-500">Location: Mambusao Campus</div>
                   <div className="text-sm text-slate-500">Report Generated: {new Date().toLocaleString()}</div>
                 </div>

                 <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Equipment</th>
                      <th className="px-4 py-3 font-semibold">Sports Category</th>
                      <th className="px-4 py-3 font-semibold text-center">Available</th>
                      <th className="px-4 py-3 font-semibold text-center">Borrowed</th>
                      <th className="px-4 py-3 font-semibold text-center">In Repair</th>
                      <th className="px-4 py-3 font-semibold text-center">Damaged</th>
                      <th className="px-4 py-3 font-semibold text-center">Status Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {equipment.map((eq) => (
                      <tr key={eq.id}>
                        <td className="px-4 py-3 font-medium">{eq.name}</td>
                        <td className="px-4 py-3 text-slate-600">{eq.category}</td>
                        <td className="px-4 py-3 text-center">{eq.available}</td>
                        <td className="px-4 py-3 text-center">{eq.borrowed}</td>
                        <td className="px-4 py-3 text-center">{eq.inRepair}</td>
                        <td className="px-4 py-3 text-center">{eq.damaged}</td>
                        <td className="px-4 py-3 text-center">
                          {eq.available > 0 ? (
                            <span className="text-xs text-green-400">Available</span>
                          ) : eq.inRepair > 0 ? (
                             <span className="text-xs text-orange-400">For Repair</span>
                          ) : (
                             <span className="text-xs text-red-400">Damaged</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-8 text-xs text-slate-400">Printed for: CSU MSAC Administration</div>
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

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <span className="text-orange-400 bg-orange-400/10 px-2 py-1 rounded text-xs font-medium">Pending</span>;
  if (status === 'approved') return <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-medium">Approved</span>;
  if (status === 'overdue') return <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-medium">Overdue Returns</span>;
  if (status === 'declined') return <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-medium">Declined</span>;
  if (status === 'returned') return <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs font-medium">Returned</span>;
  if (status === 'return_pending') return <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs font-medium">Return Requested</span>;
  return null;
}

function StatCard({ title, count, subtext, icon, color, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border-t-2 ${color} p-4 rounded-lg flex flex-col ${onClick ? 'cursor-pointer hover:bg-slate-100 transition' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{count}</div>
      <div className="text-xs text-slate-400 mb-3">{subtext}</div>
      {onClick && (
        <div className="mt-auto flex items-center space-x-1 text-[10px] text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span>Click to view items</span>
        </div>
      )}
    </div>
  );
}

function ActiveLogsOverlay({ type, onClose, equipment, requests, users }: any) {
  let title = '';
  let data: any[] = [];
  let columns = ['EQUIPMENT', 'SPORTS CATEGORY', 'COUNT', 'ACTIVE STATE'];

  if (type === 'total') {
    title = 'Active Logs: Total Equipment';
    data = equipment.map((e: any) => ({ col1: e.name, col2: e.category, col3: `${e.total} Units`, col4: 'Registered Tracking', isAvailable: true }));
  } else if (type === 'available') {
    title = 'Active Logs: Available';
    data = equipment.map((e: any) => ({ col1: e.name, col2: e.category, col3: `${e.available} Units`, col4: 'Available', isAvailable: e.available > 0 }));
  } else if (type === 'borrowed') {
    title = 'Active Logs: Borrowed';
    columns = ['BORROWER NAME', 'EQUIPMENT LOGGED OUT', 'REQUESTED TERM FRAME', 'STATUS STATE'];
    data = requests.filter((r: any) => r.status === 'approved' || r.status === 'overdue').map((r: any) => {
      const u = users.find((u: any) => u.id === r.userId);
      const e = equipment.find((e: any) => e.id === r.equipmentId);
      return {
        col1: `${u?.name} (${u?.role})`,
        col2: `${r.quantity}× ${e?.name}`,
        col3: `Pickup: ${new Date(r.pickupDate).toLocaleString()} | Return: ${new Date(r.returnDate).toLocaleString()}`,
        col4: r.status === 'approved' ? 'Approved' : 'Overdue Returns',
        isAvailable: r.status === 'approved'
      };
    });
  } else if (type === 'repair') {
    title = 'Active Logs: For Repair';
    data = equipment.filter((e: any) => e.inRepair > 0).map((e: any) => ({ col1: e.name, col2: e.category, col3: `${e.inRepair} Units`, col4: 'In Maintenance', isAvailable: false }));
  } else if (type === 'damaged') {
    title = 'Active Logs: Damaged';
    data = equipment.filter((e: any) => e.damaged > 0).map((e: any) => ({ col1: e.name, col2: e.category, col3: `${e.damaged} Units`, col4: 'Broken / Damaged', isAvailable: false }));
  } else if (type === 'sports') {
    title = 'Active Logs: Sports';
    columns = ['SPORT', 'TOTAL ITEMS', 'STORAGE LOCATION'];
    const sportsData = equipment.reduce((acc: any, eq: any) => {
      if (!acc[eq.category]) acc[eq.category] = { count: 0, loc: eq.location || 'Various' };
      acc[eq.category].count += eq.total;
      return acc;
    }, {});
    data = Object.keys(sportsData).map(k => ({ col1: k, col2: `${sportsData[k].count} Units`, col3: sportsData[k].loc }));
  }

  return (
    <div className="flex flex-col max-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-blue-700 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>{title}</span>
          </h3>
          <p className="text-slate-500 text-xs mt-1">Displaying current itemized data matches found inside database matching criteria filter parameters.</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="overflow-y-auto flex-1 border border-slate-200 rounded">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-blue-700 text-xs uppercase tracking-wider sticky top-0">
            <tr>
              {columns.map(c => <th key={c} className="px-6 py-3 font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-100">
                <td className="px-6 py-3 font-medium">{row.col1}</td>
                <td className="px-6 py-3 text-slate-600">{row.col2}</td>
                <td className="px-6 py-3">{row.col3}</td>
                {columns.length > 3 && (
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${row.isAvailable ? 'text-blue-400' : 'text-red-400'}`}>{row.col4}</span>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded text-sm transition">
          Dismiss Log Overlay
        </button>
      </div>
    </div>
  );
}
