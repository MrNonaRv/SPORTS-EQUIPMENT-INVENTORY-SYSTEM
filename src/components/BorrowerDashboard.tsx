import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LogOut, 
  LayoutDashboard, 
  CalendarPlus, 
  Bell, 
  Check, 
  Box, 
  RefreshCw, 
  Wrench, 
  Layers, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Minus, 
  X, 
  Menu,
  Trophy
} from 'lucide-react';
import { BorrowRequest, Equipment } from '../types';
import { getCategoryMeta } from '../data/categoryData';
import { CategoryIcon } from './CategoryIcon';

export default function BorrowerDashboard() {
  const { 
    currentUser, 
    logout, 
    requests, 
    equipment, 
    submitBorrowRequest, 
    updateRequestStatus,
    updateEquipment
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'borrow' | 'notifications'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [returnConditions, setReturnConditions] = useState<{ [key: string]: 'Good' | 'Damaged' }>({});

  // Direct Borrow Modal State (replaces Consolidated Voucher)
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [borrowQuantity, setBorrowQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [borrowSuccessAlert, setBorrowSuccessAlert] = useState<string | null>(null);

  if (!currentUser) return null;

  const userRequests = requests.filter(r => r.userId === currentUser.id);

  // Stats calculation
  const totalUnits = equipment.reduce((sum, eq) => sum + eq.total, 0);
  const availableUnits = equipment.reduce((sum, eq) => sum + eq.available, 0);
  const activeBorrows = userRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => {
      const items = r.items && r.items.length > 0 ? r.items : [{ equipmentId: r.equipmentId || '', quantity: r.quantity || 0 }];
      return sum + items.reduce((s, it) => s + it.quantity, 0);
    }, 0);
  const forRepairUnits = equipment.reduce((sum, eq) => sum + eq.inRepair, 0);

  // Dynamic distinct categories
  const distinctCategories = Array.from(new Set(equipment.map(e => e.category))).filter((cat): cat is string => Boolean(cat));

  const filteredEquipment = equipment.filter(eq => {
    const matchCat = selectedCategory === 'All' || eq.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = searchQuery.trim() === '' || 
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      eq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eq.location && eq.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const getCategoryStats = (catName: string) => {
    const items = equipment.filter(e => e.category.toLowerCase() === catName.toLowerCase());
    const totalAvail = items.reduce((sum, e) => sum + e.available, 0);
    return { count: items.length, totalAvail };
  };

  // Helper date shortcuts
  const setQuickDates = (preset: '2hours' | '4hours' | 'endOfDay' | 'tomorrow') => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toIsoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setPickupDate(toIsoLocal(now));

    const ret = new Date(now);
    if (preset === '2hours') {
      ret.setHours(ret.getHours() + 2);
    } else if (preset === '4hours') {
      ret.setHours(ret.getHours() + 4);
    } else if (preset === 'endOfDay') {
      ret.setHours(17, 30, 0, 0);
    } else if (preset === 'tomorrow') {
      ret.setDate(ret.getDate() + 1);
      ret.setHours(17, 0, 0, 0);
    }
    setReturnDate(toIsoLocal(ret));
  };

  const openBorrowModal = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setBorrowQuantity(1);
    setPurpose('');
    setQuickDates('4hours');
    setBorrowModalOpen(true);
  };

  const handleConfirmBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedEquipment) return;
    if (borrowQuantity < 1 || borrowQuantity > selectedEquipment.available) return;

    const newReq: BorrowRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      equipmentId: selectedEquipment.id,
      quantity: borrowQuantity,
      items: [{ equipmentId: selectedEquipment.id, quantity: borrowQuantity }],
      purpose: purpose.trim() || 'Academic & Sports Activity',
      pickupDate: pickupDate || new Date().toISOString(),
      returnDate: returnDate || new Date(Date.now() + 4 * 3600000).toISOString(),
      status: 'pending',
      requestDate: new Date().toISOString()
    };

    submitBorrowRequest(newReq);

    // Instant real-time stock deduction
    const updatedAvailable = Math.max(0, selectedEquipment.available - borrowQuantity);
    const updatedBorrowed = selectedEquipment.borrowed + borrowQuantity;
    updateEquipment(selectedEquipment.id, {
      available: updatedAvailable,
      borrowed: updatedBorrowed
    });

    setBorrowSuccessAlert(`Borrow request for ${borrowQuantity}x ${selectedEquipment.name} submitted successfully!`);
    setBorrowModalOpen(false);
    setSelectedEquipment(null);
    setBorrowQuantity(1);
    setPurpose('');
    setTimeout(() => setBorrowSuccessAlert(null), 4500);
  };

  const activeCategoryMeta = selectedCategory !== 'All' ? getCategoryMeta(selectedCategory) : null;

  return (
    <div className="min-h-screen bg-[#080e1e] text-slate-300 flex font-sans relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <div className={`
        fixed lg:sticky lg:top-0 h-screen inset-y-0 left-0 z-50 w-64 bg-[#0b142a] border-r border-blue-900/50 flex flex-col shrink-0 overflow-hidden
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-blue-900/50 flex items-center justify-between shrink-0">
          <div>
            <div className="w-12 h-12 bg-yellow-400 text-blue-950 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md">
              {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
            </div>
            <h3 className="font-bold text-white leading-snug">{currentUser.name}</h3>
            <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mt-0.5">{currentUser.role} BORROWER</p>
            <p className="text-[11px] font-medium text-slate-400 mt-1">ID: {currentUser.id}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{currentUser.department || 'Student Portal'}</p>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <div onClick={() => setMobileMenuOpen(false)}>
            <NavItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
          </div>
          <div onClick={() => setMobileMenuOpen(false)}>
            <NavItem 
              icon={<CalendarPlus className="w-5 h-5" />} 
              label="Borrow Equipment" 
              active={activeTab === 'borrow'} 
              onClick={() => setActiveTab('borrow')} 
            />
          </div>
          <div onClick={() => setMobileMenuOpen(false)}>
            <NavItem 
              icon={<Bell className="w-5 h-5" />} 
              label="Notifications" 
              active={activeTab === 'notifications'} 
              onClick={() => setActiveTab('notifications')} 
              badge={userRequests.filter(r => r.status === 'pending' || r.status === 'approved').length} 
            />
          </div>
        </nav>

        {/* Non-scrollable Logout Footer */}
        <div className="p-4 border-t border-blue-900/50 shrink-0 bg-[#0b142a]">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-950/50 text-red-400 hover:bg-red-900/40 hover:text-red-300 border border-red-800/40 rounded-lg font-medium text-sm transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden w-full">
        {/* Header Bar */}
        <header className="flex justify-between items-center px-4 sm:px-8 py-3.5 border-b border-blue-900/50 bg-[#0b142a]/90 backdrop-blur-md shadow-sm shrink-0">
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-blue-900/30 transition cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="font-bold text-yellow-400 font-display tracking-wider text-base">CSU CapSu Sports Management</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">Student Borrowing Station</span>
            </div>
            <div className="sm:hidden font-bold text-yellow-400 font-display text-base">CSU CapSu Sports</div>
          </div>
          <div className="text-sm flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1.5 bg-blue-950/70 border border-blue-800/60 px-3 py-1.5 rounded-full text-slate-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Online: <strong className="text-white">{currentUser.name}</strong></span>
            </div>
          </div>
        </header>

        {/* Global Success Alert */}
        {borrowSuccessAlert && (
          <div className="m-4 sm:mx-8 p-3.5 bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 rounded-xl flex items-center justify-between text-sm font-medium shadow-lg animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{borrowSuccessAlert}</span>
            </div>
            <button onClick={() => setBorrowSuccessAlert(null)} className="text-emerald-400 hover:text-emerald-200 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Contents */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 font-display tracking-wide uppercase">Personal Overview Dashboard</h2>
                  <p className="text-slate-400 text-sm">Quick look into active items and sports tracking inventory</p>
                </div>
                <button
                  onClick={() => setActiveTab('borrow')}
                  className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-5 py-2.5 rounded-lg font-bold text-sm shadow-md transition cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Start New Borrow Request</span>
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="TOTAL UNITS" count={totalUnits} subtext="Campus stock listing" icon={<Box className="w-5 h-5 text-slate-400" />} color="border-t-yellow-400" />
                <StatCard title="AVAILABLE NOW" count={availableUnits} subtext="Ready to apply for" icon={<Check className="w-5 h-5 text-emerald-400" />} color="border-t-emerald-400" />
                <StatCard title="MY ACTIVE BORROWS" count={activeBorrows} subtext="Items currently held" icon={<RefreshCw className="w-5 h-5 text-blue-400" />} color="border-t-blue-400" />
                <StatCard title="IN MAINTENANCE" count={forRepairUnits} subtext="Temporarily stored away" icon={<Wrench className="w-5 h-5 text-amber-400" />} color="border-t-amber-400" />
              </div>

              {/* My Requests Ledger */}
              <div className="bg-[#101b38] border border-blue-900/60 rounded-xl overflow-hidden shadow-md mb-8">
                <div className="px-6 py-4 border-b border-blue-900/50 bg-[#0d162e] flex justify-between items-center">
                  <h3 className="text-base font-bold text-white font-display tracking-wide uppercase">My Equipment Activity Logs Ledger</h3>
                  <span className="text-xs text-slate-400 font-medium">{userRequests.length} Total Requests Recorded</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0b1328] text-slate-400 text-xs uppercase font-semibold border-b border-blue-900/50">
                      <tr>
                        <th className="px-6 py-3.5">Equipment Details</th>
                        <th className="px-6 py-3.5">Requested Term Dates</th>
                        <th className="px-6 py-3.5">Date Requested</th>
                        <th className="px-6 py-3.5">Units</th>
                        <th className="px-6 py-3.5">Purpose</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                      {userRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            <Box className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                            <p className="font-medium text-slate-300">No borrow requests on record</p>
                            <p className="text-xs mt-1 text-slate-400">Click &quot;Borrow Equipment&quot; to pick sport items and submit a request.</p>
                          </td>
                        </tr>
                      ) : (
                        userRequests.map(req => {
                          const items = req.items && req.items.length > 0 
                            ? req.items 
                            : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                          return (
                            <tr key={req.id} className="hover:bg-blue-900/20 transition">
                              <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                  {items.map((item, idx) => {
                                    const eq = equipment.find(e => e.id === item.equipmentId);
                                    return (
                                      <div key={idx} className="flex items-center space-x-2">
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                                          {eq?.category || 'Sport'}
                                        </span>
                                        <span className="font-semibold text-yellow-400">{item.quantity}×</span>
                                        <span className="text-slate-200">{eq?.name || 'Item'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-300">
                                <div><strong className="text-slate-400">Pickup:</strong> {new Date(req.pickupDate).toLocaleString()}</div>
                                <div><strong className="text-slate-400">Return:</strong> {new Date(req.returnDate).toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-400 text-xs">{new Date(req.requestDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4 font-bold text-white">{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                              <td className="px-6 py-4 text-slate-300 text-xs">{req.purpose}</td>
                              <td className="px-6 py-4 text-center">
                                <StatusBadge status={req.status} />
                                {req.status === 'approved' && (
                                  <div className="mt-2 space-y-2">
                                    <select 
                                      value={returnConditions[req.id] || 'Good'}
                                      onChange={(e) => setReturnConditions({...returnConditions, [req.id]: e.target.value as 'Good' | 'Damaged'})}
                                      className="w-full text-xs bg-[#0a1122] text-slate-200 border border-blue-900/70 rounded p-1.5 focus:outline-none focus:border-yellow-400"
                                    >
                                      <option value="Good">Condition: Good</option>
                                      <option value="Damaged">Condition: Damaged</option>
                                    </select>
                                    <button 
                                      onClick={() => updateRequestStatus(req.id, 'return_pending', returnConditions[req.id] || 'Good')}
                                      className="block w-full text-[11px] font-bold bg-yellow-400 hover:bg-yellow-300 text-blue-950 py-1.5 px-2 rounded-md transition shadow-sm cursor-pointer"
                                    >
                                      Initiate Return
                                    </button>
                                  </div>
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
            </div>
          )}

          {/* TAB 2: CATEGORIZED BORROWING SYSTEM (Full-width clean grid without voucher sidebar) */}
          {activeTab === 'borrow' && (
            <div className="max-w-7xl mx-auto">
              {/* Header Title & Description */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 font-display uppercase tracking-wide">
                    <span>Categorized Sports Inventory</span>
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Select a sport category, review real-time stock availability, and borrow equipment directly.
                  </p>
                </div>

                {/* Quick Search */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search equipment, net, ball..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0e172e] border border-blue-900/60 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* DYNAMIC SPORT CATEGORY SELECTOR CARDS & TABS */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-yellow-400" />
                    Select Sport / Activity Category
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Showing {filteredEquipment.length} item{filteredEquipment.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {/* All Sports Pill */}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-bold whitespace-nowrap transition shrink-0 cursor-pointer ${
                      selectedCategory === 'All'
                        ? 'bg-yellow-400 text-blue-950 border-yellow-400 shadow-md'
                        : 'bg-[#101b38] text-slate-300 border-blue-900/60 hover:border-yellow-400/50 hover:bg-[#14234a]'
                    }`}
                  >
                    <CategoryIcon category="all" className="w-4 h-4" />
                    <span>All Sports</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedCategory === 'All' ? 'bg-blue-950 text-yellow-400' : 'bg-blue-950/80 text-slate-400'
                    }`}>
                      {equipment.length}
                    </span>
                  </button>

                  {/* Dynamic Category Pills */}
                  {distinctCategories.map(cat => {
                    const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                    const stats = getCategoryStats(cat);

                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-bold whitespace-nowrap transition shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-yellow-400 text-blue-950 border-yellow-400 shadow-md'
                            : 'bg-[#101b38] text-slate-300 border-blue-900/60 hover:border-yellow-400/50 hover:bg-[#14234a]'
                        }`}
                      >
                        <CategoryIcon category={cat} className={`w-4 h-4 ${isSelected ? 'text-blue-950' : 'text-yellow-400'}`} />
                        <span>{cat}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-blue-950 text-yellow-400' : 'bg-blue-950/80 text-slate-400'
                        }`}>
                          {stats.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Category Information Banner (Quick Bundle button removed) */}
              {activeCategoryMeta && (
                <div className="p-4 rounded-xl border border-blue-900/60 bg-[#101b38] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-yellow-400 shadow-xs shrink-0">
                      <CategoryIcon category={activeCategoryMeta.name} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-base">{activeCategoryMeta.name} Equipment Set</h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-yellow-400 border border-yellow-400/40">
                          {getCategoryStats(activeCategoryMeta.name).totalAvail} units in stock
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{activeCategoryMeta.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Equipment Catalog: Clean Full-Width Grid */}
              <div className="w-full">
                {filteredEquipment.length === 0 ? (
                  <div className="bg-[#101b38] border border-blue-900/60 rounded-xl p-12 text-center text-slate-400">
                    <Box className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                    <h4 className="font-bold text-white text-base">No Equipment Found</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {searchQuery 
                        ? `No items match "${searchQuery}" in ${selectedCategory === 'All' ? 'any category' : selectedCategory}. Try clearing your search.`
                        : `There are currently no items registered in the ${selectedCategory} category.`
                      }
                    </p>
                    <button 
                      onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                      className="mt-4 px-4 py-2 bg-yellow-400 text-blue-950 rounded-lg text-xs font-bold hover:bg-yellow-300 transition cursor-pointer"
                    >
                      View All Categories
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEquipment.map(eq => {
                      const isAvailable = eq.available > 0;

                      return (
                        <div 
                          key={eq.id} 
                          className="bg-[#101b38] border border-blue-900/60 hover:border-blue-700/80 rounded-xl p-4 flex flex-col justify-between transition hover:shadow-lg"
                        >
                          <div>
                            {/* Category Badge and Available Count */}
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60">
                                <CategoryIcon category={eq.category} className="w-3 h-3 text-yellow-400" />
                                <span>{eq.category}</span>
                              </span>

                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                eq.available > 0 
                                  ? 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/40' 
                                  : eq.damaged > 0
                                    ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                                    : eq.inRepair > 0
                                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                                      : eq.borrowed > 0
                                        ? 'bg-blue-950/90 text-blue-300 border border-blue-800/60'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {eq.available > 0 
                                  ? `${eq.available} Available` 
                                  : eq.damaged > 0 
                                    ? 'Damaged' 
                                    : eq.inRepair > 0 
                                      ? 'In Repair' 
                                      : eq.borrowed > 0 
                                        ? 'Borrowed Out' 
                                        : 'Out of Stock'}
                              </span>
                            </div>

                            {/* Equipment Name */}
                            <h3 className="font-bold text-white text-sm leading-tight mb-1">
                              {eq.name}
                            </h3>

                            {eq.description && (
                              <p className="text-[11px] text-slate-300 mb-2.5 line-clamp-2">
                                <span className="font-semibold text-slate-400">Details: </span>
                                {eq.description}
                              </p>
                            )}

                            {/* Equipment Location and Stock Breakdown */}
                            <div className="text-[11px] text-slate-300 space-y-1.5 mb-3">
                              <div className="flex items-start space-x-1.5 bg-[#0a1122] p-1.5 rounded-md border border-blue-900/50">
                                <span className="text-yellow-400 text-xs">📍</span>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Facility / Location</span>
                                  <span className="text-white font-semibold text-xs leading-tight">{eq.location || 'Main Sports Storage'}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                                <span className="font-semibold text-yellow-400">Available: {eq.available}</span>
                                <span>•</span>
                                <span>Borrowed: {eq.borrowed}</span>
                                {eq.inRepair > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-400">Repair: {eq.inRepair}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Action Button */}
                          <div className="pt-2.5 border-t border-blue-900/40">
                            {isAvailable ? (
                              <button
                                type="button"
                                onClick={() => openBorrowModal(eq)}
                                className="w-full py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                                <span>Borrow Equipment</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="w-full py-2.5 px-3 bg-[#0a1122] border border-slate-800 text-slate-500 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-not-allowed"
                              >
                                <span>Out of Stock</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-1 font-display tracking-wide uppercase">Borrow &amp; Account Notifications</h2>
              <p className="text-slate-400 text-sm mb-6">Real-time alerts regarding registration status, request approvals, and return deadlines.</p>

              <div className="space-y-4">
                {userRequests.map(req => {
                  const items = req.items && req.items.length > 0 
                    ? req.items 
                    : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                  const itemDescriptions = items.map(item => {
                    const eq = equipment.find(e => e.id === item.equipmentId);
                    return `${item.quantity}x ${eq?.name || 'Item'}`;
                  }).join(', ');
                  
                  return (
                    <div 
                      key={req.id} 
                      className={`bg-[#101b38] border-l-4 p-4 rounded-r-xl border border-blue-900/60 shadow-sm ${
                        req.status === 'approved' 
                          ? 'border-l-emerald-400' 
                          : req.status === 'pending'
                            ? 'border-l-yellow-400'
                            : req.status === 'declined'
                              ? 'border-l-red-400'
                              : 'border-l-blue-400'
                      }`}
                    >
                      <div className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                        <div>
                          {req.status === 'pending' && <span className="text-yellow-400">Borrow Request Submitted for Review</span>}
                          {req.status === 'approved' && <span className="text-emerald-400 flex items-center space-x-1.5"><Check className="w-4 h-4" /><span>Borrow Request Approved &amp; Ready for Pickup!</span></span>}
                          {req.status === 'declined' && <span className="text-red-400">Borrow Request Declined</span>}
                          {req.status === 'return_pending' && <span className="text-amber-400">Return Process Initiated</span>}
                          {req.status === 'returned' && <span className="text-slate-400">Return Confirmed &amp; Logged by Admin</span>}
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {new Date(req.requestDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Your request for <strong className="text-white">{itemDescriptions}</strong> ({req.purpose}) {req.status === 'pending' ? 'is currently pending admin approval.' : `has been marked as ${req.status}.`} Pickup: {new Date(req.pickupDate).toLocaleString()} | Return: {new Date(req.returnDate).toLocaleString()}
                      </p>
                    </div>
                  );
                })}

                <div className="bg-[#101b38] border-l-4 border-l-emerald-400 border border-blue-900/60 p-4 rounded-r-xl shadow-sm">
                  <div className="font-bold text-emerald-300 text-sm mb-1">Account Registration Verified &amp; Active</div>
                  <p className="text-slate-300 text-xs">
                    Welcome to Capiz State University Sports Equipment Management System. You are authenticated to file borrow requests across all sports categories.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DIRECT BORROW MODAL (Replaces Consolidated Voucher Cart) */}
      {borrowModalOpen && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-[#101b38] border border-blue-800/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn text-slate-300">
            {/* Modal Header */}
            <div className="bg-[#0b142a] px-6 py-4 border-b border-blue-900/60 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">New Borrow Request</span>
                <h3 className="text-lg font-bold text-white leading-tight mt-0.5">{selectedEquipment.name}</h3>
              </div>
              <button 
                onClick={() => setBorrowModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmBorrow} className="p-6 space-y-4">
              {/* Item Info Summary */}
              <div className="bg-[#0a1122] p-3 rounded-xl border border-blue-900/50 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Sport Category:</span>
                  <span className="text-white font-bold ml-1.5">{selectedEquipment.category}</span>
                </div>
                <div>
                  <span className="text-slate-400">Currently Available:</span>
                  <span className="text-yellow-400 font-bold ml-1.5">{selectedEquipment.available} Units</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Quantity to Borrow
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-blue-900/70 bg-[#0a1122] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      disabled={borrowQuantity <= 1}
                      onClick={() => setBorrowQuantity(Math.max(1, borrowQuantity - 1))}
                      className="p-2.5 text-slate-300 hover:text-white hover:bg-blue-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-white">
                      {borrowQuantity}
                    </span>
                    <button
                      type="button"
                      disabled={borrowQuantity >= selectedEquipment.available}
                      onClick={() => setBorrowQuantity(Math.min(selectedEquipment.available, borrowQuantity + 1))}
                      className="p-2.5 text-slate-300 hover:text-white hover:bg-blue-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Max allowed: {selectedEquipment.available} unit{selectedEquipment.available === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Intended Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Intended Purpose
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. PE Class, Intramural Match, Varsity Practice"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
                />
                {/* Fast Purpose Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['PE Class', 'Intramural Game', 'Varsity Practice', 'Tournament', 'Recreational'].map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setPurpose(tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                        purpose === tag 
                          ? 'bg-yellow-400 text-blue-950 font-bold' 
                          : 'bg-[#0a1122] text-slate-400 hover:text-slate-200 border border-blue-900/50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Duration Shortcuts */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Quick Schedule Presets
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDates('2hours')}
                    className="px-2 py-1 bg-[#0a1122] hover:bg-yellow-400/10 hover:text-yellow-400 border border-blue-900/60 rounded text-[10px] font-bold text-slate-300 transition"
                  >
                    +2 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDates('4hours')}
                    className="px-2 py-1 bg-[#0a1122] hover:bg-yellow-400/10 hover:text-yellow-400 border border-blue-900/60 rounded text-[10px] font-bold text-slate-300 transition"
                  >
                    +4 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDates('endOfDay')}
                    className="px-2 py-1 bg-[#0a1122] hover:bg-yellow-400/10 hover:text-yellow-400 border border-blue-900/60 rounded text-[10px] font-bold text-slate-300 transition"
                  >
                    End of Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDates('tomorrow')}
                    className="px-2 py-1 bg-[#0a1122] hover:bg-yellow-400/10 hover:text-yellow-400 border border-blue-900/60 rounded text-[10px] font-bold text-slate-300 transition"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Pickup and Return Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-yellow-400" />
                    <span>Pickup Date &amp; Time</span>
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={pickupDate}
                    onChange={e => setPickupDate(e.target.value)}
                    className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-yellow-400" />
                    <span>Return Deadline</span>
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full bg-[#0a1122] border border-blue-900/70 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-blue-900/60 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setBorrowModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-900/40 border border-blue-900/50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Borrow Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-6 py-3 cursor-pointer border-l-4 transition text-sm font-semibold ${
        active 
          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' 
          : 'border-transparent text-slate-400 hover:bg-blue-900/30 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-yellow-400 text-blue-950 text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

function StatCard({ title, count, subtext, icon, color }: any) {
  return (
    <div className={`bg-[#101b38] border-t-4 ${color} border border-blue-900/60 p-5 rounded-xl flex flex-col shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1 font-display tracking-tight">{count}</div>
      <div className="text-xs text-slate-400">{subtext}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <span className="bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Pending</span>;
  if (status === 'approved') return <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Approved</span>;
  if (status === 'overdue') return <span className="bg-red-950/70 text-red-300 border border-red-700/60 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Overdue Returns</span>;
  if (status === 'declined') return <span className="bg-red-950/70 text-red-300 border border-red-700/60 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Declined</span>;
  if (status === 'returned') return <span className="bg-blue-950/80 text-blue-300 border border-blue-700/60 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Returned</span>;
  if (status === 'return_pending') return <span className="bg-blue-950/80 text-blue-300 border border-blue-700/60 px-3 py-1 rounded-full shadow-xs text-xs font-bold">Return Requested</span>;
  return null;
}
