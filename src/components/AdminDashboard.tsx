import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, LayoutDashboard, Users, Bell, UserCog, PackagePlus, FileBarChart, Check, X, RefreshCw, Box, Wrench, XCircle, Trophy, Layers, Search, UserCheck, Trash2, Menu } from 'lucide-react';
import { BorrowRequest, Equipment } from '../types';
import { getCategoryMeta } from '../data/categoryData';
import { CategoryIcon } from './CategoryIcon';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export default function AdminDashboard() {
  const { 
    currentUser, 
    logout, 
    users, 
    equipment, 
    requests, 
    updateRequestStatus, 
    updateUserStatus, 
    addEquipment, 
    updateUserDetails, 
    deleteEquipment, 
    updateEquipment,
    deleteUser,
    clearAllUsers,
    deleteRequest,
    clearAllRequests,
    clearActiveBorrowers,
    arrivalRecords = [],
    addArrivalRecord,
    deleteArrivalRecord,
    clearArrivalRecords,
    clearData 
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'users' | 'arrivals' | 'reports' | 'active_borrowers'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');

  // Inventory Filter State
  const [adminCatFilter, setAdminCatFilter] = useState<string>('All');
  const [adminSearch, setAdminSearch] = useState<string>('');

  // New Equipment State
  const [eqName, setEqName] = useState('');
  const [eqDescription, setEqDescription] = useState('');
  const [eqCat, setEqCat] = useState('Basketball');
  const [customCat, setCustomCat] = useState('');
  const [eqQty, setEqQty] = useState(0);
  const [eqCondition, setEqCondition] = useState('Good / Available');
  const [eqSupplier, setEqSupplier] = useState('');
  const [eqNotes, setEqNotes] = useState('');
  const [eqLocation, setEqLocation] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExportPDF = async () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    try {
      const imgData = await toPng(reportElement, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (reportElement.offsetHeight * pdfWidth) / reportElement.offsetWidth;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CapSu-Equipment-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeRequests = requests.filter(r => r.status === 'approved' || r.status === 'overdue');
  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved' && u.role !== 'admin');

  // Categories list
  const allCategories = useMemo(() => {
    return Array.from(new Set(equipment.map(e => e.category))).filter((cat): cat is string => Boolean(cat));
  }, [equipment]);

  const filteredAdminEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchCat = adminCatFilter === 'All' || eq.category.toLowerCase() === adminCatFilter.toLowerCase();
      const matchQuery = adminSearch.trim() === '' || 
        eq.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
        eq.category.toLowerCase().includes(adminSearch.toLowerCase()) ||
        (eq.location && eq.location.toLowerCase().includes(adminSearch.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [equipment, adminCatFilter, adminSearch]);

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = eqCat === 'Custom' ? (customCat.trim() || 'General') : eqCat;
    const newEqId = `eq-${Date.now()}`;
    const newEq: Equipment = {
      id: newEqId,
      name: eqName.trim(),
      description: eqDescription.trim(),
      category: finalCategory,
      total: eqQty,
      available: eqCondition === 'Good / Available' ? eqQty : 0,
      borrowed: 0,
      inRepair: eqCondition === 'For Repair' ? eqQty : 0,
      damaged: eqCondition === 'Damaged' ? eqQty : 0,
      location: eqLocation.trim() || 'Main Sports Storage',
      lastChecked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    addEquipment(newEq);

    addArrivalRecord({
      id: `arr-${Date.now()}`,
      equipmentName: eqName.trim(),
      category: finalCategory,
      quantity: eqQty,
      condition: eqCondition,
      supplier: eqSupplier.trim() || undefined,
      location: eqLocation.trim() || 'Main Sports Storage',
      description: eqDescription.trim() || undefined,
      notes: eqNotes.trim() || undefined,
      date: new Date().toISOString(),
      receivedBy: currentUser.name
    });

    setAddSuccess(true);
    setEqName('');
    setEqDescription('');
    setCustomCat('');
    setEqQty(0);
    setEqSupplier('');
    setEqNotes('');
    setEqLocation('');
    setTimeout(() => setAddSuccess(false), 3000);
  };

  const totalUnits = filteredAdminEquipment.reduce((acc, eq) => acc + eq.total, 0);
  const availableUnits = filteredAdminEquipment.reduce((acc, eq) => acc + eq.available, 0);
  const borrowedUnits = filteredAdminEquipment.reduce((acc, eq) => acc + eq.borrowed, 0);
  const forRepairUnits = filteredAdminEquipment.reduce((acc, eq) => acc + eq.inRepair, 0);
  const damagedUnits = filteredAdminEquipment.reduce((acc, eq) => acc + eq.damaged, 0);
  const sportsTracksCount = new Set(equipment.map(e => e.category)).size;

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US');

  if (!currentUser) return null;

  return (
    <div 
      className="min-h-screen bg-[#0a1c38] text-slate-300 flex font-sans relative"
    >
      {/* Background Soft Overlay */}
      <div className="absolute inset-0 bg-[#0a1c38] z-0 print:hidden"></div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity print:hidden"
        />
      )}

      {/* Sidebar: CapSU Deep Royal Blue */}
      <div className={`
        fixed lg:sticky lg:top-0 h-screen inset-y-0 left-0 z-50 w-64 bg-[#07152b] border-r border-blue-700/40 
        flex flex-col shrink-0 overflow-hidden print:hidden shadow-2xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-blue-700/40 flex items-center justify-between shrink-0">
          <div>
            <div className="w-12 h-12 bg-yellow-400 text-blue-950 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md border-2 border-yellow-300">
              {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
            </div>
            <h3 className="font-bold text-white">{currentUser.name}</h3>
            <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mt-0.5">ADMINISTRATOR</p>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <div onClick={() => setMobileMenuOpen(false)}><NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} /></div>
          <div onClick={() => setMobileMenuOpen(false)}><NavItem icon={<Users />} label="Active Borrowers" active={activeTab === 'active_borrowers'} onClick={() => setActiveTab('active_borrowers')} /></div>
          <div onClick={() => setMobileMenuOpen(false)}><NavItem icon={<Bell />} label="Borrow Requests" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} badge={pendingRequests.length} /></div>
          <div onClick={() => setMobileMenuOpen(false)}><NavItem icon={<UserCog />} label="Manage Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} badge={pendingUsers.length} /></div>
          <div onClick={() => setMobileMenuOpen(false)}><NavItem icon={<PackagePlus />} label="New Arrivals" active={activeTab === 'arrivals'} onClick={() => setActiveTab('arrivals')} /></div>
          <div onClick={() => setMobileMenuOpen(false)}><NavItem icon={<FileBarChart />} label="Reports Center" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} /></div>
        </nav>

        <div className="p-4 border-t border-blue-700/40 space-y-2.5 shrink-0 bg-[#07152b]">
          <button 
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete and clear ALL records (Active Borrowers, Borrow Requests, Registered Users, and New Arrivals)? This will reset borrowed equipment and cannot be undone.')) {
                const res = await clearData();
                if (res) {
                  alert('All records for active borrowers, borrow requests, users, and arrivals have been successfully cleared.');
                }
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-950/40 text-orange-300 hover:bg-orange-900/60 font-bold border border-orange-700/50 rounded-lg transition text-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All System Records</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-950/40 text-red-300 hover:bg-red-900/60 font-bold border border-red-700/50 rounded-lg transition text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden print:h-auto print:overflow-visible relative z-10 w-full">
        <header className="flex justify-between items-center px-4 sm:px-8 py-3.5 border-b-4 border-yellow-400 bg-[#07152b] text-white shadow-md relative z-20 print:hidden">
          <div className="flex items-center space-x-3 text-white font-bold text-base sm:text-lg tracking-wide">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-blue-800/40 transition cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="bg-yellow-400 p-1.5 rounded-lg text-blue-950 hidden sm:block shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="truncate font-display uppercase tracking-wider text-lg">CSU CapSu Sports - Admin Control</span>
          </div>
          <div className="text-sm flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span>
            <span className="text-slate-300 font-medium text-xs sm:text-sm">Admin: </span>
            {isEditingProfile ? (
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={editProfileName} 
                  onChange={e => setEditProfileName(e.target.value)}
                  className="px-2 py-0.5 bg-[#07172f] border border-blue-500/40 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    if (editProfileName.trim() !== '') {
                      updateUserDetails(currentUser.id, { name: editProfileName.trim() });
                    }
                    setIsEditingProfile(false);
                  }}
                  className="text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-3 py-1 rounded shadow-sm cursor-pointer"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs bg-blue-900 hover:bg-blue-800 text-white border border-blue-700 px-3 py-1 rounded shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">{currentUser.name}</span>
                <button 
                  onClick={() => {
                    setEditProfileName(currentUser.name);
                    setIsEditingProfile(true);
                  }}
                  className="text-xs text-yellow-300 hover:text-yellow-200 underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:bg-white print:overflow-visible">

          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto relative">
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-6 border-b border-blue-700/40 pb-4">
                <span>📍 <strong className="text-slate-200">Location:</strong> Mambusao Campus</span>
                <span>🕒 <strong className="text-slate-200">Clock:</strong> {dateStr} - {timeStr}</span>
                <span className="inline-flex items-center text-xs font-bold text-yellow-300 bg-yellow-400/15 px-2.5 py-0.5 rounded-full border border-yellow-400/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 animate-pulse"></span>
                  Cloud Real-Time Sync Active
                </span>
              </div>

              {/* Stat Cards: CapSU Royal Blue Cards with Yellow Accent */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 relative z-10">
                <StatCard onClick={() => setActiveOverlay('total')} title="TOTAL UNITS" count={totalUnits} subtext="Across all sports" icon={<Box className="w-6 h-6 text-slate-300" />} color="border-t-yellow-400" />
                <StatCard onClick={() => setActiveOverlay('available')} title="AVAILABLE ITEMS" count={availableUnits} subtext="Ready to borrow" icon={<Check className="w-6 h-6 text-yellow-400" />} color="border-t-yellow-400" />
                <StatCard onClick={() => setActiveOverlay('borrowed')} title="BORROWED" count={borrowedUnits} subtext="Currently out" icon={<RefreshCw className="w-6 h-6 text-blue-300" />} color="border-t-blue-400" />
                <StatCard onClick={() => setActiveOverlay('repair')} title="FOR REPAIR" count={forRepairUnits} subtext="Under maintenance" icon={<Wrench className="w-6 h-6 text-amber-400" />} color="border-t-amber-400" />
                <StatCard onClick={() => setActiveOverlay('damaged')} title="DAMAGED UNITS" count={damagedUnits} subtext="Unserviceable" icon={<XCircle className="w-6 h-6 text-red-400" />} color="border-t-red-400" />
                <StatCard onClick={() => setActiveOverlay('sports')} title="SPORTS TRACKS" count={sportsTracksCount} subtext="Active sports" icon={<Trophy className="w-6 h-6 text-yellow-400" />} color="border-t-yellow-400" />
              </div>

              {activeOverlay && (
                <div className="absolute left-0 right-0 top-[180px] bg-[#0e264c] border-2 border-yellow-400 rounded-xl shadow-2xl z-50 p-6">
                  <ActiveLogsOverlay type={activeOverlay} onClose={() => setActiveOverlay(null)} equipment={equipment} requests={requests} users={users} />
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-8">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display uppercase tracking-wide">Equipment Catalog &amp; Inventory</h2>
                  <p className="text-sm text-slate-300 mt-1">Manage and track all sports equipment in real-time</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#07172f] border border-blue-500/40 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* Dynamic Category Filter Pills */}
              <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 scrollbar-thin">
                <button
                  onClick={() => setAdminCatFilter('All')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
                    adminCatFilter === 'All'
                      ? 'bg-yellow-400 text-blue-950 font-extrabold shadow-md'
                      : 'bg-[#0e264c] text-slate-300 border border-blue-600/40 hover:bg-[#133569] hover:text-white'
                  }`}
                >
                  <CategoryIcon category="all" className="w-4 h-4" />
                  <span>All ({equipment.length})</span>
                </button>
                {allCategories.map(cat => {
                  const isSel = adminCatFilter.toLowerCase() === cat.toLowerCase();
                  const count = equipment.filter(e => e.category.toLowerCase() === cat.toLowerCase()).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setAdminCatFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
                        isSel
                          ? 'bg-yellow-400 text-blue-950 font-extrabold shadow-md border-transparent'
                          : 'bg-[#0e264c] text-slate-300 border border-blue-600/40 hover:bg-[#133569] hover:text-white'
                      }`}
                    >
                      <CategoryIcon category={cat} className={`w-4 h-4 ${isSel ? 'text-blue-950' : 'text-yellow-400'}`} />
                      <span>{cat} ({count})</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="bg-[#0e264c] rounded-xl overflow-hidden overflow-x-auto border border-blue-600/40 shadow-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#07152b] text-slate-300 text-xs uppercase tracking-wider border-b border-blue-600/40">
                    <tr>
                      <th className="px-6 py-4 font-bold">Equipment Name</th>
                      <th className="px-6 py-4 font-bold">Sport Category</th>
                      <th className="px-6 py-4 font-bold text-center">Total Units</th>
                      <th className="px-6 py-4 font-bold text-center">Available</th>
                      <th className="px-6 py-4 font-bold text-center">Borrowed</th>
                      <th className="px-6 py-4 font-bold text-center">In Repair</th>
                      <th className="px-6 py-4 font-bold text-center">Damaged</th>
                      <th className="px-6 py-4 font-bold text-center">Status Badge</th>
                      <th className="px-6 py-4 font-bold text-center">Last Checked</th>
                      <th className="px-6 py-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-700/30">
                    {filteredAdminEquipment.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-slate-300 text-xs font-medium">
                          No equipment matching your category or search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAdminEquipment.map((eq) => {
                        return (
                          <tr key={eq.id} className="hover:bg-blue-800/30 transition">
                            <td className="px-6 py-4 font-medium">
                              <span className="text-white font-bold text-base">{eq.name}</span>
                              {eq.description && (
                                <div className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed line-clamp-2" title={eq.description}>
                                  {eq.description}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-400 font-normal mt-1">{eq.location || 'Storage'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-yellow-300 border border-blue-600/50">
                                <CategoryIcon category={eq.category} className="w-3 h-3 text-yellow-400" />
                                <span>{eq.category}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-white text-base">{eq.total}</td>
                            <td className="px-6 py-4 text-center text-yellow-400 font-extrabold text-base">{eq.available} Units</td>
                            <td className="px-6 py-4 text-center text-blue-200 font-semibold">{eq.borrowed}</td>
                            <td className="px-6 py-4 text-center text-amber-400 font-semibold">{eq.inRepair}</td>
                            <td className="px-6 py-4 text-center text-red-400 font-semibold">{eq.damaged}</td>
                            <td className="px-6 py-4 text-center">
                              {eq.available > 0 ? (
                                <span className="text-xs font-bold text-yellow-300 bg-yellow-400/20 border border-yellow-400/50 px-2.5 py-1 rounded-full shadow-xs">Available</span>
                              ) : eq.damaged > 0 ? (
                                <span className="text-xs font-bold text-red-300 bg-red-950/70 border border-red-700/60 px-2.5 py-1 rounded-full shadow-xs">Damaged</span>
                              ) : eq.inRepair > 0 ? (
                                <span className="text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-700/60 px-2.5 py-1 rounded-full shadow-xs">In Repair</span>
                              ) : eq.borrowed > 0 ? (
                                <span className="text-xs font-bold text-blue-300 bg-blue-950/80 border border-blue-700/60 px-2.5 py-1 rounded-full shadow-xs">Borrowed</span>
                              ) : (
                                <span className="text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-full shadow-xs">Out of Stock</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-300 text-xs">{eq.lastChecked || 'N/A'}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {eq.damaged > 0 && (
                                  <button 
                                    onClick={() => updateEquipment(eq.id, { damaged: 0, available: eq.available + eq.damaged })}
                                    className="text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-3 py-1.5 rounded-lg shadow-md transition cursor-pointer"
                                    title="Mark as Repaired"
                                  >
                                    Repair
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${eq.name}?`)) {
                                      deleteEquipment(eq.id);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 transition p-1.5 rounded-lg hover:bg-red-950/40 cursor-pointer"
                                  title="Delete equipment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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

          {activeTab === 'requests' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display uppercase tracking-wide">Borrow Requests &amp; Log Records</h2>
                  <p className="text-slate-300 text-sm mt-1">Accept or decline pending equipment borrow requests and manage borrow logs</p>
                </div>
                {requests.length > 0 && (
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete and clear ALL borrow request records? This will also release borrowed equipment back to available inventory.')) {
                        await clearAllRequests();
                        alert('All borrow request records have been deleted.');
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-700/50 rounded-lg text-sm font-semibold transition self-start md:self-auto cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Requests ({requests.length})</span>
                  </button>
                )}
              </div>

              <div className="bg-[#0e264c] border border-blue-600/40 rounded-xl overflow-hidden overflow-x-auto mb-8 shadow-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#07152b] text-slate-300 text-xs uppercase font-bold tracking-wider border-b border-blue-600/40">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Borrower</th>
                      <th className="px-6 py-4 font-semibold">Contact / Dept</th>
                      <th className="px-6 py-4 font-semibold">Equipment To Borrow</th>
                      <th className="px-6 py-4 font-semibold">Requested Date &amp; Time</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-700/30">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-300">
                          <p className="font-bold text-white">No borrow requests or records found.</p>
                          <p className="text-xs text-slate-400 mt-1">New requests from students and faculty will appear here.</p>
                        </td>
                      </tr>
                    ) : (
                      requests.map(req => {
                        const user = users.find(u => u.id === req.userId);
                        const items = req.items && req.items.length > 0 ? req.items : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                        return (
                          <tr key={req.id} className="hover:bg-blue-800/30 transition">
                            <td className="px-6 py-4 font-medium flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-400 text-blue-950 flex items-center justify-center text-sm font-bold shadow-md">
                                {user?.name?.[0] || 'U'}
                              </div>
                              <div>
                                <div className="text-white font-bold">{user?.name || req.userId}</div>
                                <div className="text-xs text-slate-400">{user?.role || 'Borrower'} - ID: {user?.id || req.userId}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              <div>{user?.department || 'N/A'}</div>
                              <div className="text-xs text-slate-400">{user?.contact || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="border-l-2 border-yellow-400 pl-3">
                                  {items.map((item, idx) => {
                                    const eq = equipment.find(e => e.id === item.equipmentId);
                                    return <div key={idx} className="font-semibold text-white">{item.quantity}× {eq?.name || 'Item'}</div>
                                  })}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300 text-xs">
                              <div><strong className="text-slate-200">Pickup:</strong> {new Date(req.pickupDate).toLocaleString()}</div>
                              <div><strong className="text-slate-200">Return:</strong> {new Date(req.returnDate).toLocaleString()}</div>
                              <div className="mt-1 text-slate-400">Req: {new Date(req.requestDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={req.status} />
                              {req.returnCondition && req.status === 'return_pending' && (
                                <div className={`mt-2 text-xs font-bold px-2 py-1 rounded-md ${req.returnCondition === 'Damaged' ? 'bg-red-950/70 text-red-300 border border-red-700/60' : 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60'}`}>
                                  Condition: {req.returnCondition}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {req.status === 'pending' && (
                                  <>
                                    <button onClick={() => updateRequestStatus(req.id, 'approved')} className="text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-3 py-1.5 rounded-lg shadow-md transition cursor-pointer">Accept</button>
                                    <button onClick={() => updateRequestStatus(req.id, 'declined')} className="text-xs bg-red-950/40 text-red-300 border border-red-700/50 hover:bg-red-900/60 font-bold px-3 py-1.5 rounded-lg shadow-md transition cursor-pointer">Decline</button>
                                  </>
                                )}
                                {(req.status === 'approved' || req.status === 'overdue' || req.status === 'return_pending') && (
                                  <button onClick={() => updateRequestStatus(req.id, 'returned')} className="text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center space-x-1 transition cursor-pointer">
                                    <Check className="w-3 h-3" />
                                    <span>Return</span>
                                  </button>
                                )}
                                <button 
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this borrow request record?')) {
                                      await deleteRequest(req.id);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                                  title="Delete request record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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

          {activeTab === 'users' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display uppercase tracking-wide">Manage System Accounts</h2>
                  <p className="text-slate-300 text-sm mt-1">Review active approved website users or open pending registrations.</p>
                </div>
                {(pendingUsers.length > 0 || approvedUsers.length > 0) && (
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete and clear ALL registered borrower accounts (students & faculty)? The admin account will remain safe.')) {
                        await clearAllUsers();
                        alert('All registered borrower user accounts have been deleted.');
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-700/50 rounded-lg text-sm font-semibold transition self-start md:self-auto cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Users ({pendingUsers.length + approvedUsers.length})</span>
                  </button>
                )}
              </div>

              {pendingUsers.length > 0 && (
                <div className="bg-[#0e264c] border-2 border-yellow-400 rounded-xl overflow-hidden overflow-x-auto mb-8 shadow-lg">
                  <div className="bg-yellow-400/20 px-6 py-3 font-semibold text-yellow-300 flex items-center space-x-2 border-b border-yellow-400/30">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    <span className="font-bold">Users Pending Registration Review ({pendingUsers.length})</span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#07152b] text-slate-300 text-xs uppercase font-bold tracking-wider border-b border-blue-600/40">
                      <tr>
                        <th className="px-6 py-3">Full Name</th>
                        <th className="px-6 py-3">ID Number</th>
                        <th className="px-6 py-3">Account Type</th>
                        <th className="px-6 py-3">Course / Department</th>
                        <th className="px-6 py-3 text-center">Actions Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-700/30">
                      {pendingUsers.map(u => (
                        <tr key={u.id} className="hover:bg-blue-800/30 transition">
                          <td className="px-6 py-4 font-medium flex items-center space-x-2">
                             <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"></span>
                             <span className="text-white font-bold">{u.name}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{u.id}</td>
                          <td className="px-6 py-4 capitalize text-slate-300">{u.role}</td>
                          <td className="px-6 py-4 text-slate-300">{u.department}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-3 py-1.5 rounded-lg shadow-md transition cursor-pointer">Accept</button>
                              <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-xs bg-red-950/40 text-red-300 border border-red-700/50 hover:bg-red-900/60 font-bold px-3 py-1.5 rounded-lg shadow-md transition cursor-pointer">Decline</button>
                              <button 
                                onClick={async () => {
                                  if (window.confirm(`Delete user record for ${u.name}?`)) {
                                    await deleteUser(u.id);
                                  }
                                }} 
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-[#0e264c] border border-blue-600/40 rounded-xl overflow-hidden overflow-x-auto shadow-lg">
                <div className="px-6 py-4 font-bold text-white border-b border-blue-600/40 flex items-center justify-between font-display uppercase tracking-wide bg-[#07152b]">
                  <span>Already Approved Users ({approvedUsers.length})</span>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#07152b] text-slate-300 text-xs uppercase font-bold tracking-wider border-b border-blue-600/40">
                    <tr>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">ID Number</th>
                      <th className="px-6 py-3">Account Type</th>
                      <th className="px-6 py-3">Course / Department</th>
                      <th className="px-6 py-3">Account Status</th>
                      <th className="px-6 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-700/30">
                    {approvedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-300">
                          <p className="font-bold text-white">No approved borrower user accounts found.</p>
                          <p className="text-xs text-slate-400 mt-1">Users will appear here once registered and approved.</p>
                        </td>
                      </tr>
                    ) : (
                      approvedUsers.map(u => (
                        <tr key={u.id} className="hover:bg-blue-800/30 transition">
                          <td className="px-6 py-4 font-medium flex items-center space-x-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm"></span>
                              <span className="text-white font-bold">{u.name}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{u.id}</td>
                          <td className="px-6 py-4 capitalize text-slate-300">{u.role}</td>
                          <td className="px-6 py-4 text-slate-300">{u.department}</td>
                          <td className="px-6 py-4">
                            <span className="text-yellow-300 bg-yellow-400/20 border border-yellow-400/40 px-3 py-1 rounded-full text-xs font-semibold">Approved Member</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete user account for ${u.name} (ID: ${u.id})?`)) {
                                  await deleteUser(u.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/40 transition inline-flex items-center cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'arrivals' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-white mb-2 font-display uppercase tracking-wide">New Equipment Arrivals</h2>
              <p className="text-slate-300 text-sm mb-6">Encode newly arrived sports equipment to automatically update the inventory records.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#0e264c] border border-blue-600/40 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 font-display uppercase tracking-wide">
                    <PackagePlus className="w-5 h-5 text-yellow-400"/> 
                    <span>Encode New Arrival</span>
                  </h3>
                  
                  {addSuccess && (
                    <div className="bg-emerald-950/80 text-emerald-200 border border-emerald-600 p-3 rounded mb-4 text-sm flex items-center space-x-2">
                      <Check className="w-4 h-4" /> <span>Equipment added and inventory updated!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddEquipment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Equipment Name</label>
                      <input required type="text" value={eqName} onChange={e => setEqName(e.target.value)} className="w-full bg-[#07172f] border border-blue-500/40 rounded px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-yellow-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Product Description</label>
                      <textarea placeholder="e.g. Spherical, standard orange composite leather..." value={eqDescription} onChange={e => setEqDescription(e.target.value)} className="w-full bg-[#07172f] border border-blue-500/40 rounded px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-yellow-400 h-20 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Sport Category</label>
                      <select 
                        value={eqCat} 
                        onChange={e => setEqCat(e.target.value)} 
                        className="w-full bg-[#07172f] border border-blue-500/40 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                      >
                        <option value="Basketball">Basketball</option>
                        <option value="Volleyball">Volleyball</option>
                        <option value="Football">Football</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Table Tennis">Table Tennis</option>
                        <option value="Sepak Takraw">Sepak Takraw</option>
                        <option value="Chess">Chess</option>
                        <option value="Boxing">Boxing</option>
                        <option value="Athletics">Athletics / Track &amp; Field</option>
                        <option value="Baseball">Baseball / Softball</option>
                        <option value="Other">Other Equipment</option>
                        <option value="Custom">+ Create New Sport Category...</option>
                      </select>

                      {eqCat === 'Custom' && (
                        <div className="mt-2">
                          <label className="block text-[11px] font-bold text-yellow-400 mb-1">Enter Custom Sport Name</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Lawn Tennis, Swimming, Archery"
                            value={customCat}
                            onChange={e => setCustomCat(e.target.value)}
                            className="w-full bg-[#07172f] border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Quantity Received</label>
                        <input required type="number" min="1" value={eqQty} onChange={e => setEqQty(Number(e.target.value))} className="w-full bg-[#07172f] border border-blue-500/40 rounded px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-yellow-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Condition on Arrival</label>
                        <select value={eqCondition} onChange={e => setEqCondition(e.target.value)} className="w-full bg-[#07172f] border border-blue-500/40 rounded px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-yellow-400">
                          <option value="Good / Available">Good / Available</option>
                          <option value="For Repair">For Repair</option>
                          <option value="Damaged">Damaged</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Delivery Source / Supplier</label>
                      <input type="text" value={eqSupplier} onChange={e => setEqSupplier(e.target.value)} className="w-full bg-[#07172f] border border-blue-500/40 rounded px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-yellow-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Facility / Exact Location</label>
                      <input required type="text" placeholder="e.g. Gymnasium Storage Rm A" value={eqLocation} onChange={e => setEqLocation(e.target.value)} className="w-full bg-[#07172f] border border-blue-500/40 rounded focus:outline-none focus:border-yellow-400 px-4 py-2 text-slate-100 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Remarks / Notes (Optional)</label>
                      <textarea value={eqNotes} onChange={e => setEqNotes(e.target.value)} className="w-full bg-[#07172f] border border-blue-500/40 rounded px-4 py-2 text-slate-100 focus:outline-none focus:border-yellow-400 h-20 text-xs" />
                    </div>
                    <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold py-3 rounded mt-4 flex justify-center items-center space-x-2 transition shadow-md cursor-pointer">
                      <PackagePlus className="w-5 h-5" />
                      <span>Save to Inventory</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('dashboard')}
                      className="w-full bg-[#07172f] hover:bg-blue-800/40 text-slate-300 border border-blue-500/40 font-bold py-3 rounded mt-2 flex justify-center items-center space-x-2 transition cursor-pointer"
                    >
                      <span>Cancel</span>
                    </button>
                  </form>
                </div>

                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2 font-display uppercase tracking-wide">
                      <FileBarChart className="w-5 h-5 text-yellow-400"/> 
                      <span>Arrival Log Records ({arrivalRecords.length})</span>
                    </h3>
                    {arrivalRecords.length > 0 && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete and clear ALL arrival log records?')) {
                            await clearArrivalRecords();
                            alert('All arrival log records have been deleted.');
                          }
                        }}
                        className="text-xs text-red-300 hover:text-white font-semibold flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-700/50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All Logs</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[620px] pr-1 scrollbar-thin">
                    {arrivalRecords.length === 0 ? (
                      <div className="bg-[#0e264c] border border-blue-600/40 border-dashed p-8 rounded-xl text-center text-slate-300 shadow-md">
                        <PackagePlus className="w-8 h-8 text-yellow-400 mx-auto mb-2 opacity-70" />
                        <p className="font-medium text-sm text-white">No recent equipment arrivals logged.</p>
                        <p className="text-xs text-slate-300 mt-1">Encoded arrivals from the form will be recorded and displayed here.</p>
                      </div>
                    ) : (
                      arrivalRecords.map(log => (
                        <div key={log.id} className="bg-[#0e264c] border border-blue-600/40 rounded-xl p-4 shadow-md hover:border-yellow-400 transition relative">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white">{log.equipmentName}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                                  {log.category}
                                </span>
                              </div>
                              <div className="text-xs text-slate-300 mt-1">
                                {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete arrival record for ${log.equipmentName}?`)) {
                                  await deleteArrivalRecord(log.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                              title="Delete arrival record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-300 bg-[#07172f] p-3 rounded-lg border border-blue-700/40">
                            <div><strong className="text-slate-200">Qty Received:</strong> {log.quantity} units</div>
                            <div><strong className="text-slate-200">Condition:</strong> {log.condition}</div>
                            {log.supplier && <div className="col-span-2"><strong className="text-slate-200">Supplier:</strong> {log.supplier}</div>}
                            <div className="col-span-2"><strong className="text-slate-200">Location:</strong> {log.location}</div>
                            {log.description && <div className="col-span-2 text-slate-300"><strong>Desc:</strong> {log.description}</div>}
                            {log.notes && <div className="col-span-2 text-slate-300"><strong>Notes:</strong> {log.notes}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'active_borrowers' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display uppercase tracking-wide">Active Borrowers</h2>
                  <p className="text-slate-300 text-sm mt-1">Explicitly filtered view displaying all current users holding equipment and their items.</p>
                </div>
                {users.some(u => requests.some(r => r.userId === u.id && (r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending'))) && (
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to clear ALL active borrower loans? This will reset all currently borrowed equipment back to available stock.')) {
                        await clearActiveBorrowers();
                        alert('All active borrower records have been cleared and inventory restored.');
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-700/50 rounded-lg text-sm font-semibold transition self-start md:self-auto cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Active Borrowers</span>
                  </button>
                )}
              </div>
              
              <div className="bg-[#0e264c] rounded-xl overflow-hidden overflow-x-auto border border-blue-600/40 shadow-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#07152b] text-slate-300 text-xs uppercase tracking-wider border-b border-blue-600/40">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Borrower</th>
                      <th className="px-6 py-4 font-semibold">Contact / Dept</th>
                      <th className="px-6 py-4 font-semibold">Currently Held Items</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-800/40">
                    {users.filter(u => requests.some(r => r.userId === u.id && (r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending'))).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-300">
                          <p className="font-medium text-white">No active borrowers holding equipment.</p>
                          <p className="text-xs text-slate-300 mt-1">Users with approved borrowed equipment will be shown here.</p>
                        </td>
                      </tr>
                    ) : (
                      users.filter(u => requests.some(r => r.userId === u.id && (r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending'))).map(user => {
                        const activeUserRequests = requests.filter(r => r.userId === user.id && (r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending'));
                        
                        return (
                          <tr key={user.id} className="hover:bg-blue-800/30 transition text-slate-300">
                            <td className="px-6 py-4 font-medium flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-400 text-blue-950 flex items-center justify-center text-sm font-bold shadow-md">{user.name[0]}</div>
                              <div>
                                <div className="text-white font-bold">{user.name}</div>
                                <div className="text-xs text-slate-300">{user.role} - ID: {user.id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              <div className="text-white font-medium">{user.department || 'N/A'}</div>
                              <div className="text-xs text-slate-300">{user.contact || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-3">
                                {activeUserRequests.map(req => {
                                  const items = req.items && req.items.length > 0 ? req.items : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                                  return (
                                    <div key={req.id} className="border-l-2 border-yellow-400 pl-3">
                                      {items.map((item, idx) => {
                                        const eq = equipment.find(e => e.id === item.equipmentId);
                                        return <div key={idx} className="font-medium text-yellow-300">{item.quantity}× {eq?.name || 'Item'}</div>
                                      })}
                                      <div className="text-xs text-slate-300">Return by: {new Date(req.returnDate).toLocaleString()}</div>
                                      <div className="mt-1"><StatusBadge status={req.status} /></div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {activeUserRequests.some(r => r.status === 'overdue') ? (
                                <span className="bg-red-500/20 text-red-300 border border-red-500/50 px-3 py-1 rounded-full text-xs font-semibold">Has Overdue</span>
                              ) : (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-semibold">In Good Standing</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col gap-2 items-center justify-center">
                                {activeUserRequests.map(req => (
                                  <div key={req.id} className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => updateRequestStatus(req.id, 'returned')}
                                      className="text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1 transition cursor-pointer"
                                      title="Confirm return of equipment"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Return</span>
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Delete this active borrower loan record and restore equipment?')) {
                                          await deleteRequest(req.id);
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                                      title="Delete active loan record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
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
            <div className="max-w-6xl mx-auto print:max-w-none print:w-full">
              <h2 className="text-3xl font-bold text-white mb-2 print:hidden font-display uppercase tracking-wide">REPORTS CENTER</h2>
              <p className="text-slate-300 text-sm mb-6 max-w-md print:hidden">Access and generate key reports to monitor equipment availability, inventory health, and repair activity.</p>
              
              <div id="report-content" className="bg-[#0e264c] border border-blue-600/40 rounded-xl p-8 relative print:border-none print:shadow-none print:p-0 shadow-lg print:bg-white print:text-black">
                 <div className="absolute top-8 right-8 flex space-x-4 print:hidden" data-html2canvas-ignore="true">
                    <button onClick={() => window.print()} className="bg-blue-900 hover:bg-blue-800 border border-blue-600/50 text-white px-4 py-2 rounded-lg font-semibold text-sm transition cursor-pointer">Print Report</button>
                    <button onClick={handleExportPDF} className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm cursor-pointer">Export as PDF</button>
                 </div>
                 
                 <div className="mb-8">
                   <h3 className="text-xl font-bold text-white print:text-black mb-2 font-display uppercase tracking-wide">Public Equipment Status Availability Report</h3>
                   <div className="text-sm text-slate-300 print:text-slate-600">Location: Mambusao Campus</div>
                   <div className="text-sm text-slate-300 print:text-slate-600">Report Generated: {new Date().toLocaleString()}</div>
                 </div>

                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                    <thead className="bg-[#07152b] print:bg-slate-100 text-slate-300 print:text-black text-xs uppercase tracking-wider border-b border-blue-600/40">
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
                    <tbody className="divide-y divide-blue-800/40 print:divide-slate-200">
                      {equipment.map((eq) => (
                        <tr key={eq.id} className="hover:bg-blue-800/20 print:hover:bg-transparent">
                          <td className="px-4 py-3 font-medium text-white print:text-black">{eq.name}</td>
                          <td className="px-4 py-3 text-slate-300 print:text-slate-700">{eq.category}</td>
                          <td className="px-4 py-3 text-center text-yellow-400 print:text-blue-900 font-bold font-display text-base">{eq.available}</td>
                          <td className="px-4 py-3 text-center text-slate-300 print:text-slate-700">{eq.borrowed}</td>
                          <td className="px-4 py-3 text-center text-amber-400 font-bold">{eq.inRepair}</td>
                          <td className="px-4 py-3 text-center text-red-400 font-bold">{eq.damaged}</td>
                          <td className="px-4 py-3 text-center">
                            {eq.available > 0 ? (
                              <span className="text-xs text-yellow-300 font-bold bg-yellow-400/20 border border-yellow-400/50 px-2 py-0.5 rounded-full">Available</span>
                            ) : eq.inRepair > 0 ? (
                               <span className="text-xs text-amber-300 font-bold bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 rounded-full">For Repair</span>
                            ) : (
                               <span className="text-xs text-red-300 font-bold bg-red-500/20 border border-red-500/50 px-2 py-0.5 rounded-full">Damaged</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 </div>
                 <div className="mt-8 text-xs text-slate-400">Printed for: CSU CapSu Administration</div>
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
      className={`flex items-center justify-between px-6 py-3 cursor-pointer border-l-4 transition text-sm ${
        active 
          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 font-bold' 
          : 'border-transparent text-slate-300 hover:bg-blue-800/40 hover:text-white font-medium'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-yellow-400 text-blue-950 text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Pending</span>;
  if (status === 'approved') return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Approved</span>;
  if (status === 'overdue') return <span className="bg-red-500/20 text-red-300 border border-red-500/50 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Overdue Returns</span>;
  if (status === 'declined') return <span className="bg-red-500/20 text-red-300 border border-red-500/50 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Declined</span>;
  if (status === 'returned') return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/50 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Returned</span>;
  if (status === 'return_pending') return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/50 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Return Requested</span>;
  return null;
}

function StatCard({ title, count, subtext, icon, color, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-[#0e264c] border-t-4 ${color} border border-blue-600/40 p-5 rounded-xl shadow-md flex flex-col ${onClick ? 'cursor-pointer hover:border-yellow-400 hover:-translate-y-1 transition-all duration-200' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[11px] text-slate-300 font-bold tracking-widest uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-4xl font-extrabold text-white mb-1 font-display tracking-tight">{count}</div>
      <div className="text-xs text-slate-400 font-medium mb-4">{subtext}</div>
      {onClick && (
        <div className="mt-auto flex items-center space-x-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300">
          <Search className="w-3.5 h-3.5" />
          <span>View Details</span>
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
    title = 'Active Logs: Total Units';
    data = equipment.map((e: any) => {
      let status = 'Available';
      if (e.available === 0) {
        if (e.damaged > 0) status = 'Damaged';
        else if (e.inRepair > 0) status = 'In Repair';
        else if (e.borrowed > 0) status = 'Borrowed Out';
        else status = 'Out of Stock';
      } else if (e.damaged > 0 || e.inRepair > 0) {
        status = 'Partial Available';
      }
      return { col1: e.name, col2: e.category, col3: `${e.total} Units`, col4: status, isAvailable: e.available > 0 };
    });
  } else if (type === 'available') {
    title = 'Active Logs: Available';
    data = equipment.filter((e: any) => e.available > 0).map((e: any) => ({ col1: e.name, col2: e.category, col3: `${e.available} Units`, col4: 'Available', isAvailable: true }));
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
    <div className="flex flex-col max-h-[420px] text-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2 font-display uppercase tracking-wide">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>{title}</span>
          </h3>
          <p className="text-slate-300 text-xs mt-1">Displaying current itemized data matches found inside database matching criteria filter parameters.</p>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-white p-2 bg-blue-900/60 hover:bg-blue-800 border border-blue-600/40 rounded-full transition cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 border border-blue-600/40 rounded-lg bg-[#07172f] scrollbar-thin">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#07152b] text-slate-300 text-xs uppercase tracking-wider sticky top-0 border-b border-blue-600/40">
            <tr>
              {columns.map(c => <th key={c} className="px-6 py-3 font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-800/40">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-blue-800/30 transition">
                <td className="px-6 py-3 font-bold text-white">{row.col1}</td>
                <td className="px-6 py-3 text-slate-300">{row.col2}</td>
                <td className="px-6 py-3 text-yellow-400 font-bold">{row.col3}</td>
                {columns.length > 3 && (
                  <td className="px-6 py-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border shadow-xs ${row.isAvailable ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}>{row.col4}</span>
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
        <button onClick={onClose} className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-6 py-2 rounded-lg text-sm transition shadow-md cursor-pointer">
          Dismiss Log Overlay
        </button>
      </div>
    </div>
  );
}
