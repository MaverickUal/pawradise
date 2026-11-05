import React from 'react';
import { PinIcon, btnPrimary } from './ui';

const hours = [
  ['Mon-Fri', '8:00 AM-6:00 PM'],
  ['Saturday', '9:00 AM-4:00 PM'],
  ['Sunday', 'Closed'],
];

export default function VisitView({ onBook }) {
  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
      <p className="mb-6 flex items-center gap-1.5 text-xs font-medium text-forest">
        <PinIcon size={13} /> Malolos, Bulacan
      </p>
      <h1 className="font-serif text-4xl text-forest md:text-5xl">Visit us</h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        Drop in during opening hours, or book ahead so we can have your pet’s profile ready.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-6 text-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-forest">Our location</h2>
          <address className="mt-3 space-y-1 not-italic leading-relaxed">
            <p>89 Malolos, Bulacan</p>
            <p>BulSU, OR 97202</p>
          </address>
        </div>

        <div className="rounded-xl border border-line bg-white p-6 text-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-forest">Hours</h2>
          <dl className="mt-3 space-y-1">
            {hours.map(([d, t]) => (
              <div key={d} className="flex gap-3">
                <dt className="w-20 shrink-0">{d}</dt>
                <dd>{t}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-line bg-white p-6 text-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-forest">Contact</h2>
          <div className="mt-3 space-y-1">
            <p>hello@pawradise.ph</p>
            <p>(503) 555-0142</p>
          </div>
        </div>
      </div>

      <button onClick={onBook} className={`${btnPrimary} mt-8`}>Book a visit</button>
    </section>
  );
}
