import React from 'react';
import { LogOut } from 'lucide-react';
import { ArrowRight } from './ui';

export default function CustomerSidebar({ activeItem, onNavigate }) {
  return (
    <aside className="w-64 bg-emerald-900/5 p-6 rounded-2xl flex flex-col justify-between h-fit shrink-0">
      <div>
        <div className="text-xs font-bold tracking-wider text-emerald-800/60 uppercase mb-4">My Account</div>
        <nav className="space-y-1">
          <button 
            onClick={() => onNavigate('my-pets')} 
            className={'w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ' + (activeItem === 'my-pets' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-900 hover:bg-emerald-100')}
          >
            <span>My pets</span>
          </button>
          <button 
            onClick={() => onNavigate('services')} 
            className={'w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ' + (activeItem === 'services' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-900 hover:bg-emerald-100')}
          >
            <span>Services</span>
          </button>
          <button 
            onClick={() => onNavigate('book-visit')} 
            className={'w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ' + (activeItem === 'book' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-900 hover:bg-emerald-100')}
          >
            <span>Book</span>
          </button>
          <button 
            onClick={() => onNavigate('booking-status')} 
            className={'w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ' + (activeItem === 'bookings' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-900 hover:bg-emerald-100')}
          >
            <span>Bookings</span>
            <span className="bg-amber-400 text-emerald-950 text-xs font-bold px-1.5 py-0.5 rounded-full">2</span>
          </button>
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-emerald-900/10">
        <div className="bg-emerald-100/60 p-3 rounded-xl mb-4">
          <div className="text-xs font-bold text-emerald-900 mb-1">Need help?</div>
          <p className="text-xs text-emerald-700 mb-2">Our team can help with questions or visit details.</p>
          <button className="text-xs font-bold text-emerald-800 flex items-center gap-1 hover:underline">
            <span>Chat with us</span> <ArrowRight size={12} className="inline" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">AR</div>
          <div>
            <div className="text-xs font-bold text-emerald-950">Alex Rivera</div>
            <div className="text-[10px] text-emerald-700">Pet parent</div>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('signed-out')} 
          className="text-xs font-medium text-emerald-700 hover:text-emerald-950 flex items-center gap-1"
        >
          <LogOut className="w-3 h-3" /> Sign out
        </button>
      </div>
    </aside>
  );
}