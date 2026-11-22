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
  const [borrowCart, setBorrowCart] = useState<{ equipmentId: string; quantity: number }[]>([]);
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
    setBorrowCart([{ equipmentId: eq.id, quantity: 1 }]);
    setPurpose('');
    setQuickDates('4hours');
    setBorrowModalOpen(true);
  };

  const openNewBorrowRequest = () => {
    const firstAvailable = equipment.find(e => e.available > 0) || equipment[0];
    if (firstAvailable) {
      setBorrowCart([{ equipmentId: firstAvailable.id, quantity: 1 }]);
      setPurpose('');
      setQuickDates('4hours');
      setBorrowModalOpen(true);
    }
  };

  const handleConfirmBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || borrowCart.length === 0) return;

    for (const item of borrowCart) {
      const eq = equipment.find(e => e.id === item.equipmentId);
      if (!eq || item.quantity < 1 || item.quantity > eq.available) {
        alert(`Invalid quantity for ${eq?.name || 'an item'}. Please check available stock.`);
        return;
      }
    }

    const firstItem = borrowCart[0];
    const newReq: BorrowRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      equipmentId: firstItem.equipmentId,
      quantity: firstItem.quantity,
      items: borrowCart,
      purpose: purpose.trim() || 'Academic & Sports Activity',
      pickupDate: pickupDate || new Date().toISOString(),
      returnDate: returnDate || new Date(Date.now() + 4 * 3600000).toISOString(),
      status: 'pending',
      requestDate: new Date().toISOString()
    };

    submitBorrowRequest(newReq);

    // Instant real-time stock deduction for all items in cart
    for (const item of borrowCart) {
      const targetEq = equipment.find(e => e.id === item.equipmentId);
      if (targetEq) {
        const updatedAvailable = Math.max(0, targetEq.available - item.quantity);
        const updatedBorrowed = targetEq.borrowed + item.quantity;
        updateEquipment(targetEq.id, {
          available: updatedAvailable,
          borrowed: updatedBorrowed
        });
      }
    }

    setBorrowSuccessAlert(`Multi-item borrow request with ${borrowCart.length} item(s) submitted successfully!`);
    setBorrowModalOpen(false);
    setBorrowCart([]);
    setPurpose('');
    setTimeout(() => setBorrowSuccessAlert(null), 4500);
  };

  const activeCategoryMeta = selectedCategory !== 'All' ? getCategoryMeta(selectedCategory) : null;

  return (
    <div className="min-h-screen bg-[#0a1c38] text-slate-300 flex font-sans relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Navigation: CapSU Deep Royal Blue */}
      <div className={`
        fixed lg:sticky lg:top-0 h-screen inset-y-0 left-0 z-50 w-64 bg-[#07152b] border-r border-blue-700/40 flex flex-col shrink-0 overflow-hidden
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-blue-700/40 flex items-center justify-between shrink-0">
          <div>
            <div className="w-12 h-12 bg-yellow-400 text-blue-950 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md border-2 border-yellow-300">
              {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
            </div>
            <h3 className="font-bold text-white leading-snug">{currentUser.name}</h3>
            <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mt-0.5">{currentUser.role} BORROWER</p>
            <p className="text-[11px] font-medium text-slate-300 mt-1">ID: {currentUser.id}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{currentUser.department || 'Student Portal'}</p>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-300 hover:text-white p-1 rounded-lg"
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
        <div className="p-4 border-t border-blue-700/40 shrink-0 bg-[#07152b]">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-950/40 text-red-300 hover:bg-red-900/60 hover:text-white border border-red-700/50 rounded-lg font-bold text-sm transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden w-full">
        {/* Header Bar: CapSU Royal Blue with Yellow Accent */}
        <header className="flex justify-between items-center px-4 sm:px-8 py-3.5 border-b-4 border-yellow-400 bg-[#07152b] text-white shadow-md shrink-0">
          <div className="flex items-center space-x-3 text-sm">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-blue-800/40 transition cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center space-x-2.5">
              <img src="/capsu-logo.png" alt="CapSU Logo" className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400 shadow-md" />
              <span className="font-bold text-yellow-400 font-display tracking-wider text-lg">CAPSU SPORTS INVENTORY</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-200">Borrower Station</span>
            </div>
            <div className="sm:hidden flex items-center space-x-2">
              <img src="/capsu-logo.png" alt="CapSU Logo" className="w-7 h-7 rounded-full object-cover border border-yellow-400" />
              <span className="font-bold text-yellow-400 font-display text-base">CAPSU SPORTS</span>
            </div>
          </div>
          <div className="text-sm flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1.5 bg-blue-900/60 border border-blue-600/40 px-3 py-1.5 rounded-full text-slate-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>Online: <strong className="text-white">{currentUser.name}</strong></span>
            </div>
          </div>
        </header>

        {/* Global Success Alert */}
        {borrowSuccessAlert && (
          <div className="m-4 sm:mx-8 p-3.5 bg-emerald-950/80 border border-emerald-600 text-emerald-200 rounded-xl flex items-center justify-between text-sm font-medium shadow-md animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{borrowSuccessAlert}</span>
            </div>
            <button onClick={() => setBorrowSuccessAlert(null)} className="text-emerald-300 hover:text-white p-1">
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
                  <p className="text-slate-300 text-sm">Quick look into active items and sports tracking inventory</p>
                </div>
                <button
                  onClick={openNewBorrowRequest}
                  className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-5 py-2.5 rounded-lg font-bold text-sm shadow-md transition cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Start New Borrow Request</span>
                </button>
              </div>

              {/* Stat Cards: CapSU Royal Blue Cards with Yellow Accent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="TOTAL UNITS" count={totalUnits} subtext="Campus stock listing" icon={<Box className="w-5 h-5 text-slate-300" />} color="border-t-yellow-400" />
                <StatCard title="AVAILABLE NOW" count={availableUnits} subtext="Ready to apply for" icon={<Check className="w-5 h-5 text-yellow-400" />} color="border-t-yellow-400" />
                <StatCard title="MY ACTIVE BORROWS" count={activeBorrows} subtext="Items currently held" icon={<RefreshCw className="w-5 h-5 text-blue-300" />} color="border-t-blue-400" />
                <StatCard title="IN MAINTENANCE" count={forRepairUnits} subtext="Temporarily stored away" icon={<Wrench className="w-5 h-5 text-amber-400" />} color="border-t-amber-400" />
              </div>

              {/* My Requests Ledger */}
              <div className="bg-[#0e264c] border border-blue-600/40 rounded-xl overflow-hidden shadow-lg mb-8">
                <div className="px-6 py-4 border-b border-blue-600/40 bg-[#07152b] flex justify-between items-center">
                  <h3 className="text-base font-bold text-white font-display tracking-wide uppercase">My Equipment Activity Logs Ledger</h3>
                  <span className="text-xs text-slate-300 font-medium">{userRequests.length} Total Requests Recorded</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#07152b] text-slate-300 text-xs uppercase font-bold tracking-wider border-b border-blue-600/40">
                      <tr>
                        <th className="px-6 py-3.5">Equipment Details</th>
                        <th className="px-6 py-3.5">Requested Term Dates</th>
                        <th className="px-6 py-3.5">Date Requested</th>
                        <th className="px-6 py-3.5 text-center">Units</th>
                        <th className="px-6 py-3.5">Purpose</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-700/30">
                      {userRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-300">
                            <Box className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                            <p className="font-bold text-white">No borrow requests on record</p>
                            <p className="text-xs mt-1 text-slate-400">Click &quot;Borrow Equipment&quot; to pick sport items and submit a request.</p>
                          </td>
                        </tr>
                      ) : (
                        userRequests.map(req => {
                          const items = req.items && req.items.length > 0 
                            ? req.items 
                            : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                          return (
                            <tr key={req.id} className="hover:bg-blue-800/30 transition">
                              <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                  {items.map((item, idx) => {
                                    const eq = equipment.find(e => e.id === item.equipmentId);
                                    return (
                                      <div key={idx} className="flex items-center space-x-2">
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-yellow-300 border border-blue-600/50">
                                          {eq?.category || 'Sport'}
                                        </span>
                                        <span className="font-bold text-white">{item.quantity}×</span>
                                        <span className="text-slate-200 font-medium">{eq?.name || 'Item'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-300">
                                <div><strong className="text-slate-200">Pickup:</strong> {new Date(req.pickupDate).toLocaleString()}</div>
                                <div><strong className="text-slate-200">Return:</strong> {new Date(req.returnDate).toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-400 text-xs">{new Date(req.requestDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-center font-bold text-white">{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                              <td className="px-6 py-4 text-slate-300 text-xs">{req.purpose}</td>
                              <td className="px-6 py-4 text-center">
                                <StatusBadge status={req.status} />
                                {req.status === 'approved' && (
                                  <div className="mt-2 space-y-2">
                                    <select 
                                      value={returnConditions[req.id] || 'Good'}
                                      onChange={(e) => setReturnConditions({...returnConditions, [req.id]: e.target.value as 'Good' | 'Damaged'})}
                                      className="w-full text-xs bg-[#07172f] text-slate-200 border border-blue-500/40 rounded p-1.5 focus:outline-none focus:border-yellow-400"
                                    >
                                      <option value="Good">Condition: Good</option>
                                      <option value="Damaged">Condition: Damaged</option>
                                    </select>
                                    <button 
                                      onClick={() => updateRequestStatus(req.id, 'return_pending', returnConditions[req.id] || 'Good')}
                                      className="block w-full text-[11px] font-bold bg-yellow-400 hover:bg-yellow-300 text-blue-950 py-1.5 px-2 rounded-md transition shadow-md cursor-pointer"
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
                  <p className="text-slate-300 text-sm">
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
                    className="w-full pl-10 pr-4 py-2 bg-[#07172f] border border-blue-500/40 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-yellow-400 hover:text-yellow-300 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Layout with Vertical Category Sidebar on the Side */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Vertical Category Sidebar on the Side */}
                <div className="lg:col-span-1 bg-[#0e264c] border border-blue-600/40 rounded-xl p-4 shadow-lg space-y-2 h-max sticky top-6">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-yellow-400" />
                    <span>Sports Categories</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                      selectedCategory === 'All'
                        ? 'bg-yellow-400 text-blue-950 shadow-md font-extrabold'
                        : 'bg-[#07172f] text-slate-300 hover:bg-blue-800/40 hover:text-white border border-blue-600/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <CategoryIcon category="all" className="w-4 h-4" />
                      <span>All Sports</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedCategory === 'All' ? 'bg-blue-950 text-yellow-300' : 'bg-blue-950/60 text-yellow-400'
                    }`}>
                      {equipment.length}
                    </span>
                  </button>

                  {distinctCategories.map(cat => {
                    const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                    const stats = getCategoryStats(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-yellow-400 text-blue-950 shadow-md font-extrabold'
                            : 'bg-[#07172f] text-slate-300 hover:bg-blue-800/40 hover:text-white border border-blue-600/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <CategoryIcon category={cat} className={`w-4 h-4 ${isSelected ? 'text-blue-950' : 'text-yellow-400'}`} />
                          <span className="truncate">{cat}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-blue-950 text-yellow-300' : 'bg-blue-950/60 text-yellow-400'
                        }`}>
                          {stats.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Equipment Catalog on the Right */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Active Category Information Banner */}
                  {activeCategoryMeta && (
                    <div className="p-4 rounded-xl border border-blue-600/40 bg-[#0e264c] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-yellow-400 shadow-xs shrink-0">
                          <CategoryIcon category={activeCategoryMeta.name} className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white text-base">{activeCategoryMeta.name} Equipment Set</h3>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                              {getCategoryStats(activeCategoryMeta.name).totalAvail} units in stock
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">{activeCategoryMeta.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full">
                    {filteredEquipment.length === 0 ? (
                  <div className="bg-[#0e264c] border border-blue-600/40 rounded-xl p-12 text-center text-slate-300">
                    <Box className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <h4 className="font-bold text-white text-base">No Equipment Found</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {searchQuery 
                        ? `No items match "${searchQuery}" in ${selectedCategory === 'All' ? 'any category' : selectedCategory}. Try clearing your search.`
                        : `There are currently no items registered in the ${selectedCategory} category.`
                      }
                    </p>
                    <button 
                      onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                      className="mt-4 px-4 py-2 bg-yellow-400 text-blue-950 rounded-lg text-xs font-bold hover:bg-yellow-300 transition cursor-pointer shadow-md"
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
                          className="bg-[#0e264c] border border-blue-600/40 hover:border-yellow-400/80 rounded-xl p-4 flex flex-col justify-between transition shadow-md hover:shadow-xl"
                        >
                          <div>
                            {/* Category Badge and Available Count */}
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-yellow-300 border border-blue-600/50">
                                <CategoryIcon category={eq.category} className="w-3 h-3 text-yellow-400" />
                                <span>{eq.category}</span>
                              </span>

                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                eq.available > 0 
                                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50' 
                                  : eq.damaged > 0
                                    ? 'bg-red-950/70 text-red-300 border border-red-700/60'
                                    : eq.inRepair > 0
                                      ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                                      : eq.borrowed > 0
                                        ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                                        : 'bg-slate-800/80 text-slate-300 border border-slate-700'
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
                            <h3 className="font-bold text-white text-base leading-tight mb-1 font-display tracking-wide">
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
                              <div className="flex items-start space-x-1.5 bg-[#07172f] p-1.5 rounded-md border border-blue-500/40">
                                <span className="text-yellow-400 text-xs">📍</span>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Facility / Location</span>
                                  <span className="text-white font-bold text-xs leading-tight">{eq.location || 'Main Sports Storage'}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-300 pt-1">
                                <span className="font-bold text-yellow-400">Available: {eq.available}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-300">Borrowed: {eq.borrowed}</span>
                                {eq.inRepair > 0 && (
                                  <>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-amber-400 font-semibold">Repair: {eq.inRepair}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Action Button: CapSU Yellow */}
                          <div className="pt-2.5 border-t border-blue-700/40">
                            {isAvailable ? (
                              <button
                                type="button"
                                onClick={() => openBorrowModal(eq)}
                                className="w-full py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition shadow-md cursor-pointer"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                                <span>Borrow Equipment</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="w-full py-2.5 px-3 bg-slate-800/80 border border-slate-700 text-slate-400 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-not-allowed"
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
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-1 font-display tracking-wide uppercase">Borrow &amp; Account Notifications</h2>
              <p className="text-slate-300 text-sm mb-6">Real-time alerts regarding registration status, request approvals, and return deadlines.</p>

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
                      className={`bg-[#0e264c] border-l-4 p-4 rounded-r-xl border border-blue-600/40 shadow-md ${
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
                          {req.status === 'pending' && <span className="text-yellow-300 font-bold">Borrow Request Submitted for Review</span>}
                          {req.status === 'approved' && <span className="text-emerald-300 font-bold flex items-center space-x-1.5"><Check className="w-4 h-4" /><span>Borrow Request Approved &amp; Ready for Pickup!</span></span>}
                          {req.status === 'declined' && <span className="text-red-300 font-bold">Borrow Request Declined</span>}
                          {req.status === 'return_pending' && <span className="text-amber-300 font-bold">Return Process Initiated</span>}
                          {req.status === 'returned' && <span className="text-blue-300 font-bold">Return Confirmed &amp; Logged by Admin</span>}
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

                <div className="bg-[#0e264c] border-l-4 border-l-yellow-400 border border-blue-600/40 p-4 rounded-r-xl shadow-md">
                  <div className="font-bold text-white text-sm mb-1">Account Registration Verified &amp; Active</div>
                  <p className="text-slate-300 text-xs">
                    Welcome to Capiz State University Sports Equipment Management System. You are authenticated to file borrow requests across all sports categories.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DIRECT BORROW MODAL (Multi-Item Cart) */}
      {borrowModalOpen && borrowCart.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-[#0e264c] border-2 border-yellow-400 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn text-slate-200">
            {/* Modal Header: CapSU Deep Royal Blue */}
            <div className="bg-[#07152b] px-6 py-4 border-b-2 border-yellow-400 flex justify-between items-center text-white">
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">New Multi-Item Borrow Request</span>
                <h3 className="text-lg font-bold text-white leading-tight mt-0.5 font-display uppercase tracking-wide">
                  {borrowCart.length} Equipment Item{borrowCart.length === 1 ? '' : 's'} Selected
                </h3>
              </div>
              <button 
                onClick={() => setBorrowModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmBorrow} className="p-6 space-y-4">
              {/* Multi-Item Cart Builder */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Equipment List (Drop-down Selection)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextEq = equipment.find(e => e.available > 0 && !borrowCart.some(i => i.equipmentId === e.id)) || equipment[0];
                      if (nextEq) {
                        setBorrowCart([...borrowCart, { equipmentId: nextEq.id, quantity: 1 }]);
                      }
                    }}
                    className="text-xs bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-1"
                  >
                    <span>+ Add Another Item</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {borrowCart.map((item, index) => {
                    const currentEq = equipment.find(e => e.id === item.equipmentId);
                    return (
                      <div key={index} className="bg-[#07172f] p-3.5 rounded-xl border border-blue-500/40 space-y-3 relative">
                        {borrowCart.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setBorrowCart(borrowCart.filter((_, idx) => idx !== index))}
                            className="absolute top-2.5 right-2.5 text-red-400 hover:text-red-300 p-1 rounded transition cursor-pointer"
                            title="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                            Item #{index + 1} Selection
                          </label>
                          <select
                            value={item.equipmentId}
                            onChange={e => {
                              const newCart = [...borrowCart];
                              newCart[index].equipmentId = e.target.value;
                              newCart[index].quantity = 1;
                              setBorrowCart(newCart);
                            }}
                            className="w-full bg-[#0e264c] border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition cursor-pointer font-semibold pr-8"
                          >
                            {equipment.map(eq => (
                              <option key={eq.id} value={eq.id} disabled={eq.available <= 0} className="bg-[#0e264c] text-white">
                                {eq.name} ({eq.category}) — {eq.available} available {eq.available <= 0 ? '[Out of Stock]' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-slate-400">Available:</span>
                            <span className="text-yellow-400 font-extrabold ml-1.5">{currentEq?.available || 0} Units</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 font-bold text-[11px]">Quantity:</span>
                            <select
                              value={item.quantity}
                              onChange={e => {
                                const newCart = [...borrowCart];
                                newCart[index].quantity = Number(e.target.value);
                                setBorrowCart(newCart);
                              }}
                              disabled={!currentEq || currentEq.available <= 0}
                              className="bg-[#0e264c] border border-blue-500/40 rounded-lg px-3 py-1.5 text-xs text-yellow-400 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition cursor-pointer"
                            >
                              {Array.from({ length: Math.max(1, currentEq?.available || 1) }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num} className="bg-[#0e264c] text-yellow-400 font-bold">
                                  {num} {num === 1 ? 'Unit' : 'Units'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  className="w-full bg-[#07172f] border border-blue-500/40 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
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
                          : 'bg-[#07172f] text-slate-300 hover:bg-blue-800/40 border border-blue-500/40'
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
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Quick Schedule Presets
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDates('2hours')}
                    className="px-2 py-1 bg-[#07172f] hover:bg-yellow-400 hover:text-blue-950 text-slate-200 border border-blue-500/40 rounded text-[10px] font-bold transition cursor-pointer"
                  >
                    +2 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDates('4hours')}
                    className="px-2 py-1 bg-[#07172f] hover:bg-yellow-400 hover:text-blue-950 text-slate-200 border border-blue-500/40 rounded text-[10px] font-bold transition cursor-pointer"
                  >
                    +4 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDates('endOfDay')}
                    className="px-2 py-1 bg-[#07172f] hover:bg-yellow-400 hover:text-blue-950 text-slate-200 border border-blue-500/40 rounded text-[10px] font-bold transition cursor-pointer"
                  >
                    End of Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDates('tomorrow')}
                    className="px-2 py-1 bg-[#07172f] hover:bg-yellow-400 hover:text-blue-950 text-slate-200 border border-blue-500/40 rounded text-[10px] font-bold transition cursor-pointer"
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
                    className="w-full bg-[#07172f] border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
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
                    className="w-full bg-[#07172f] border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-blue-700/40 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setBorrowModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-blue-800/40 border border-blue-500/40 transition cursor-pointer"
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
          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 font-bold' 
          : 'border-transparent text-slate-300 hover:bg-blue-800/40 hover:text-white'
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
    <div className={`bg-[#0e264c] border-t-4 ${color} border border-blue-600/40 p-5 rounded-xl flex flex-col shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] text-slate-300 font-bold tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-extrabold text-white mb-1 font-display tracking-tight">{count}</div>
      <div className="text-xs text-slate-400 font-medium">{subtext}</div>
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
