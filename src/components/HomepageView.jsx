import React from 'react';
import {
  Photo, PinIcon, ArrowUpRight, ArrowRight, HeartIcon, ShieldIcon, UsersIcon, LeafIcon,
  btnPrimary, btnSecondary,
} from './ui';

const trust = [
  { icon: HeartIcon, label: 'Gentle grooming' },
  { icon: ShieldIcon, label: 'Vaccinated play' },
  { icon: UsersIcon, label: 'Small groups' },
  { icon: LeafIcon, label: 'Pet-kind products' },
];

const services = [
  {
    key: 'grooming',
    label: 'Grooming',
    price: 'From ₱400',
    title: 'Grooming',
    text: 'Baths, trims and unhurried care tailored to coat and comfort.',
    cta: 'View grooming',
    img: '/images/dog-groom.jpg',
    alt: 'Illustration of a dog being groomed with scissors and comb',
  },
  {
    key: 'daycare',
    label: 'Daycare',
    price: 'From ₱200',
    title: 'Daycare',
    text: 'Small, supervised groups with room to play, sniff and rest.',
    cta: 'View daycare',
    img: '/images/dog-happy.jpg',
    alt: 'Illustration of a happy dog',
  },
  {
    key: 'addons',
    label: 'Add-ons',
    price: 'From ₱70',
    title: 'Add-ons',
    text: 'Fresh breath, silky coats and soothing treatments to add on any visit.',
    cta: 'View add-ons',
    img: '/images/cat-happy.jpg',
    alt: 'Illustration of a content cat',
  },
];

const steps = [
  { n: '01', title: 'Tell us about your pet', text: 'Create a profile with their needs, allergies and preferences.' },
  { n: '02', title: 'Choose a service and time', text: 'Select grooming, daycare or both, then pick an available date and time.' },
  { n: '03', title: 'Confirm your visit', text: "Pay a 50% deposit and we'll verify the booking before you arrive." },
];

const hours = [
  ['Mon-Fri', '8:00 AM-6:00 PM'],
  ['Saturday', '9:00 AM-4:00 PM'],
  ['Sunday', 'Closed'],
];

export default function HomepageView({ onNavigate, onBook }) {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 md:grid-cols-2 md:gap-14 md:pb-16 md:pt-14">
        <div>
          <p className="mb-8 flex items-center gap-1.5 text-xs font-medium text-forest">
            <PinIcon size={13} /> Malolos, Bulacan
          </p>
          <h1 className="font-serif text-5xl font-normal leading-[1.1] tracking-tight text-forest lg:text-[3.5rem]">
            Grooming &amp; daycare for pets.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
            Simple, gentle care in a calm space. Book grooming, daycare, or both.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={onBook} className={btnPrimary}>
              <ArrowUpRight size={14} /> Book a visit
            </button>
            <button onClick={() => onNavigate('services')} className={btnSecondary}>
              Our services
            </button>
          </div>
        </div>

        <Photo
          src="/images/dogs.jpg"
          alt="A group of friendly dogs and cats sitting together"
          className="aspect-[4/3.6] w-full rounded-2xl md:rounded-tl-3xl md:rounded-tr-[8rem] md:rounded-bl-xl"
        />
      </section>

      {/* Trust strip */}
      <section className="border-y border-line/80">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-4 px-5 py-5 sm:px-8 md:grid-cols-4">
          {trust.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-xs text-ink/80 md:justify-center">
              <Icon size={15} className="text-forest" /> {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-forest md:text-4xl">Our services</h2>
            <p className="mt-2 text-sm text-muted">Grooming, daycare and add-ons in one calm, easy visit.</p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-forest hover:underline"
          >
            View prices <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <article key={s.key} className="group overflow-hidden rounded-xl border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-md">
              <div className="overflow-hidden bg-sage/50">
                <Photo src={s.img} alt={s.alt} contain className="aspect-[16/10] w-full transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide text-forest">
                  <span className="uppercase">{s.label}</span>
                  <span>{s.price}</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl text-forest">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.text}</p>
                <button
                  onClick={() => onNavigate('services')}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
                >
                  {s.cta} <ArrowRight size={12} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How visits work */}
      <section id="how" className="bg-sage">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_2.2fr] md:items-center">
          <h2 className="font-serif text-3xl text-forest md:text-4xl">How visits work.</h2>
          <ol className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n}>
                <span className="font-serif text-2xl text-forest">{s.n}</span>
                <h3 className="mt-3 text-sm font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Book a visit */}
      <section id="visit" className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-3 md:py-20">
        <div>
          <h2 className="font-serif text-4xl text-forest">Book a visit</h2>
          <button onClick={onBook} className={`${btnPrimary} mt-7`}>
            <ArrowUpRight size={14} /> Book a visit
          </button>
        </div>

        <div className="text-sm">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-forest">Our location</h3>
          <address className="mt-3 space-y-1 not-italic leading-relaxed text-ink">
            <p>89 Malolos, Bulacan</p>
            <p>BulSU, OR 97202</p>
          </address>
        </div>

        <div className="text-sm">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-forest">Hours</h3>
          <dl className="mt-3 space-y-1 text-ink">
            {hours.map(([d, t]) => (
              <div key={d} className="flex gap-3">
                <dt className="w-20 shrink-0">{d}</dt>
                <dd>{t}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 space-y-1 text-ink">
            <p>hello@pawradise.ph</p>
            <p>(503) 555-0142</p>
          </div>
        </div>
      </section>
    </>
  );
}
