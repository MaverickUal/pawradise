import React, { useState, useEffect } from 'react';
import { subscribeCustomerBookings } from '../firebase';
import { PetAvatar, CheckIcon, ClockIcon, ClipboardIcon, ScissorsIcon, BellIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from './ui';

export const normalizeStatus = (statusStr) => {
  if (!statusStr) return 'waiting';
  const s = String(statusStr).trim().toLowerCase();
  if (s === 'pending review' || s === 'pending' || s === 'requested' || s === 'pending_review' || s === 'waiting' || s === 'wait' || s === 'queued') return 'waiting';
  if (s === 'confirmed' || s === 'visit confirmed' || s === 'approved') return 'confirmed';
  if (s === 'checked-in' || s === 'checked in' || s === 'check in' || s === 'arrived') return 'checked-in';
  if (s === 'bathing' || s === 'bath' || s === 'wash') return 'bathing';
  if (s === 'drying' || s === 'dry' || s === 'blow dry') return 'drying';
  if (s === 'styling' || s === 'style' || s === 'grooming' || s === 'haircut') return 'styling';
  if (s === 'ready' || s === 'ready for pickup' || s === 'ready for pick-up' || s === 'ready for pickup!') return 'ready';
  if (s === 'completed' || s === 'done' || s === 'picked up' || s === 'picked-up' || s === 'finished') return 'completed';
  if (s === 'cancelled' || s === 'canceled' || s === 'rejected') return 'cancelled';
  return s;
};

export default function CustomerMyBookings({ currentUser, onBookNew }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = currentUser?.uid;

    if (!uid) {
      setBookings([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = subscribeCustomerBookings(
      uid,
      (data) => {
        setBookings([...data].reverse());
        setLoading(false);
      },
      (err) => {
        console.error("Firebase customer bookings subscription error:", err);
        setBookings([]);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUser?.uid]);

  const getStatusBadge = (rawStatus) => {
    const norm = normalizeStatus(rawStatus);
    switch (norm) {
      case 'waiting':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5"><ClockIcon size={13} /> Waiting in Queue</span>;
      case 'checked-in':
        return <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5"><ClipboardIcon size={13} /> Checked In</span>;
      case 'bathing':
      case 'drying':
      case 'styling':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5"><ScissorsIcon size={13} /> Grooming in Progress ({norm})</span>;
      case 'ready':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-sm inline-flex items-center gap-1.5"><BellIcon size={13} /> Ready for Pickup</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5"><CheckCircleIcon size={13} /> Completed</span>;
      case 'confirmed':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5"><CheckCircleIcon size={13} /> Visit Confirmed</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5"><XCircleIcon size={13} /> Cancelled</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5"><ClockIcon size={13} /> Waiting in Queue</span>;
    }
  };

  const renderGroomingTimeline = (rawStatus) => {
    const norm = normalizeStatus(rawStatus);
    const stages = [
      { key: 'waiting', label: 'Waiting' },
      { key: 'checked-in', label: 'Checked In' },
      { key: 'bathing', label: 'Bathing' },
      { key: 'drying', label: 'Drying' },
      { key: 'styling', label: 'Styling' },
      { key: 'ready', label: 'Ready for Pickup' },
      { key: 'completed', label: 'Completed' }
    ];

    const getStageIndex = (s) => stages.findIndex(st => st.key === s);
    const currentIndex = getStageIndex(norm) >= 0 ? getStageIndex(norm) : 0;

    return (
      <div className="mt-4 pt-4 border-t border-line">
        <div className="text-xs font-semibold uppercase tracking-wider text-forest mb-3">Live Grooming Progress</div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {stages.map((st, idx) => {
            const isDone = currentIndex >= idx;
            const isCurrent = currentIndex === idx;
            return (
              <div key={st.key} className="flex flex-col items-center text-center flex-1 min-w-[60px] relative">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold z-10 transition ${
                  isCurrent ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-bounce' :
                  isDone ? 'bg-forest text-white' : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}>
                  {isDone && !isCurrent ? <CheckIcon size={13} /> : idx + 1}
                </div>
                <span className={`text-[10px] mt-1 font-semibold leading-tight ${isCurrent ? 'text-amber-900 font-bold' : isDone ? 'text-forest' : 'text-gray-400'}`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const readyPets = bookings.filter(b => normalizeStatus(b.status) === 'ready');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-forest">My Bookings</h1>
          <p className="text-sm text-muted">Track your visit requests and live grooming progress.</p>
        </div>
        <button
          onClick={onBookNew}
          className="rounded-xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-forest-dark transition"
        >
          + Book a visit
        </button>
      </div>

      {/* Ready Alert Callout */}
      {readyPets.length > 0 && readyPets.map((b) => (
        <div key={b.id} className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 shadow-sm flex items-start gap-4 animate-in fade-in">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"><BellIcon size={20} /></div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">{b.dogName} is ready for pickup!</h3>
            <p className="text-xs text-emerald-900 mt-0.5">
              The {b.service || 'session'} for {b.dogName} is complete. You can drop by Pawradise Malolos to bring your pet home!
            </p>
          </div>
        </div>
      ))}

      {/* Bookings List */}
      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted">
          Loading your bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-sage flex items-center justify-center text-forest">
            <CalendarIcon size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-forest">No active bookings</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              You haven't scheduled any pampering visits or daycare sessions yet.
            </p>
          </div>
          <button
            onClick={onBookNew}
            className="rounded-xl bg-forest text-white px-5 py-2.5 text-xs font-bold shadow hover:bg-forest-dark transition"
          >
            + Schedule a visit now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => (
            <div key={item.id} className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-sage overflow-hidden"><PetAvatar breed={item.breed} className="h-full w-full" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg font-bold text-forest">{item.dogName}'s Visit</h2>
                      <span className="font-mono text-xs text-muted">({item.bookingCode || 'PC-1048'})</span>
                    </div>
                    <p className="text-xs text-muted">{item.service} · {item.visitDate} @ {item.visitTime}</p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Payment & Receipt Verification status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-sage/30 p-3 text-xs">
                <div>
                  <span className="text-muted block">Total Amount</span>
                  <span className="font-bold text-forest">₱{(item.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted block">Downpayment (50%)</span>
                  <span className="font-bold text-emerald-700">₱{(item.downpaymentAmount || 0).toFixed(2)} ({item.paymentProofStatus || 'Verified'})</span>
                </div>
                <div>
                  <span className="text-muted block">Balance at store</span>
                  <span className="font-bold text-forest">₱{(item.balanceDue || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Live Grooming Progress */}
              {renderGroomingTimeline(item.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
