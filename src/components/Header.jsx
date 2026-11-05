import React, { useState, useRef, useEffect } from 'react';
import { PawIcon, ArrowUpRight, MenuIcon, CloseIcon, ChevronDownIcon, UserIcon, btnPrimary } from './ui';

const bookBtn =
  'inline-flex items-center justify-center gap-2 rounded-md border border-forest bg-transparent px-4 py-2.5 text-sm font-medium text-forest transition-colors duration-300 hover:bg-forest hover:text-cream';

export default function Header({ activeTab, currentUser, displayName, isAdmin, onNavigate, onBook, onOpenProfile }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const pillRef = useRef(null);
  const itemRefs = useRef([]);

  const links = isAdmin
    ? [
        { label: 'Dashboard', tab: 'admin' },
      ]
    : currentUser
    ? [
        { label: 'Services', tab: 'services' },
        { label: 'My pets', tab: 'mypets' },
        { label: 'Bookings', tab: 'bookings' },
        { label: 'Visit', tab: 'visit' },
      ]
    : [
        { label: 'Grooming & daycare', tab: 'services' },
        { label: 'About', tab: 'about' },
        { label: 'Visit', tab: 'visit' },
      ];

  const go = (l) => {
    setOpen(false);
    onNavigate(l.tab, l.anchor);
  };

  const activeIndex = links.findIndex((l) => !l.anchor && activeTab === l.tab);
  const target = hovered ?? (activeIndex >= 0 ? activeIndex : null);

  // Slide one green pill under whichever nav item is hovered or current.
  useEffect(() => {
    const pill = pillRef.current;
    const el = target === null ? null : itemRefs.current[target];
    if (!pill) return;
    if (!el) {
      pill.style.opacity = '0';
      pill.dataset.on = '0';
      return;
    }
    const wasOn = pill.dataset.on === '1';
    pill.style.transition = wasOn
      ? 'transform 300ms cubic-bezier(.4,0,.2,1), width 300ms cubic-bezier(.4,0,.2,1), opacity 200ms'
      : 'opacity 200ms';
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.transform = `translateX(${el.offsetLeft}px)`;
    pill.style.opacity = '1';
    pill.dataset.on = '1';
  }, [target, links.length]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5" aria-label="Pawradise home">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-forest text-cream">
            <PawIcon size={15} />
          </span>
          <span className="font-serif text-xl text-forest">Pawradise</span>
        </button>

        <nav
          className="relative hidden items-center gap-1 md:flex"
          aria-label="Main"
          onMouseLeave={() => setHovered(null)}
        >
          <span
            ref={pillRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-full rounded-md bg-forest opacity-0"
          />
          {links.map((l, i) => (
            <button
              key={l.label}
              ref={(el) => (itemRefs.current[i] = el)}
              onClick={() => go(l)}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className={`relative z-10 rounded-md px-4 py-2 text-sm transition-colors duration-300 ${
                target === i ? 'text-cream' : 'text-ink/60'
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="hidden items-center gap-3 sm:flex">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 rounded-xl border border-line bg-sage/50 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-sage transition shadow-sm"
                title="View & Edit Profile"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-cream text-[10px] font-bold">
                  {(displayName || 'P').slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm text-ink/90 font-medium">{displayName}</span>
                <ChevronDownIcon size={14} className="text-forest/70" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="hidden rounded-md px-3 py-2 text-xs font-semibold text-forest transition-colors duration-300 hover:bg-sage active:bg-sage/70 sm:inline"
            >
              Log in
            </button>
          )}
          {!isAdmin && (
            <button onClick={onBook} className={`${bookBtn} hidden sm:inline-flex`}>
              <ArrowUpRight size={14} /> Book a visit
            </button>
          )}
          <button
            className="rounded-md p-2 text-forest md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line/70 bg-cream px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <button key={l.label} onClick={() => go(l)} className="py-2.5 text-left text-sm text-ink/80">
                {l.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-line/50">
            {!isAdmin && (
              <button
                onClick={() => {
                  setOpen(false);
                  onBook();
                }}
                className={btnPrimary}
              >
                <ArrowUpRight size={14} /> Book a visit
              </button>
            )}
            {currentUser ? (
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenProfile();
                }}
                className="w-full rounded-xl border border-line bg-sage/50 py-2.5 text-xs font-bold text-forest hover:bg-sage transition flex items-center justify-center gap-2"
              >
                <UserIcon size={14} /> Profile & Settings ({displayName})
              </button>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  onNavigate('login');
                }}
                className="rounded-md px-3 py-2 text-xs font-semibold text-forest transition-colors duration-300 hover:bg-sage active:bg-sage/70"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
