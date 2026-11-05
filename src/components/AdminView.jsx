import React, { useEffect, useState } from 'react';
import { subscribeBookings, addBooking, setBookingStatus, removeBooking } from '../firebase';
import {
  PawIcon, ArrowRight, CloseIcon, CheckIcon, CalendarIcon,
  ChartIcon, ClipboardIcon, ScissorsIcon, TrendUpIcon, WalletIcon, ReceiptIcon
} from './ui';

export const STATUSES = [
  { key: 'waiting', label: 'Waiting', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'checked-in', label: 'Checked in', badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' },
  { key: 'bathing', label: 'Bathing', badgeClass: 'bg-sky-100 text-sky-800 border-sky-200' },
  { key: 'styling', label: 'Styling', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  { key: 'ready', label: 'Ready for pickup', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'completed', label: 'Completed', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'cancelled', label: 'Cancelled', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200' },
];

const CATALOG_SERVICES = [
  { name: 'The Full Groom', category: 'Grooming', price: 570 },
  { name: 'Half-day daycare', category: 'Daycare', price: 200 },
  { name: 'The Tidy Up', category: 'Grooming', price: 500 },
  { name: 'Teeth Brushing', category: 'Add-on', price: 70 },
  { name: 'The Freshen Up', category: 'Grooming', price: 400 },
];

export default function AdminView({ adminName = 'Admin' }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'bookings', 'services', 'reports'
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showToast, setShowToast] = useState(true);

  // Walk-in form state
  const [newDogName, setNewDogName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [newService, setNewService] = useState('The Full Groom');
  const [newPrice, setNewPrice] = useState(570);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeBookings(
      (list) => {
        setError('');
        setBookings(list || []);
      },
      (err) => {
        console.error("Firebase booking subscription error:", err);
        setError("Unable to load real-time bookings. Please check Firebase rules.");
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await setBookingStatus(bookingId, newStatus, adminName);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleRemoveBooking = async (bookingId, dogName) => {
    if (window.confirm(`Are you sure you want to remove ${dogName}'s booking?`)) {
      try {
        await removeBooking(bookingId);
      } catch (err) {
        alert("Failed to remove booking: " + err.message);
      }
    }
  };

  const handleAddWalkIn = async (e) => {
    e.preventDefault();
    if (!newDogName.trim() || !newOwnerName.trim()) {
      alert("Please enter dog and owner names.");
      return;
    }
    setIsSubmitting(true);
    const bookingPayload = {
      bookingCode: `ORD-POS${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newOwnerName.trim(),
      dogName: newDogName.trim(),
      breed: newBreed.trim() || 'Dog',
      service: newService,
      totalAmount: Number(newPrice) || 570,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      status: 'waiting',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await addBooking(bookingPayload);
      setIsSubmitting(false);
      setShowCheckInModal(false);
      setNewDogName('');
      setNewOwnerName('');
      setNewBreed('');
    } catch (err) {
      setIsSubmitting(false);
      alert("Error adding booking: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC CALCULATIONS DRIVEN SOLELY BY FIREBASE BOOKINGS DATA
  // -------------------------------------------------------------
  const rawBookings = bookings || [];
  const filteredBookings = rawBookings;

  // Non-cancelled appointments for revenue metrics
  const validBookings = filteredBookings.filter((b) => b.status !== 'cancelled');

  // Total Sales Revenue
  const totalSales = validBookings.reduce((sum, b) => {
    const val = Number(b.totalAmount ?? b.subtotal ?? 0);
    return sum + val;
  }, 0);

  // Total Appointments Count
  const totalOrdersCount = filteredBookings.length;

  // Average Order Value
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  // Dynamic Service Sales Counts
  const serviceSalesList = CATALOG_SERVICES.map((svc) => {
    const count = validBookings.filter((b) =>
      b.service && b.service.toLowerCase().includes(svc.name.toLowerCase())
    ).length;
    return { ...svc, salesCount: count };
  }).sort((a, b) => b.salesCount - a.salesCount);

  const maxSalesCount = Math.max(...serviceSalesList.map((s) => s.salesCount), 1);

  // Dynamic 7-Day Graph Points Calculation
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ isoDate, day: label });
    }
    return days;
  };

  const days7 = getLast7Days();

  const chartPoints = days7.map((d) => {
    const dailyTotal = validBookings
      .filter((b) => {
        if (b.visitDate === d.isoDate) return true;
        if (b.createdAt) {
          const createdIso = new Date(b.createdAt).toISOString().split('T')[0];
          if (createdIso === d.isoDate) return true;
        }
        return false;
      })
      .reduce((sum, b) => sum + Number(b.totalAmount ?? b.subtotal ?? 0), 0);
    return { day: d.day, val: dailyTotal };
  });

  const maxValInPeriod = Math.max(...chartPoints.map((p) => p.val), 500);

  const pointsWithXY = chartPoints.map((pt, i) => {
    const x = (i / (chartPoints.length - 1)) * 720;
    const y = 155 - (pt.val / maxValInPeriod) * 135;
    return { ...pt, x, y };
  });

  const svgPathD = pointsWithXY.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const svgAreaD = `${svgPathD} L 720 160 L 0 160 Z`;

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#2c3228] flex font-sans">
      {/* LEFT SIDEBAR - Dashboard Nav (Dashboard, Bookings, Services, Reports) */}
      <aside className="w-60 bg-white border-r border-[#e5e1d8] flex flex-col justify-between shrink-0 min-h-screen sticky top-0">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-[#f0ece1] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#535e39] text-white flex items-center justify-center shadow-sm">
                <PawIcon size={18} />
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-[#2c3228]">Pawradise</span>
                <span className="text-[10px] font-bold text-[#535e39] block -mt-1 tracking-wider uppercase">POS & Admin</span>
              </div>
            </div>
          </div>

          {/* Nav Items: Dashboard, Bookings, Services, Reports */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#535e39] text-white shadow-sm'
                  : 'text-[#5a6254] hover:bg-[#f2efe6] hover:text-[#2c3228]'
              }`}
            >
              <ChartIcon size={16} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'bookings'
                  ? 'bg-[#535e39] text-white shadow-sm'
                  : 'text-[#5a6254] hover:bg-[#f2efe6] hover:text-[#2c3228]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardIcon size={16} />
                <span>Bookings</span>
              </div>
              {filteredBookings.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-[#e5e0d3] text-[#535e39]'
                }`}>
                  {filteredBookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'services'
                  ? 'bg-[#535e39] text-white shadow-sm'
                  : 'text-[#5a6254] hover:bg-[#f2efe6] hover:text-[#2c3228]'
              }`}
            >
              <ScissorsIcon size={16} />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'reports'
                  ? 'bg-[#535e39] text-white shadow-sm'
                  : 'text-[#5a6254] hover:bg-[#f2efe6] hover:text-[#2c3228]'
              }`}
            >
              <TrendUpIcon size={16} />
              <span>Reports</span>
            </button>
          </nav>
        </div>

        {/* Admin Identity Footer */}
        <div className="p-4 border-t border-[#f0ece1]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#535e39] text-white flex items-center justify-center font-bold text-xs">
              {adminName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#2c3228] truncate">{adminName}</div>
              <div className="text-[10px] text-[#788070] truncate">Store Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        {/* Top Notification Toast & Welcome Banner */}
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2c3228] capitalize">
            {activeTab}
          </h1>

          {showToast && (
            <div className="bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
              <span className="h-4 w-4 rounded-full bg-[#22c55e] text-white flex items-center justify-center"><CheckIcon size={10} /></span>
              <span>Welcome back, {adminName}</span>
              <button onClick={() => setShowToast(false)} className="ml-2 text-[#166534]/60 hover:text-[#166534]" aria-label="Dismiss"><CloseIcon size={12} /></button>
            </div>
          )}
        </div>

        {/* Global Controls & Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#788070] mb-1">Period</label>
              <div className="flex items-center gap-2 bg-white border border-[#e5e1d8] rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-[#2c3228] focus:outline-none cursor-pointer"
                >
                  <option>Last 7 days</option>
                  <option>Today</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
                <span className="text-[10px] text-[#788070]">Showing <strong>{timeRange}</strong> · by day</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowCheckInModal(true)}
              className="bg-[#535e39] text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-[#434c2e] transition flex items-center gap-1.5"
            >
              <span>+</span> Check in Walk-in
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <>
            {/* Top 3 KPI Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sales Card */}
              <div className="bg-white border border-[#e5e1d8] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-[#788070]">Sales Revenue</span>
                  <span className="h-8 w-8 rounded-lg bg-[#f4f1e8] text-[#535e39] flex items-center justify-center text-sm font-bold">
                    <TrendUpIcon size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-[#2c3228]">
                  ₱{totalSales.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span>Live count from appointments</span>
                </div>
              </div>

              {/* Orders / Bookings Card */}
              <div className="bg-white border border-[#e5e1d8] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-[#788070]">Bookings / Visits</span>
                  <span className="h-8 w-8 rounded-lg bg-[#f4f1e8] text-[#535e39] flex items-center justify-center text-sm font-bold">
                    <WalletIcon size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-[#2c3228]">
                  {totalOrdersCount}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span>Total registered visits</span>
                </div>
              </div>

              {/* Average Order Value Card */}
              <div className="bg-white border border-[#e5e1d8] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-[#788070]">Average Visit Value</span>
                  <span className="h-8 w-8 rounded-lg bg-[#f4f1e8] text-[#535e39] flex items-center justify-center text-sm font-bold">
                    <ReceiptIcon size={16} />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-[#2c3228]">
                  ₱{avgOrderValue.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] text-[#788070]">
                  Per pet appointment
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#788070]">
              Sales, Bookings and Average are for <strong>{timeRange}</strong>.
            </p>

            {/* Middle Visual Section: Dynamic Line Chart & Best Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {/* Sales Trend Line Chart (Pure dynamic plotting) */}
              <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-[#2c3228]">Sales · {timeRange}</h3>
                  <p className="text-[11px] text-[#788070]">By day. Driven dynamically as appointments are booked.</p>
                </div>

                <div className="relative pt-6 pb-2">
                  <svg className="w-full h-48 overflow-visible" viewBox="0 0 720 180" preserveAspectRatio="none">
                    {/* Grid horizontal lines */}
                    <line x1="0" y1="30" x2="720" y2="30" stroke="#f0ece1" strokeDasharray="4 4" />
                    <line x1="0" y1="75" x2="720" y2="75" stroke="#f0ece1" strokeDasharray="4 4" />
                    <line x1="0" y1="120" x2="720" y2="120" stroke="#f0ece1" strokeDasharray="4 4" />
                    <line x1="0" y1="160" x2="720" y2="160" stroke="#f0ece1" strokeWidth="1" />

                    {/* Gradient Fill under path */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#535e39" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#535e39" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area under line */}
                    <path d={svgAreaD} fill="url(#chartGradient)" />

                    {/* Dynamic Main Olive Line */}
                    <path
                      d={svgPathD}
                      fill="none"
                      stroke="#535e39"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Dynamic Data Points */}
                    {pointsWithXY.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#535e39" strokeWidth="2" />
                        {pt.val > 0 && (
                          <text x={pt.x} y={pt.y - 8} textAnchor="middle" fill="#535e39" fontSize="10" fontWeight="bold">
                            ₱{pt.val}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="flex justify-between text-[10px] text-[#788070] mt-3 font-medium">
                    {pointsWithXY.map((p) => (
                      <span key={p.day}>{p.day}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Best Sellers Bar Chart (Pure Dynamic Calculation) */}
              <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-[#2c3228]">Best sellers</h3>
                  <p className="text-[11px] text-[#788070]">Services sold from appointments.</p>
                </div>

                <div className="space-y-3 pt-2">
                  {serviceSalesList.map((svc) => {
                    const widthPercent = (svc.salesCount / maxSalesCount) * 100;
                    return (
                      <div key={svc.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-[#2c3228] truncate">{svc.name}</span>
                          <span className="font-bold text-[#535e39] ml-2">{svc.salesCount} sold</span>
                        </div>
                        <div className="w-full bg-[#f4f1e8] h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-[#535e39] h-full rounded-full transition-all duration-300"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Table: Real Bookings */}
            <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#2c3228]">Recent bookings</h3>
                  <p className="text-[11px] text-[#788070]">Live Firebase database feed.</p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="bg-[#f4f1e8] text-[#535e39] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#e8e3d5] transition"
                >
                  View all ({filteredBookings.length})
                </button>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#788070] bg-[#fcfbf7] rounded-xl border border-dashed border-[#e5e1d8]">
                  <p className="font-semibold text-[#2c3228]">No appointments or bookings recorded yet.</p>
                  <p className="mt-1">As customers submit booking requests or walk-ins are checked in, they will appear here live.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#f0ece1] text-[#788070] font-semibold text-[11px]">
                        <th className="py-2.5 px-3">Order / Ref</th>
                        <th className="py-2.5 px-3">Pet & Owner</th>
                        <th className="py-2.5 px-3">Time & Date</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ece1]">
                      {filteredBookings.slice(0, 10).map((b) => {
                        const amount = Number(b.totalAmount ?? b.subtotal ?? 0);
                        const refCode = b.bookingCode || `ORD-${b.id?.slice(0, 8) || 'PC100'}`;
                        const timeStr = b.visitTime || '10:00 AM';
                        const dateStr = b.visitDate || 'Today';

                        return (
                          <tr key={b.id || refCode} className="hover:bg-[#fcfbf7] transition">
                            <td className="py-3 px-3 font-mono font-bold text-[#2c3228]">{refCode}</td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-[#2c3228]">{b.dogName || 'Pet'}</div>
                              <div className="text-[10px] text-[#788070]">{b.customerName || b.owner || 'Owner'}</div>
                            </td>
                            <td className="py-3 px-3 text-[#788070]">{dateStr}, {timeStr}</td>
                            <td className="py-3 px-3 font-bold font-mono text-[#2c3228]">₱{amount.toLocaleString()}</td>
                            <td className="py-3 px-3">
                              <select
                                value={b.status ? b.status.toLowerCase() : 'waiting'}
                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                                  b.status === 'completed' || b.status === 'picked-up'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : b.status === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleRemoveBooking(b.id, b.dogName)}
                                className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: BOOKINGS LIST */}
        {activeTab === 'bookings' && (
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-[#2c3228]">All Pet Bookings & Queue</h3>
            {filteredBookings.length === 0 ? (
              <p className="text-xs text-[#788070]">No bookings in the database yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f0ece1] text-[#788070] font-semibold">
                      <th className="py-3 px-3">Ref</th>
                      <th className="py-3 px-3">Dog Name & Breed</th>
                      <th className="py-3 px-3">Owner</th>
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Time</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ece1]">
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 px-3 font-mono font-bold text-[#535e39]">{b.bookingCode || 'PC-100'}</td>
                        <td className="py-3 px-3 font-bold text-[#2c3228]">{b.dogName} ({b.breed || 'Dog'})</td>
                        <td className="py-3 px-3 text-[#788070]">{b.customerName || b.owner}</td>
                        <td className="py-3 px-3 font-medium text-[#2c3228]">{b.service}</td>
                        <td className="py-3 px-3 text-[#788070]">{b.visitDate || 'Today'} · {b.visitTime || '10:00 AM'}</td>
                        <td className="py-3 px-3 font-mono font-bold">₱{(Number(b.totalAmount ?? b.subtotal ?? 0)).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <select
                            value={b.status ? b.status.toLowerCase() : 'waiting'}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className="text-xs border border-[#e5e1d8] rounded-md p-1 font-semibold"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SERVICES MENU */}
        {activeTab === 'services' && (
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-[#2c3228]">Grooming & Daycare Services Menu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATALOG_SERVICES.map((svc) => (
                <div key={svc.name} className="border border-[#e5e1d8] rounded-xl p-4 bg-[#fcfbf7] space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-[#2c3228]">{svc.name}</span>
                    <span className="bg-[#535e39] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      ₱{svc.price}
                    </span>
                  </div>
                  <p className="text-xs text-[#788070]">{svc.category} Package</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-[#2c3228]">Revenue & Visit Performance Report</h3>
            <div className="space-y-2 text-xs text-[#788070]">
              <p>Total Revenue generated this period: <strong className="text-[#2c3228]">₱{totalSales.toLocaleString()} PHP</strong></p>
              <p>Total appointments served: <strong className="text-[#2c3228]">{totalOrdersCount}</strong></p>
            </div>
          </div>
        )}
      </main>

      {/* WALK-IN CHECK IN MODAL */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f0ece1] pb-3">
              <h3 className="font-bold text-base text-[#2c3228]">Check-in Walk-in Pet</h3>
              <button onClick={() => setShowCheckInModal(false)} className="text-[#788070] hover:text-[#2c3228]" aria-label="Close"><CloseIcon size={16} /></button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#788070] mb-1">Dog's Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biscuit"
                  value={newDogName}
                  onChange={(e) => setNewDogName(e.target.value)}
                  className="w-full border border-[#e5e1d8] rounded-lg p-2.5 text-xs bg-[#fcfbf7] focus:outline-none focus:border-[#535e39]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#788070] mb-1">Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full border border-[#e5e1d8] rounded-lg p-2.5 text-xs bg-[#fcfbf7] focus:outline-none focus:border-[#535e39]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#788070] mb-1">Breed</label>
                <input
                  type="text"
                  placeholder="e.g. Poodle"
                  value={newBreed}
                  onChange={(e) => setNewBreed(e.target.value)}
                  className="w-full border border-[#e5e1d8] rounded-lg p-2.5 text-xs bg-[#fcfbf7] focus:outline-none focus:border-[#535e39]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#788070] mb-1">Service Package</label>
                <select
                  value={newService}
                  onChange={(e) => {
                    setNewService(e.target.value);
                    const svc = CATALOG_SERVICES.find(s => s.name === e.target.value);
                    if (svc) setNewPrice(svc.price);
                  }}
                  className="w-full border border-[#e5e1d8] rounded-lg p-2.5 text-xs bg-[#fcfbf7] focus:outline-none"
                >
                  {CATALOG_SERVICES.map(s => (
                    <option key={s.name} value={s.name}>{s.name} · ₱{s.price}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#535e39] text-white font-bold py-3 rounded-xl hover:bg-[#434c2e] transition disabled:opacity-50"
              >
                {isSubmitting ? 'Checking in...' : 'Complete Walk-in Check-in'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
