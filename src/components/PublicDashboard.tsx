import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Box, Check, RefreshCw, Wrench, XCircle, Trophy, UserCircle, Search, Layers, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[#080e1e] text-slate-300 font-sans flex flex-col relative">
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-blue-900/50 bg-[#0b142a]/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center space-x-3 text-white font-bold text-lg">
          <div className="bg-yellow-400 p-1.5 rounded-lg text-blue-950 shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="font-display tracking-wider text-xl uppercase">CSU CapSu Sports Inventory</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView('login_borrower')}
            className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-5 py-2.5 rounded-lg font-bold text-sm transition shadow-md cursor-pointer"
          >
            <UserCircle className="w-5 h-5" />
            <span>Borrower Login Portal</span>
          </button>
          <button 
            onClick={() => setView('landing')}
            className="text-slate-400 hover:text-white px-4 py-2.5 border border-blue-900/60 hover:border-blue-700 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            &larr; Home
          </button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto w-full">
        {/* Subheader Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400 mb-6 border-b border-blue-900/40 pb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><span className="mr-1 text-yellow-400">📍</span> <strong>Location:</strong>&nbsp;CSU Mambusao Campus</span>
            <span className="flex items-center"><span className="mr-1 text-yellow-400">🕒</span> <strong>Clock:</strong>&nbsp;{dateStr} - {timeStr}</span>
          </div>
          <span className="inline-flex items-center text-xs font-bold text-yellow-300 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/30">
            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></span>
            Cloud Real-Time Sync Active
          </span>
        </div>

        {/* 6 Key KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 relative z-10">
          <StatCard onClick={() => setActiveOverlay('total')} title="TOTAL UNITS" count={totalUnits} subtext="Across all sports" icon={<Box className="w-6 h-6 text-slate-400" />} color="border-t-yellow-400" />
          <StatCard onClick={() => setActiveOverlay('available')} title="AVAILABLE ITEMS" count={availableUnits} subtext="Ready to borrow" icon={<Check className="w-6 h-6 text-emerald-400" />} color="border-t-emerald-400" />
          <StatCard onClick={() => setActiveOverlay('borrowed')} title="BORROWED" count={borrowedUnits} subtext="Currently out" icon={<RefreshCw className="w-6 h-6 text-blue-400" />} color="border-t-blue-400" />
          <StatCard onClick={() => setActiveOverlay('repair')} title="FOR REPAIR" count={forRepairUnits} subtext="Under maintenance" icon={<Wrench className="w-6 h-6 text-amber-400" />} color="border-t-amber-400" />
          <StatCard onClick={() => setActiveOverlay('damaged')} title="DAMAGED UNITS" count={damagedUnits} subtext="Unserviceable" icon={<XCircle className="w-6 h-6 text-red-400" />} color="border-t-red-400" />
          <StatCard onClick={() => setActiveOverlay('sports')} title="SPORTS TRACKS" count={sportsTracksCount} subtext="Active sports" icon={<Trophy className="w-6 h-6 text-yellow-400" />} color="border-t-yellow-400" />
        </div>

        {activeOverlay && (
          <div className="absolute left-6 right-6 top-[220px] bg-[#101b38] border border-blue-800 rounded-xl shadow-2xl z-50 p-6">
            <ActiveLogsOverlay type={activeOverlay} onClose={() => setActiveOverlay(null)} equipment={equipment} requests={requests} users={users} />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-display uppercase tracking-wide">Categorized Sports Equipment</h2>
            <p className="text-sm text-slate-400 mt-1">Filter sports categories to view available sets and equipment items</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search equipment or sport..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0e172e] border border-blue-900/60 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition"
            />
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-yellow-400 text-blue-950 shadow-md'
                : 'bg-[#101b38] text-slate-300 border border-blue-900/60 hover:bg-[#14234a]'
            }`}
          >
            <CategoryIcon category="all" className="w-4 h-4" />
            <span>All Sports ({equipment.length})</span>
          </button>
          {distinctCategories.map(cat => {
            const isSel = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = equipment.filter(e => e.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
                  isSel
                    ? 'bg-yellow-400 text-blue-950 shadow-md border-transparent'
                    : 'bg-[#101b38] text-slate-300 border border-blue-900/60 hover:bg-[#14234a]'
                }`}
              >
                <CategoryIcon category={cat} className={`w-4 h-4 ${isSel ? 'text-blue-950' : 'text-yellow-400'}`} />
                <span>{cat} ({count})</span>
              </button>
            );
          })}
        </div>
        
        {/* Table of Equipment */}
        <div className="bg-[#101b38] rounded-xl overflow-hidden border border-blue-900/60 shadow-md overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0c142a] text-slate-400 text-xs uppercase tracking-wider border-b border-blue-900/60">
              <tr>
                <th className="px-6 py-4 font-bold">Equipment Name</th>
                <th className="px-6 py-4 font-bold">Location</th>
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
            <tbody className="divide-y divide-blue-900/30">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                    No equipment found in {selectedCategory === 'All' ? 'inventory' : selectedCategory}.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((eq) => {
                  return (
                    <tr key={eq.id} className="hover:bg-blue-900/20 transition">
                      <td className="px-6 py-4 font-medium">
                        <span className="text-white font-bold text-base">{eq.name}</span>
                        {eq.description && (
                          <div className="text-xs text-slate-300 mt-1.5 leading-snug max-w-xs">
                            <span className="font-semibold text-slate-400">Details: </span>
                            {eq.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-slate-200 bg-[#0a1122] px-2.5 py-1 rounded border border-blue-900/50 w-max">
                          <span className="text-xs text-yellow-400">📍</span>
                          <span className="font-bold text-xs whitespace-nowrap">{eq.location || 'Main Storage'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                          <CategoryIcon category={eq.category} className="w-3.5 h-3.5 text-yellow-400" />
                          <span>{eq.category}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-white text-base">{eq.total}</td>
                      <td className="px-6 py-4 text-center text-yellow-400 font-bold text-base">{eq.available}</td>
                      <td className="px-6 py-4 text-center text-blue-300 font-semibold">{eq.borrowed}</td>
                      <td className="px-6 py-4 text-center text-amber-400 font-semibold">{eq.inRepair}</td>
                      <td className="px-6 py-4 text-center text-red-400 font-semibold">{eq.damaged}</td>
                      <td className="px-6 py-4 text-center">
                        {eq.available > 0 ? (
                          <span className="text-xs font-bold text-yellow-300 bg-yellow-400/15 border border-yellow-400/40 px-3 py-1.5 rounded-full shadow-xs">Available</span>
                        ) : eq.damaged > 0 ? (
                          <span className="text-xs font-bold text-red-300 bg-red-950/70 border border-red-700/60 px-3 py-1.5 rounded-full shadow-xs">Damaged</span>
                        ) : eq.inRepair > 0 ? (
                          <span className="text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-700/60 px-3 py-1.5 rounded-full shadow-xs">In Repair</span>
                        ) : eq.borrowed > 0 ? (
                          <span className="text-xs font-bold text-blue-300 bg-blue-950/80 border border-blue-700/60 px-3 py-1.5 rounded-full shadow-xs">Borrowed</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full shadow-xs">Out of Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400 text-xs font-medium">{eq.lastChecked || 'N/A'}</td>
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
      className={`bg-[#101b38] border-t-4 ${color} border border-blue-900/60 p-5 rounded-xl shadow-md flex flex-col ${onClick ? 'cursor-pointer hover:border-yellow-400/60 hover:-translate-y-1 transition-all duration-200' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-4xl font-extrabold text-white mb-1 font-display">{count}</div>
      <div className="text-sm text-slate-400 font-medium mb-4">{subtext}</div>
      {onClick && (
        <div className="mt-auto flex items-center space-x-1.5 text-xs font-bold text-yellow-400">
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
    <div className="flex flex-col max-h-[500px] text-slate-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3 font-display uppercase tracking-wide">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span>{title}</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">Detailed inventory records matching current filter parameters.</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-2 bg-[#0a1122] hover:bg-blue-900/50 rounded-full transition cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 border border-blue-900/60 rounded-lg shadow-inner bg-[#0a1122]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0e172e] text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-blue-900/50">
            <tr>
              {columns.map(c => <th key={c} className="px-6 py-4 font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/30 bg-[#101b38]">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-blue-900/20 transition">
                <td className="px-6 py-4 font-bold text-white">{row.col1}</td>
                <td className="px-6 py-4 text-slate-300 font-medium">{row.col2}</td>
                <td className="px-6 py-4 font-semibold text-yellow-400">{row.col3}</td>
                {columns.length > 3 && (
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${row.isAvailable ? 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{row.col4}</span>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 font-medium">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-8 py-3 rounded-lg text-sm transition shadow-md cursor-pointer">
          Close Panel
        </button>
      </div>
    </div>
  );
}
