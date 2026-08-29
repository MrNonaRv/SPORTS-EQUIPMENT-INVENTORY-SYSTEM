import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Box, Check, RefreshCw, Wrench, XCircle, Trophy, UserCircle, Search, Layers } from 'lucide-react';
import { getCategoryMeta } from '../data/categoryData';
import { CategoryIcon } from './CategoryIcon';

export default function PublicDashboard() {
  const { equipment, setView, requests, users } = useAppContext();
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const distinctCategories = useMemo(() => {
    return Array.from(new Set(equipment.map(e => e.category))).filter((cat): cat is string => Boolean(cat));
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchCat = selectedCategory === 'All' || eq.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = searchQuery.trim() === '' || 
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [equipment, selectedCategory, searchQuery]);

  const totalUnits = filteredEquipment.reduce((acc, eq) => acc + eq.total, 0);
  const availableUnits = filteredEquipment.reduce((acc, eq) => acc + eq.available, 0);
  const borrowedUnits = filteredEquipment.reduce((acc, eq) => acc + eq.borrowed, 0);
  const forRepairUnits = filteredEquipment.reduce((acc, eq) => acc + eq.inRepair, 0);
  const damagedUnits = filteredEquipment.reduce((acc, eq) => acc + eq.damaged, 0);

  const sportsTracksCount = distinctCategories.length;

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative">
      <header className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3 text-emerald-900 font-semibold text-lg">
          <div className="bg-amber-600 p-1.5 rounded-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span>CSU Sports Inventory</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView('login_borrower')}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition shadow-md"
          >
            <UserCircle className="w-5 h-5" />
            <span>Borrower Login Portal</span>
          </button>
          <button 
            onClick={() => setView('landing')}
            className="text-slate-500 hover:text-slate-900 px-4 py-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-sm font-semibold transition"
          >
            &larr; Home
          </button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 mb-6 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><span className="mr-1">📍</span> <strong>Location:</strong>&nbsp;CSU Mambusao Campus</span>
            <span className="flex items-center"><span className="mr-1">🕒</span> <strong>Clock:</strong>&nbsp;{dateStr} - {timeStr}</span>
          </div>
          <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2 animate-pulse"></span>
            Cloud Real-Time Sync Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 relative z-10">
          <StatCard onClick={() => setActiveOverlay('total')} title="TOTAL UNITS" count={totalUnits} subtext="Across all sports" icon={<Box className="w-6 h-6 text-slate-400" />} color="border-slate-300" />
          <StatCard onClick={() => setActiveOverlay('available')} title="AVAILABLE ITEMS" count={availableUnits} subtext="Ready to borrow" icon={<Check className="w-6 h-6 text-emerald-500" />} color="border-emerald-500" />
          <StatCard onClick={() => setActiveOverlay('borrowed')} title="BORROWED" count={borrowedUnits} subtext="Currently out" icon={<RefreshCw className="w-6 h-6 text-amber-500" />} color="border-blue-500" />
          <StatCard onClick={() => setActiveOverlay('repair')} title="FOR REPAIR" count={forRepairUnits} subtext="Under maintenance" icon={<Wrench className="w-6 h-6 text-amber-500" />} color="border-amber-500" />
          <StatCard onClick={() => setActiveOverlay('damaged')} title="DAMAGED UNITS" count={damagedUnits} subtext="Unserviceable" icon={<XCircle className="w-6 h-6 text-red-500" />} color="border-red-500" />
          <StatCard onClick={() => setActiveOverlay('sports')} title="SPORTS TRACKS" count={sportsTracksCount} subtext="Active sports" icon={<Trophy className="w-6 h-6 text-indigo-500" />} color="border-indigo-500" />
        </div>

        {activeOverlay && (
          <div className="absolute left-6 right-6 top-[220px] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-6">
            <ActiveLogsOverlay type={activeOverlay} onClose={() => setActiveOverlay(null)} equipment={equipment} requests={requests} users={users} />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">Categorized Sports Equipment</h2>
            <p className="text-sm text-slate-500 mt-1">Filter sports categories to view available sets and equipment items</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search equipment or sport..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition shadow-sm"
            />
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex items-center space-x-2 ${
              selectedCategory === 'All'
                ? 'bg-emerald-900 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
            }`}
          >
            <CategoryIcon category="all" className="w-4 h-4" />
            <span>All Sports ({equipment.length})</span>
          </button>
          {distinctCategories.map(cat => {
            const meta = getCategoryMeta(cat);
            const isSel = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = equipment.filter(e => e.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                  isSel
                    ? `bg-emerald-900 text-white shadow-md border-transparent`
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                }`}
              >
                <CategoryIcon category={cat} className={`w-4 h-4 ${isSel ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{cat} ({count})</span>
              </button>
            );
          })}
        </div>
        
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Equipment Name</th>
                <th className="px-6 py-4 font-bold">Sport Category</th>
                <th className="px-6 py-4 font-bold text-center">Total Units</th>
                <th className="px-6 py-4 font-bold text-center">Available</th>
                <th className="px-6 py-4 font-bold text-center">Borrowed</th>
                <th className="px-6 py-4 font-bold text-center">In Repair</th>
                <th className="px-6 py-4 font-bold text-center">Damaged</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-center">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 text-sm font-medium bg-slate-50">
                    No equipment found in {selectedCategory === 'All' ? 'inventory' : selectedCategory}.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((eq) => {
                  const meta = getCategoryMeta(eq.category);
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium">
                        <span className="text-slate-900 font-bold text-base">{eq.name}</span>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{eq.location || 'Main Storage'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200`}>
                          <CategoryIcon category={eq.category} className="w-3.5 h-3.5" />
                          <span>{eq.category}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900 text-base">{eq.total}</td>
                      <td className="px-6 py-4 text-center text-emerald-700 font-bold text-base">{eq.available}</td>
                      <td className="px-6 py-4 text-center text-emerald-900 font-semibold">{eq.borrowed}</td>
                      <td className="px-6 py-4 text-center text-amber-700 font-semibold">{eq.inRepair}</td>
                      <td className="px-6 py-4 text-center text-red-700 font-semibold">{eq.damaged}</td>
                      <td className="px-6 py-4 text-center">
                        {eq.available > 0 ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full shadow-sm">Available</span>
                        ) : eq.damaged > 0 ? (
                          <span className="text-xs font-bold text-red-800 bg-red-100 border border-red-300 px-3 py-1.5 rounded-full shadow-sm">Damaged</span>
                        ) : eq.inRepair > 0 ? (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full shadow-sm">In Repair</span>
                        ) : eq.borrowed > 0 ? (
                          <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-emerald-300 px-3 py-1.5 rounded-full shadow-sm">Borrowed</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-full shadow-sm">Out of Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 text-xs font-medium">{eq.lastChecked || 'N/A'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, subtext, icon, color, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border-t-4 ${color} p-5 rounded-xl shadow-sm flex flex-col ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-4xl font-extrabold text-slate-900 mb-1">{count}</div>
      <div className="text-sm text-slate-500 font-medium mb-4">{subtext}</div>
      {onClick && (
        <div className="mt-auto flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
    <div className="flex flex-col max-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-emerald-900 flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>{title}</span>
          </h3>
          <p className="text-slate-500 text-sm mt-1">Detailed inventory records matching current filter parameters.</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="overflow-y-auto flex-1 border border-slate-200 rounded-lg shadow-inner bg-slate-50">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-200 text-slate-700 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              {columns.map(c => <th key={c} className="px-6 py-4 font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-900">{row.col1}</td>
                <td className="px-6 py-4 text-slate-600 font-medium">{row.col2}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{row.col3}</td>
                {columns.length > 3 && (
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${row.isAvailable ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700 border border-slate-300'}`}>{row.col4}</span>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-8 py-3 rounded-lg text-sm transition shadow-md">
          Close Panel
        </button>
      </div>
    </div>
  );
}
