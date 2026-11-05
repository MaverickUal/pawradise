import React from 'react';
import { PawIcon } from './ui';

export default function Footer({ onStaffLogin }) {
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-4 px-5 py-6 text-xs sm:px-8 md:grid-cols-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cream text-forest">
            <PawIcon size={15} />
          </span>
          <span className="font-serif text-lg">Pawradise</span>
        </div>
        <p className="text-cream/70 md:text-center">&copy; {new Date().getFullYear()} Pawradise</p>
        <div className="flex gap-6 md:justify-end">
          <button className="text-cream/80 hover:text-cream">Policies</button>
          <button className="text-cream/80 hover:text-cream">Privacy</button>
          <button onClick={onStaffLogin} className="text-cream/80 transition-colors hover:text-cream">Staff login</button>
        </div>
      </div>
    </footer>
  );
}
