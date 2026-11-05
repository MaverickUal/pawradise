import React from 'react';
import { PawIcon } from './ui';
import { LogOut } from 'lucide-react';

export default function AdminSidebar({ activeItem, onNavigate }) {
  return (
    <aside className="w-64 bg-emerald-950 text-emerald-100 p-6 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        <div className="text-2xl font-serif font-bold text-amber-200 tracking-tight flex items-center gap-1.5 mb-8">
          <span className="bg-emerald-800 text-amber-200 p-1.5 rounded-lg flex items-center"><PawIcon size={18} /></span> Pawradise
        </div>
        <div className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase mb-3">Admin</div>
        <nav className="space-y-1">
          <button 
            onClick={() => onNavigate('admin-overview')} 
            className={'w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between ' + (activeItem === 'overview' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-200 hover:bg-emerald-900')}
          >
            <span>Overview</span>
          </button>
          <button 
            onClick={() => onNavigate('admin-review')} 
            className={'w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between ' + (activeItem === 'reservations' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-200 hover:bg-emerald-900')}
          >
            <span>Reservations</span>
            <span className="bg-amber-400 text-emerald-950 text-xs font-bold px-2 py-0.5 rounded-full">4</span>
          </button>
          <button 
            onClick={() => onNavigate('admin-availability')} 
            className={'w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between ' + (activeItem === 'availability' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-200 hover:bg-emerald-900')}
          >
            <span>Availability</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-emerald-200 hover:bg-emerald-900">
            <span>Bookings</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-emerald-200 hover:bg-emerald-900">
            <span>Customers & pets</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-emerald-200 hover:bg-emerald-900">
            <span>Services</span>
          </button>
        </nav>
      </div>

      <div>
        <div className="bg-emerald-900/60 p-3 rounded-xl mb-4 border border-emerald-800">
          <div className="text-xs font-bold text-amber-200 mb-1">Need help?</div>
          <p className="text-xs text-emerald-300">Our team can help with questions or visit details.</p>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-200 text-emerald-950 font-bold flex items-center justify-center text-xs">JL</div>
          <div>
            <div className="text-xs font-bold text-white">Jamie Lee</div>
            <div className="text-[10px] text-emerald-300">Administrator</div>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('signed-out')} 
          className="text-xs font-medium text-emerald-400 hover:text-amber-200 flex items-center gap-1"
        >
          <LogOut className="w-3 h-3" /> Sign out
        </button>
      </div>
    </aside>
  );
}