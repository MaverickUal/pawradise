import React from 'react';
import { HeartIcon, ShieldIcon, UsersIcon, LeafIcon, btnPrimary, btnSecondary } from './ui';

const values = [
  { icon: HeartIcon, title: 'Gentle grooming', text: 'Baths, trims and unhurried care tailored to each pet’s coat and comfort.' },
  { icon: ShieldIcon, title: 'Vaccinated play', text: 'Daycare is for vaccinated pets only, so everyone can play safely.' },
  { icon: UsersIcon, title: 'Small groups', text: 'Supervised groups with room to play, sniff and rest.' },
  { icon: LeafIcon, title: 'Pet-kind products', text: 'Soothing treatments and products chosen to be easy on skin and coats.' },
];

export default function AboutView({ onNavigate, onBook }) {
  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
      <h1 className="max-w-xl font-serif text-4xl leading-[1.15] text-forest md:text-5xl">
        Gentle care in a calm space.
      </h1>
      <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
        Pawradise is a grooming and daycare space in Malolos, Bulacan. We keep things simple: small groups, patient
        handling and clear booking, so your pet’s visit is easy for both of you.
      </p>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {values.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-xl border border-line bg-white p-6">
            <Icon size={18} className="text-forest" />
            <h2 className="mt-4 font-serif text-xl text-forest">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <button onClick={onBook} className={btnPrimary}>Book a visit</button>
        <button onClick={() => onNavigate('visit')} className={btnSecondary}>Find us</button>
      </div>
    </section>
  );
}
