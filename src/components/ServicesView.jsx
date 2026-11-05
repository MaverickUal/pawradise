import React from 'react';
import { btnPrimary } from './ui';

const rows = [
  {
    title: 'Grooming',
    text: 'Full bath and bath trim. Includes nail clipping, ear cleaning and blow dry.',
    price: '₱400 - ₱800',
  },
  {
    title: 'Daycare',
    text: 'Full daycare pass. Supervised group play with a climate-controlled lounge.',
    price: '₱200 / day',
  },
  {
    title: 'Add-ons',
    text: 'Fresh breath, silky coats and soothing treatments to add on any visit.',
    price: 'From ₱70',
  },
];

export default function ServicesView({ onBook }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 md:py-20">
      <h1 className="font-serif text-4xl text-forest">Services &amp; pricing</h1>
      <p className="mt-2 text-sm text-muted">Simple prices, no surprises at pick-up.</p>

      <ul className="mt-10 divide-y divide-line rounded-xl border border-line bg-white">
        {rows.map((r) => (
          <li key={r.title} className="flex items-start justify-between gap-6 p-6">
            <div>
              <h2 className="font-serif text-xl text-forest">{r.title}</h2>
              <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">{r.text}</p>
            </div>
            <span className="shrink-0 pt-1 text-sm font-semibold text-forest">{r.price}</span>
          </li>
        ))}
      </ul>

      <button onClick={onBook} className={`${btnPrimary} mt-8`}>
        Book a visit
      </button>
    </section>
  );
}
