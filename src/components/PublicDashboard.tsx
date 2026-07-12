import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Box, Check, RefreshCw, Wrench, XCircle, Trophy, UserCircle } from 'lucide-react';

export default function PublicDashboard() {
  const { equipment, setView, requests, users } = useAppContext();
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalUnits = equipment.reduce((acc, eq) => acc + eq.total, 0);
  const availableUnits = equipment.reduce((acc, eq) => acc + eq.available, 0);
  const borrowedUnits = equipment.reduce((acc, eq) => acc + eq.borrowed, 0);
  const forRepairUnits = equipment.reduce((acc, eq) => acc + eq.inRepair, 0);
  const damagedUnits = equipment.reduce((acc, eq) => acc + eq.damaged, 0);
  
  const sportsTracksCount = new Set(equipment.map(e => e.category)).size;

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative">
      <header className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3 text-blue-700 font-semibold">
          <Trophy className="w-5 h-5 text-slate-900" />
          <span>CSU Sports Inventory - Public Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView('login_borrower')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            <UserCircle className="w-4 h-4" />
            <span>Borrower Login</span>
          </button>
          <button 
            onClick={() => setView('landing')}
            className="text-slate-500 hover:text-slate-900 px-3 py-1 border border-slate-300 rounded text-sm transition"
          >
            &larr; Home
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="flex items-center space-x-6 text-sm text-slate-500 mb-6 border-b border-slate-200 pb-4">
          <span>📍 Location: Mambusao Campus</span>
          <span>🕒 Clock: {dateStr} - {timeStr}</span>
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
          <div className="absolute left-6 right-6 top-[220px] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-6">
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
    </div>
  );
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
