import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LogOut, 
  LayoutDashboard, 
  CalendarPlus, 
  Bell, 
  Box, 
  Check, 
  RefreshCw, 
  Wrench, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  Clock, 
  Calendar, 
  ArrowRight,
  Layers,
  ShoppingBag,
  Info,
  CheckCircle2
} from 'lucide-react';
import { BorrowRequest } from '../types';
import { getCategoryMeta } from '../data/categoryData';
import { CategoryIcon } from './CategoryIcon';

export default function BorrowerDashboard() {
  const { currentUser, logout, equipment, requests, submitBorrowRequest, updateRequestStatus } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'borrow' | 'notifications'>('dashboard');
  const [returnConditions, setReturnConditions] = useState<Record<string, 'Good' | 'Damaged'>>({});

  const userRequests = requests.filter(r => r.userId === currentUser?.id);
  const activeBorrows = userRequests.filter(r => r.status === 'approved' || r.status === 'overdue').length;

  const totalUnits = equipment.reduce((acc, eq) => acc + eq.total, 0);
  const availableUnits = equipment.reduce((acc, eq) => acc + eq.available, 0);
  const forRepairUnits = equipment.reduce((acc, eq) => acc + eq.inRepair, 0);

  // Dynamic Categories and Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all distinct categories present in the equipment database
  const distinctCategories = useMemo(() => {
    const cats = Array.from(new Set(equipment.map(e => e.category))).filter((cat): cat is string => Boolean(cat));
    // Sort logically with popular sports first if available
    const priorityOrder = ['Basketball', 'Badminton', 'Volleyball', 'Football', 'Table Tennis', 'Sepak Takraw', 'Chess', 'Boxing'];
    return cats.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a);
      const idxB = priorityOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [equipment]);

  // Filtered Equipment List based on Category and Search
  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchCategory = selectedCategory === 'All' 
        ? true 
        : eq.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchSearch = searchQuery.trim() === ''
        ? true
        : eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (eq.location && eq.location.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [equipment, selectedCategory, searchQuery]);

  // Category statistics helper
  const getCategoryStats = (catName: string) => {
    const items = catName === 'All' 
      ? equipment 
      : equipment.filter(e => e.category.toLowerCase() === catName.toLowerCase());
    const count = items.length;
    const totalAvail = items.reduce((sum, e) => sum + e.available, 0);
    return { count, totalAvail };
  };

  // Borrow Voucher Cart State
  const [cart, setCart] = useState<{equipmentId: string, quantity: number}[]>([]);
  const [purpose, setPurpose] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bundleAlert, setBundleAlert] = useState<string | null>(null);

  // Cart Management Functions
  const addToCart = (eqId: string, quantityToAdd: number = 1) => {
    const eq = equipment.find(e => e.id === eqId);
    if (!eq) return;

    const existingIndex = cart.findIndex(item => item.equipmentId === eqId);
    const currentInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const maxAvailable = eq.available;

    const finalQty = Math.min(currentInCart + quantityToAdd, maxAvailable);
    if (finalQty <= currentInCart) return;

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity = finalQty;
      setCart(newCart);
    } else {
      setCart([...cart, { equipmentId: eqId, quantity: Math.min(quantityToAdd, maxAvailable) }]);
    }
  };

  const updateCartQuantity = (index: number, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(index);
      return;
    }
    const item = cart[index];
    const eq = equipment.find(e => e.id === item.equipmentId);
    const maxAvail = eq?.available || 1;
    const boundedQty = Math.min(newQty, maxAvail);

    const newCart = [...cart];
    newCart[index].quantity = boundedQty;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  // One-click Sport Kit Bundling Helper
  const handleQuickBundleKit = (catName: string) => {
    const meta = getCategoryMeta(catName);
    const itemsInCat = equipment.filter(e => e.category.toLowerCase() === catName.toLowerCase());
    
    if (itemsInCat.length === 0) return;

    const newCart = [...cart];
    let itemsAddedCount = 0;

    if (meta.recommendedBundle && meta.recommendedBundle.items.length > 0) {
      // Add based on recommended pattern
      for (const bundleItem of meta.recommendedBundle.items) {
        const targetEq = itemsInCat.find(e => 
          e.name.toLowerCase().includes(bundleItem.itemNamePattern.toLowerCase())
        );
        if (targetEq && targetEq.available > 0) {
          const existingIdx = newCart.findIndex(c => c.equipmentId === targetEq.id);
          const currentQty = existingIdx >= 0 ? newCart[existingIdx].quantity : 0;
          const qtyToAdd = Math.min(bundleItem.quantity, targetEq.available - currentQty);
          
          if (qtyToAdd > 0) {
            if (existingIdx >= 0) {
              newCart[existingIdx].quantity += qtyToAdd;
            } else {
              newCart.push({ equipmentId: targetEq.id, quantity: qtyToAdd });
            }
            itemsAddedCount += qtyToAdd;
          }
        }
      }
    } else {
      // Fallback: Bundle 1 of each available item in this sport category
      for (const eq of itemsInCat) {
        if (eq.available > 0) {
          const existingIdx = newCart.findIndex(c => c.equipmentId === eq.id);
          if (existingIdx === -1) {
            newCart.push({ equipmentId: eq.id, quantity: 1 });
            itemsAddedCount += 1;
          }
        }
      }
    }

    setCart(newCart);
    setBundleAlert(`⚡ Added ${catName} sport kit to your Voucher Cart!`);
    setTimeout(() => setBundleAlert(null), 3500);
  };

  // Helper date shortcuts
  const setQuickDates = (preset: '2hours' | '4hours' | 'endOfDay' | 'tomorrow') => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toIsoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // Set pickup to now
    setPickupDate(toIsoLocal(now));

    const ret = new Date(now);
    if (preset === '2hours') {
      ret.setHours(ret.getHours() + 2);
    } else if (preset === '4hours') {
      ret.setHours(ret.getHours() + 4);
    } else if (preset === 'endOfDay') {
      ret.setHours(17, 30, 0, 0); // 5:30 PM
    } else if (preset === 'tomorrow') {
      ret.setDate(ret.getDate() + 1);
      ret.setHours(17, 0, 0, 0);
    }
    setReturnDate(toIsoLocal(ret));
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || cart.length === 0) return;
    
    const newReq: BorrowRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      items: cart,
      purpose: purpose || 'Academic & Sports Activity',
      pickupDate: pickupDate || new Date().toISOString(),
      returnDate: returnDate || new Date(Date.now() + 4 * 3600000).toISOString(),
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
    }, 2200);
  };

  if (!currentUser) return null;

  const totalCartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeCategoryMeta = selectedCategory !== 'All' ? getCategoryMeta(selectedCategory) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <div className="w-12 h-12 bg-emerald-900 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 shadow-sm">
            {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
          </div>
          <h3 className="font-bold text-slate-900 leading-snug">{currentUser.name}</h3>
          <p className="text-xs text-emerald-900 font-semibold uppercase tracking-wider mt-0.5">{currentUser.role} BORROWER</p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">ID: {currentUser.id}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{currentUser.department || 'Student Portal'}</p>
        </div>
        
        <nav className="flex-1 py-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<CalendarPlus className="w-5 h-5" />} 
            label="Borrow Equipment" 
            active={activeTab === 'borrow'} 
            onClick={() => setActiveTab('borrow')} 
            badge={totalCartUnits > 0 ? totalCartUnits : undefined}
          />
          <NavItem 
            icon={<Bell className="w-5 h-5" />} 
            label="Notifications" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
            badge={userRequests.filter(r => r.status === 'pending' || r.status === 'approved').length} 
          />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="flex justify-between items-center px-8 py-3.5 border-b border-slate-200 bg-white shadow-xs shrink-0">
          <div className="flex items-center space-x-3 text-sm text-slate-600">
            <span className="font-semibold text-emerald-900">CSU MSAC Sports Management</span>
            <span className="text-slate-300">/</span>
            <span>Student Borrowing Station</span>
          </div>
          <div className="text-sm flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-slate-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Online: <strong className="text-slate-900">{currentUser.name}</strong></span>
            </div>
            {totalCartUnits > 0 && (
              <button 
                onClick={() => setActiveTab('borrow')}
                className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 hover:bg-blue-100 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Voucher Cart ({totalCartUnits})</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Contents */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Personal Overview Dashboard</h2>
                  <p className="text-slate-500 text-sm">Quick look into active items and sports tracking inventory</p>
                </div>
                <button
                  onClick={() => setActiveTab('borrow')}
                  className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Start New Borrow Request</span>
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="TOTAL UNITS" count={totalUnits} subtext="Campus stock listing" icon={<Box className="w-5 h-5 text-slate-500" />} color="border-amber-600" />
                <StatCard title="AVAILABLE NOW" count={availableUnits} subtext="Ready to apply for" icon={<Check className="w-5 h-5 text-green-500" />} color="border-green-500" />
                <StatCard title="MY ACTIVE BORROWS" count={activeBorrows} subtext="Items currently held" icon={<RefreshCw className="w-5 h-5 text-amber-500" />} color="border-amber-400" />
                <StatCard title="IN MAINTENANCE" count={forRepairUnits} subtext="Temporarily stored away" icon={<Wrench className="w-5 h-5 text-amber-500" />} color="border-amber-400" />
              </div>

              {/* My Requests Ledger */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mb-8">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">My Equipment Activity Logs Ledger</h3>
                  <span className="text-xs text-slate-500 font-medium">{userRequests.length} Total Requests Recorded</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">Equipment Details</th>
                        <th className="px-6 py-3.5">Requested Term Dates</th>
                        <th className="px-6 py-3.5">Date Requested</th>
                        <th className="px-6 py-3.5">Units</th>
                        <th className="px-6 py-3.5">Purpose</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {userRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            <Box className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                            <p className="font-medium text-slate-600">No borrow vouchers on record</p>
                            <p className="text-xs mt-1 text-slate-400">Click &quot;Borrow Equipment&quot; to pick sport items and submit a request.</p>
                          </td>
                        </tr>
                      ) : (
                        userRequests.map(req => {
                          const items = req.items && req.items.length > 0 
                            ? req.items 
                            : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
                          return (
                            <tr key={req.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                  {items.map((item, idx) => {
                                    const eq = equipment.find(e => e.id === item.equipmentId);
                                    const meta = getCategoryMeta(eq?.category || 'Other');
                                    return (
                                      <div key={idx} className="flex items-center space-x-2">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.badgeBg} ${meta.badgeText}`}>
                                          {eq?.category || 'Sport'}
                                        </span>
                                        <span className="font-semibold text-slate-800">{item.quantity}×</span>
                                        <span className="text-slate-700">{eq?.name || 'Item'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-600">
                                <div><strong className="text-slate-700">Pickup:</strong> {new Date(req.pickupDate).toLocaleString()}</div>
                                <div><strong className="text-slate-700">Return:</strong> {new Date(req.returnDate).toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-xs">{new Date(req.requestDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4 font-bold text-slate-800">{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                              <td className="px-6 py-4 text-slate-600 text-xs">{req.purpose}</td>
                              <td className="px-6 py-4 text-center">
                                <StatusBadge status={req.status} />
                                {req.status === 'approved' && (
                                  <div className="mt-2 space-y-2">
                                    <select 
                                      value={returnConditions[req.id] || 'Good'}
                                      onChange={(e) => setReturnConditions({...returnConditions, [req.id]: e.target.value as 'Good' | 'Damaged'})}
                                      className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:border-amber-500"
                                    >
                                      <option value="Good">Condition: Good</option>
                                      <option value="Damaged">Condition: Damaged</option>
                                    </select>
                                    <button 
                                      onClick={() => updateRequestStatus(req.id, 'return_pending', returnConditions[req.id] || 'Good')}
                                      className="block w-full text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-2 rounded-md transition shadow-2xs"
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

          {/* TAB 2: CATEGORIZED BORROWING SYSTEM */}
          {activeTab === 'borrow' && (
            <div className="max-w-7xl mx-auto">
              {/* Header Title & Description */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span>Categorized Sports Inventory</span>
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Select a sport category to view exclusively mapped equipment, bundle multiple items, and submit a single consolidated voucher request.
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
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Banner when Kit Bundled */}
              {bundleAlert && (
                <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-medium shadow-xs animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{bundleAlert}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">Consolidated into Cart</span>
                </div>
              )}

              {/* DYNAMIC SPORT CATEGORY SELECTOR CARDS & TABS */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
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
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                      selectedCategory === 'All'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <CategoryIcon category="all" className="w-4 h-4" />
                    <span>All Sports</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedCategory === 'All' ? 'bg-amber-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {equipment.length}
                    </span>
                  </button>

                  {/* Dynamic Category Pills */}
                  {distinctCategories.map(cat => {
                    const meta = getCategoryMeta(cat);
                    const stats = getCategoryStats(cat);
                    const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                          isSelected
                            ? `${meta.accentBg} ${meta.color} ${meta.borderColor} ring-2 ring-blue-500/20 font-bold shadow-sm`
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <CategoryIcon category={cat} className={`w-4 h-4 ${isSelected ? meta.color : 'text-slate-500'}`} />
                        <span>{cat}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? `${meta.badgeBg} ${meta.badgeText}` : 'bg-slate-100 text-slate-600'
                        }`}>
                          {stats.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Category Information Banner & Kit Quick-Bundle */}
              {activeCategoryMeta && (
                <div className={`p-4 rounded-xl border ${activeCategoryMeta.accentBg} ${activeCategoryMeta.borderColor} mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs`}>
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-white border ${activeCategoryMeta.borderColor} flex items-center justify-center ${activeCategoryMeta.color} shadow-2xs shrink-0`}>
                      <CategoryIcon category={activeCategoryMeta.name} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{activeCategoryMeta.name} Equipment Set</h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${activeCategoryMeta.badgeBg} ${activeCategoryMeta.badgeText}`}>
                          {getCategoryStats(activeCategoryMeta.name).totalAvail} units in stock
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{activeCategoryMeta.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickBundleKit(activeCategoryMeta.name)}
                      className={`flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 border ${activeCategoryMeta.borderColor} ${activeCategoryMeta.color} rounded-lg text-xs font-bold transition shadow-2xs`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Quick Bundle {activeCategoryMeta.name} Kit</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Main Content Layout: Equipment Grid & Sticky Voucher Cart */}
              {submitSuccess ? (
                <div className="bg-white border border-green-200 rounded-xl p-12 flex flex-col items-center justify-center text-green-600 shadow-sm animate-fadeIn">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">Consolidated Borrow Request Submitted!</h3>
                  <p className="text-slate-500 text-sm text-center max-w-md">
                    Your multi-item voucher has been successfully submitted to the sports administrator. You can monitor the real-time approval status in your dashboard.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Left Column: Equipment Cards (Categorized Items) */}
                  <div className="flex-1 w-full">
                    {filteredEquipment.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
                        <Box className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <h4 className="font-bold text-slate-700 text-base">No Equipment Found</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          {searchQuery 
                            ? `No items match "${searchQuery}" in ${selectedCategory === 'All' ? 'any category' : selectedCategory}. Try clearing your search.`
                            : `There are currently no items registered in the ${selectedCategory} category.`
                          }
                        </p>
                        <button 
                          onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                          className="mt-4 px-4 py-2 bg-emerald-50 text-amber-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
                        >
                          View All Categories
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredEquipment.map(eq => {
                          const meta = getCategoryMeta(eq.category);
                          const inCart = cart.find(c => c.equipmentId === eq.id);
                          const inCartCount = inCart?.quantity || 0;
                          const availableToAdd = Math.max(0, eq.available - inCartCount);

                          return (
                            <div 
                              key={eq.id} 
                              className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition hover:shadow-sm ${
                                inCartCount > 0 
                                  ? 'border-amber-400 ring-1 ring-blue-400/30' 
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                {/* Category Badge and Available Count */}
                                <div className="flex justify-between items-start mb-2.5">
                                  <span className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${meta.badgeBg} ${meta.badgeText}`}>
                                    <CategoryIcon category={eq.category} className="w-3 h-3" />
                                    <span>{eq.category}</span>
                                  </span>

                                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                    eq.available > 0 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : eq.damaged > 0
                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                        : eq.inRepair > 0
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : eq.borrowed > 0
                                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                            : 'bg-slate-50 text-slate-700 border border-slate-200'
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
                                <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">
                                  {eq.name}
                                </h3>

                                {eq.description && (
                                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                    <span className="font-semibold text-slate-700">Details: </span>
                                    {eq.description}
                                  </p>
                                )}

                                {/* Equipment Location and Status */}
                                <div className="text-xs text-slate-500 space-y-2 mb-4">
                                  <div className="flex items-start space-x-2 bg-emerald-50 p-2 rounded-md border border-emerald-200">
                                    <span className="text-emerald-700 mt-0.5 text-sm">📍</span>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Facility / Exact Location</span>
                                      <span className="text-slate-900 font-bold text-sm leading-tight">{eq.location || 'Main Sports Storage'}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                                    <span>Total: {eq.total}</span>
                                    <span>•</span>
                                    <span>Borrowed: {eq.borrowed}</span>
                                    {eq.inRepair > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-amber-600">Repair: {eq.inRepair}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Footer */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <div>
                                  {inCartCount > 0 ? (
                                    <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{inCartCount} in voucher</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium">
                                      {eq.available > 0 ? 'Ready to borrow' : eq.damaged > 0 ? 'Currently damaged' : eq.inRepair > 0 ? 'Under maintenance' : eq.borrowed > 0 ? 'Currently borrowed' : 'Unavailable'}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {inCartCount > 0 && (
                                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const idx = cart.findIndex(c => c.equipmentId === eq.id);
                                          if (idx >= 0) updateCartQuantity(idx, inCartCount - 1);
                                        }}
                                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                                        title="Decrease quantity"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="px-2 text-xs font-bold text-slate-800">{inCartCount}</span>
                                      <button
                                        type="button"
                                        disabled={availableToAdd <= 0}
                                        onClick={() => addToCart(eq.id, 1)}
                                        className="p-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        title="Increase quantity"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    disabled={eq.available <= 0 || availableToAdd <= 0}
                                    onClick={() => addToCart(eq.id, 1)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                      eq.available <= 0
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : availableToAdd <= 0
                                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                          : inCartCount > 0
                                            ? 'bg-emerald-50 text-emerald-900 hover:bg-blue-100'
                                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-2xs'
                                    }`}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{inCartCount > 0 ? 'Add More' : 'Add Item'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Consolidated Voucher Cart Checkout Sidebar */}
                  <div className="w-full lg:w-[410px] shrink-0">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-6 shadow-xs">
                      {/* Cart Header */}
                      <div className="flex justify-between items-center pb-3.5 border-b border-slate-200 mb-4">
                        <div className="flex items-center space-x-2">
                          <ShoppingBag className="w-5 h-5 text-amber-600" />
                          <h3 className="font-bold text-slate-900 text-base">Consolidated Voucher</h3>
                        </div>
                        {cart.length > 0 && (
                          <button
                            type="button"
                            onClick={clearCart}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleBorrowSubmit} className="space-y-4">
                        {/* Cart Bundled Items List */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Bundled Gear ({cart.length} items • {totalCartUnits} units)
                            </span>
                          </div>

                          {cart.length === 0 ? (
                            <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/70">
                              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                              <p className="text-xs font-bold text-slate-600">Your voucher cart is empty</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Select items from any sport category above to bundle them into this request.
                              </p>
                            </div>
                          ) : (
                            <ul className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                              {cart.map((item, index) => {
                                const eq = equipment.find(e => e.id === item.equipmentId);
                                const meta = getCategoryMeta(eq?.category || 'Other');
                                const maxAvail = eq?.available || 1;

                                return (
                                  <li 
                                    key={item.equipmentId}
                                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2"
                                  >
                                    <div className="flex-1 min-w-0 pr-2">
                                      <div className="flex items-center space-x-1.5 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${meta.badgeBg} ${meta.badgeText}`}>
                                          {eq?.category}
                                        </span>
                                      </div>
                                      <div className="text-xs font-bold text-slate-900 truncate">
                                        {eq?.name || 'Equipment'}
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        Max available: {maxAvail}
                                      </div>
                                    </div>

                                    {/* Quantity Stepper and Delete */}
                                    <div className="flex items-center space-x-2 shrink-0">
                                      <div className="flex items-center border border-slate-200 bg-white rounded-lg shadow-2xs overflow-hidden">
                                        <button
                                          type="button"
                                          onClick={() => updateCartQuantity(index, item.quantity - 1)}
                                          className="p-1 hover:bg-slate-100 text-slate-600 transition"
                                          title="Decrease"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                                          {item.quantity}
                                        </span>
                                        <button
                                          type="button"
                                          disabled={item.quantity >= maxAvail}
                                          onClick={() => updateCartQuantity(index, item.quantity + 1)}
                                          className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                          title="Increase"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => removeFromCart(index)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition"
                                        title="Remove from bundle"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        {/* Request Details Form */}
                        <div className="space-y-3.5 pt-3 border-t border-slate-200">
                          {/* Intended Purpose */}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                              Intended Purpose
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. PE Class, Intramurals, Friendly Game"
                              value={purpose}
                              onChange={e => setPurpose(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                            {/* Fast Purpose Tags */}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['PE Class', 'Intramural Game', 'Varsity Practice', 'Tournament', 'Recreational'].map(tag => (
                                <button
                                  type="button"
                                  key={tag}
                                  onClick={() => setPurpose(tag)}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
                                    purpose === tag 
                                      ? 'bg-amber-600 text-white' 
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                Quick Schedule Presets
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              <button
                                type="button"
                                onClick={() => setQuickDates('2hours')}
                                className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded text-[10px] font-bold text-slate-600 transition"
                              >
                                +2 Hours
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuickDates('4hours')}
                                className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded text-[10px] font-bold text-slate-600 transition"
                              >
                                +4 Hours
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuickDates('endOfDay')}
                                className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded text-[10px] font-bold text-slate-600 transition"
                              >
                                End of Day
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuickDates('tomorrow')}
                                className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded text-[10px] font-bold text-slate-600 transition"
                              >
                                Tomorrow
                              </button>
                            </div>
                          </div>

                          {/* Pickup Date & Time */}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              <span>Pickup Date & Time</span>
                            </label>
                            <input
                              required
                              type="datetime-local"
                              value={pickupDate}
                              onChange={e => setPickupDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                          </div>

                          {/* Return Deadline */}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Return Deadline</span>
                            </label>
                            <input
                              required
                              type="datetime-local"
                              value={returnDate}
                              onChange={e => setReturnDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={cart.length === 0}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl mt-2 flex justify-center items-center space-x-2 transition shadow-sm"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            <span>Submit Consolidated Request ({totalCartUnits} items)</span>
                          </button>

                          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                            Submitting creates a single consolidated voucher for admin review. Real-time updates will alert you when approved.
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Voucher & Account Notifications</h2>
              <p className="text-slate-500 text-sm mb-6">Real-time alerts regarding registration status, request approvals, and return deadlines.</p>

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
                      className={`bg-white border-l-4 p-4 rounded-r-xl border border-slate-200 shadow-2xs ${
                        req.status === 'approved' 
                          ? 'border-l-emerald-500' 
                          : req.status === 'pending'
                            ? 'border-l-amber-500'
                            : req.status === 'declined'
                              ? 'border-l-red-500'
                              : 'border-l-blue-500'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
                        <div>
                          {req.status === 'pending' && <span className="text-amber-600">Borrow Voucher Submitted for Review</span>}
                          {req.status === 'approved' && <span className="text-emerald-600 flex items-center space-x-1.5"><Check className="w-4 h-4" /><span>Borrow Request Approved & Ready for Pickup!</span></span>}
                          {req.status === 'declined' && <span className="text-red-600">Borrow Request Declined</span>}
                          {req.status === 'return_pending' && <span className="text-amber-600">Return Process Initiated</span>}
                          {req.status === 'returned' && <span className="text-slate-600">Return Confirmed & Logged by Admin</span>}
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {new Date(req.requestDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Your request for <strong className="text-slate-800">{itemDescriptions}</strong> ({req.purpose}) {req.status === 'pending' ? 'is currently pending admin approval.' : `has been marked as ${req.status}.`} Pickup: {new Date(req.pickupDate).toLocaleString()} | Return: {new Date(req.returnDate).toLocaleString()}
                      </p>
                    </div>
                  );
                })}

                <div className="bg-white border-l-4 border-l-emerald-500 border border-slate-200 p-4 rounded-r-xl shadow-2xs">
                  <div className="font-bold text-emerald-700 text-sm mb-1">Account Registration Verified & Active</div>
                  <p className="text-slate-600 text-xs">
                    Welcome to Capiz State University Sports Equipment Management System. You are authenticated to file consolidated borrow requests across all sports categories.
                  </p>
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
      className={`flex items-center justify-between px-6 py-3 cursor-pointer border-l-4 transition text-sm font-semibold ${
        active 
          ? 'border-amber-600 bg-emerald-50/70 text-emerald-900' 
          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

function StatCard({ title, count, subtext, icon, color }: any) {
  return (
    <div className={`bg-white border-t-4 ${color} border border-slate-200 p-5 rounded-xl flex flex-col shadow-2xs`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] text-slate-500 font-bold tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{count}</div>
      <div className="text-xs text-slate-400">{subtext}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold">Pending</span>;
  if (status === 'approved') return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold">Approved</span>;
  if (status === 'overdue') return <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold">Overdue Returns</span>;
  if (status === 'declined') return <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold">Declined</span>;
  if (status === 'returned') return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold">Returned</span>;
  if (status === 'return_pending') return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold">Return Requested</span>;
  return null;
}
