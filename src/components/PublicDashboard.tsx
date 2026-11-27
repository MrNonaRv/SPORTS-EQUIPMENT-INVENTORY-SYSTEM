import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Box, Check, RefreshCw, Wrench, XCircle, Trophy, UserCircle, Search, Layers, X, Sun, Moon } from 'lucide-react';
import { getCategoryMeta } from '../data/categoryData';
import { CategoryIcon } from './CategoryIcon';

export default function PublicDashboard() {
  const { equipment, setView, requests, users, theme, toggleTheme } = useAppContext();
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
    const q = searchQuery.trim().toLowerCase();
    return equipment.filter(eq => {
      const matchCat = selectedCategory === 'All' || eq.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = q === '' || 
        eq.name.toLowerCase().includes(q) || 
        eq.category.toLowerCase().includes(q) ||
        (eq.equipmentCode && eq.equipmentCode.toLowerCase().includes(q)) ||
        (eq.equipmentCodes && eq.equipmentCodes.some(c => c.toLowerCase().includes(q)));
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

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-[#0a1c38]' : 'bg-[#0a1c38] text-slate-300'} font-sans flex flex-col relative`}>
      {/* Top Header: CapSU Royal Blue with Yellow Accent Border */}
      <header className={`flex justify-between items-center px-6 py-4 border-b-4 border-yellow-400 ${isLight ? 'bg-white text-[#0a1c38] border-b border-slate-200' : 'bg-[#07152b]/95 text-white'} backdrop-blur-md shadow-md`}>
        <div className={`flex items-center space-x-3 font-bold text-lg ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>
          <img src="/capsu-logo.png" alt="CapSU Logo" className="w-9 h-9 rounded-full object-cover border-2 border-yellow-400 shadow-md" />
          <div>
            <span className={`font-display tracking-wider text-xl uppercase font-bold ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>CAPSU SPORTS INVENTORY</span>
            <span className={`hidden sm:inline-block ml-3 text-xs font-semibold px-2.5 py-0.5 rounded-full ${isLight ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-blue-900/80 text-yellow-300 border border-yellow-400/30'}`}>
              Capiz State University
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg ${isLight ? 'bg-slate-100 text-[#0a1c38] border border-slate-300 hover:bg-slate-200' : 'bg-blue-900/60 text-yellow-400 border border-blue-500/40 hover:bg-blue-800'} transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-[#0a1c38]" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button 
            onClick={() => setView('login_borrower')}
            className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-5 py-2.5 rounded-lg font-bold text-sm transition shadow-md cursor-pointer"
          >
            <UserCircle className="w-5 h-5" />
            <span>Borrower Login Portal</span>
          </button>
          <button 
            onClick={() => setView('landing')}
            className={`${isLight ? 'text-[#0a1c38] hover:text-black border-slate-300 hover:border-yellow-500' : 'text-slate-300 hover:text-white border-blue-500/40 hover:border-yellow-400'} px-4 py-2.5 border rounded-lg text-sm font-semibold transition cursor-pointer`}
          >
            &larr; Home
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Subheader Metadata */}
        <div className={`flex flex-wrap items-center justify-between gap-4 text-sm mb-6 border-b pb-4 ${isLight ? 'text-[#0a1c38] border-slate-200' : 'text-slate-300 border-blue-700/40'}`}>
          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
            <span className="flex items-center"><span className="mr-1 text-yellow-500">📍</span> <strong className={isLight ? 'text-[#0a1c38]' : 'text-slate-200'}>Location:</strong>&nbsp;<span className={isLight ? 'text-[#0a1c38]' : 'text-slate-300'}>CapSu Mambusao Campus</span></span>
            <span className="flex items-center"><span className="mr-1 text-yellow-500">🕒</span> <strong className={isLight ? 'text-[#0a1c38]' : 'text-slate-200'}>Clock:</strong>&nbsp;<span className={isLight ? 'text-[#0a1c38]' : 'text-slate-300'}>{dateStr} - {timeStr}</span></span>
          </div>
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${isLight ? 'text-blue-900 bg-blue-50 border-blue-200' : 'text-yellow-300 bg-yellow-400/15 border-yellow-400/40'}`}>
            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></span>
            Cloud Real-Time Sync Active
          </span>
        </div>

        {/* 6 Key KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 relative z-10">
          <StatCard isLight={isLight} onClick={() => setActiveOverlay('total')} title="TOTAL UNITS" count={totalUnits} subtext="Across all sports" icon={<Box className={`w-6 h-6 ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`} />} color="border-t-yellow-400" />
          <StatCard isLight={isLight} onClick={() => setActiveOverlay('available')} title="AVAILABLE ITEMS" count={availableUnits} subtext="Ready to borrow" icon={<Check className="w-6 h-6 text-yellow-500" />} color="border-t-yellow-400" />
          <StatCard isLight={isLight} onClick={() => setActiveOverlay('borrowed')} title="BORROWED" count={borrowedUnits} subtext="Currently out" icon={<RefreshCw className={`w-6 h-6 ${isLight ? 'text-blue-700' : 'text-blue-300'}`} />} color="border-t-blue-400" />
          <StatCard isLight={isLight} onClick={() => setActiveOverlay('repair')} title="FOR REPAIR" count={forRepairUnits} subtext="Under maintenance" icon={<Wrench className="w-6 h-6 text-amber-500" />} color="border-t-amber-400" />
          <StatCard isLight={isLight} onClick={() => setActiveOverlay('damaged')} title="DAMAGED UNITS" count={damagedUnits} subtext="Unserviceable" icon={<XCircle className="w-6 h-6 text-red-500" />} color="border-t-red-400" />
          <StatCard isLight={isLight} onClick={() => setActiveOverlay('sports')} title="SPORTS TRACKS" count={sportsTracksCount} subtext="Active sports" icon={<Trophy className="w-6 h-6 text-yellow-500" />} color="border-t-yellow-400" />
        </div>

        {activeOverlay && (
          <div className={`absolute left-4 right-4 sm:left-6 sm:right-6 top-[220px] ${isLight ? 'bg-white text-[#0a1c38] border-2 border-yellow-500' : 'bg-[#0e264c] text-white border-2 border-yellow-400'} rounded-xl shadow-2xl z-50 p-6`}>
            <ActiveLogsOverlay type={activeOverlay} onClose={() => setActiveOverlay(null)} equipment={equipment} requests={requests} users={users} isLight={isLight} />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-8">
          <div>
            <h2 className={`text-2xl font-bold font-display uppercase tracking-wide ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>Categorized Sports Equipment</h2>
            <p className={`text-sm mt-1 ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>Filter sports categories to view available sets and equipment items</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search equipment or sport..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 ${isLight ? 'bg-white border-slate-300 text-[#0a1c38] placeholder-slate-400' : 'bg-[#07172f] border-blue-500/40 text-slate-100 placeholder-slate-400'} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition`}
            />
          </div>
        </div>

        {/* Layout with Vertical Category Sidebar on the Side */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Vertical Category Sidebar on the Side */}
          <div className={`lg:col-span-1 ${isLight ? 'bg-white border-slate-200 text-[#0a1c38]' : 'bg-[#0e264c] border-blue-600/40 text-white'} border rounded-xl p-4 shadow-lg space-y-2 h-max sticky top-6`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-2 ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>
              <Layers className="w-4 h-4 text-yellow-500" />
              <span>Sports Categories</span>
            </div>
            
            <button
              onClick={() => setSelectedCategory('All')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-yellow-400 text-blue-950 shadow-md font-extrabold'
                  : isLight ? 'bg-slate-50 text-[#0a1c38] hover:bg-slate-100 border border-slate-200' : 'bg-[#07172f] text-slate-300 hover:bg-blue-800/40 hover:text-white border border-blue-600/30'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CategoryIcon category="all" className="w-4 h-4" />
                <span>All Sports</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                selectedCategory === 'All' ? 'bg-blue-950 text-yellow-300' : isLight ? 'bg-slate-200 text-[#0a1c38]' : 'bg-blue-950/60 text-yellow-400'
              }`}>
                {equipment.length}
              </span>
            </button>

            {distinctCategories.map(cat => {
              const isSel = selectedCategory.toLowerCase() === cat.toLowerCase();
              const count = equipment.filter(e => e.category.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                    isSel
                      ? 'bg-yellow-400 text-blue-950 shadow-md font-extrabold'
                      : isLight ? 'bg-slate-50 text-[#0a1c38] hover:bg-slate-100 border border-slate-200' : 'bg-[#07172f] text-slate-300 hover:bg-blue-800/40 hover:text-white border border-blue-600/30'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CategoryIcon category={cat} className={`w-4 h-4 ${isSel ? 'text-blue-950' : 'text-yellow-500'}`} />
                    <span className="truncate">{cat}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isSel ? 'bg-blue-950 text-yellow-300' : isLight ? 'bg-slate-200 text-[#0a1c38]' : 'bg-blue-950/60 text-yellow-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Equipment Table on the Right */}
          <div className="lg:col-span-3 space-y-4">
            <div className={`rounded-xl overflow-hidden border shadow-lg overflow-x-auto ${isLight ? 'bg-white border-slate-200' : 'bg-[#0e264c] border-blue-600/40'}`}>
              <table className="w-full text-left text-sm">
                <thead className={`${isLight ? 'bg-slate-100 text-[#0a1c38] border-b border-slate-200' : 'bg-[#07152b] text-slate-300 border-b border-blue-600/40'} text-xs uppercase tracking-wider`}>
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
                <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-blue-700/30'}`}>
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={10} className={`px-6 py-12 text-center text-sm font-medium ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>
                    No equipment found in {selectedCategory === 'All' ? 'inventory' : selectedCategory}.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((eq) => {
                  return (
                    <tr key={eq.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-blue-800/30'}`}>
                      <td className="px-6 py-4 font-medium">
                        <span className={`font-bold text-base ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>{eq.name}</span>
                        {eq.description && (
                          <div className={`text-xs mt-1.5 leading-snug max-w-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                            <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Details: </span>
                            {eq.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border w-max ${isLight ? 'bg-slate-50 text-[#0a1c38] border-slate-200' : 'bg-[#07172f] text-slate-300 border-blue-500/40'}`}>
                          <span className="text-xs text-yellow-500">📍</span>
                          <span className="font-bold text-xs whitespace-nowrap">{eq.location || 'Main Storage'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full border ${isLight ? 'bg-blue-50 text-blue-950 border-blue-200' : 'bg-blue-950/80 text-yellow-300 border-blue-600/50'}`}>
                          <CategoryIcon category={eq.category} className="w-3.5 h-3.5 text-yellow-500" />
                          <span>{eq.category}</span>
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-center font-bold text-base ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>{eq.total}</td>
                      <td className="px-6 py-4 text-center text-yellow-600 font-extrabold text-base">{eq.available}</td>
                      <td className={`px-6 py-4 text-center font-semibold ${isLight ? 'text-blue-900' : 'text-blue-200'}`}>{eq.borrowed}</td>
                      <td className="px-6 py-4 text-center text-amber-600 font-semibold">{eq.inRepair}</td>
                      <td className="px-6 py-4 text-center text-red-600 font-semibold">{eq.damaged}</td>
                      <td className="px-6 py-4 text-center">
                        {eq.available > 0 ? (
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-xs border ${isLight ? 'text-emerald-900 bg-emerald-50 border-emerald-200' : 'text-yellow-300 bg-yellow-400/20 border-yellow-400/50'}`}>Available</span>
                        ) : eq.damaged > 0 ? (
                          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full shadow-xs">Damaged</span>
                        ) : eq.inRepair > 0 ? (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shadow-xs">In Repair</span>
                        ) : eq.borrowed > 0 ? (
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full shadow-xs">Borrowed</span>
                        ) : (
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-xs border ${isLight ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-slate-300 bg-slate-800/80 border-slate-700'}`}>Out of Stock</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-center text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{eq.lastChecked || 'N/A'}</td>
                    </tr>
                  );
                })
              )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, subtext, icon, color, onClick, isLight }: any) {
  return (
    <div 
      onClick={onClick}
      className={`${isLight ? 'bg-white text-[#0a1c38] border border-slate-300 shadow-sm' : 'bg-[#0e264c] text-white border border-blue-600/30'} border-t-4 ${color} p-5 rounded-xl shadow-md flex flex-col ${onClick ? 'cursor-pointer hover:border-yellow-400/70 hover:-translate-y-1 transition-all duration-200' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold tracking-widest uppercase ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>{title}</span>
        {icon}
      </div>
      <div className={`text-4xl font-extrabold mb-1 font-display tracking-tight ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>{count}</div>
      <div className={`text-sm font-medium mb-4 ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>{subtext}</div>
      {onClick && (
        <div className="mt-auto flex items-center space-x-1.5 text-xs font-bold text-yellow-600">
          <Search className="w-3.5 h-3.5" />
          <span>View Details</span>
        </div>
      )}
    </div>
  );
}

function ActiveLogsOverlay({ type, onClose, equipment, requests, users, isLight }: any) {
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
      const reqItems = r.items && r.items.length > 0 ? r.items : [{ equipmentId: r.equipmentId, quantity: r.quantity }];
      const itemsLabel = reqItems.map((it: any) => {
        const eq = equipment.find((e: any) => e.id === it.equipmentId);
        return `${it.quantity}× ${eq?.name || 'Item'}`;
      }).join(', ');
      return {
        col1: `${u?.name || r.userId} (${u?.role || 'borrower'})`,
        col2: itemsLabel,
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
    <div className={`flex flex-col max-h-[500px] ${isLight ? 'text-[#0a1c38]' : 'text-slate-300'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`text-2xl font-bold ${isLight ? 'text-[#0a1c38]' : 'text-white'} flex items-center space-x-3 font-display uppercase tracking-wide`}>
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>{title}</span>
          </h3>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Detailed inventory records matching current filter parameters.</p>
        </div>
        <button onClick={onClose} className={`${isLight ? 'text-[#0a1c38] bg-slate-100 hover:bg-slate-200 border border-slate-300' : 'text-slate-300 hover:text-white bg-[#07172f] hover:bg-blue-800/50'} p-2 rounded-full transition cursor-pointer`}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className={`overflow-y-auto flex-1 border ${isLight ? 'border-slate-300 bg-white' : 'border-blue-600/40 bg-[#07172f]'} rounded-lg shadow-inner`}>
        <table className="w-full text-left text-sm">
          <thead className={`${isLight ? 'bg-slate-100 text-[#0a1c38] border-slate-300' : 'bg-[#07152b] text-slate-300 border-blue-600/40'} text-xs uppercase tracking-wider sticky top-0 z-10 border-b`}>
            <tr>
              {columns.map(c => <th key={c} className="px-6 py-4 font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 bg-white' : 'divide-blue-700/30 bg-[#0e264c]'}`}>
            {data.map((row, i) => (
              <tr key={i} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-blue-800/30'} transition`}>
                <td className={`px-6 py-4 font-bold ${isLight ? 'text-[#0a1c38]' : 'text-white'}`}>{row.col1}</td>
                <td className={`px-6 py-4 ${isLight ? 'text-slate-700' : 'text-slate-300'} font-medium`}>{row.col2}</td>
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-blue-900' : 'text-yellow-400'}`}>{row.col3}</td>
                {columns.length > 3 && (
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${row.isAvailable ? (isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50') : (isLight ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-slate-800/80 text-slate-300 border border-slate-700')}`}>{row.col4}</span>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={columns.length} className={`px-6 py-12 text-center font-medium ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>No records found.</td></tr>
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
