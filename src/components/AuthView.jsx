import React, { useState } from 'react';
import {
  Photo, PawIcon, HeartIcon, ArrowLeft, ArrowRight, ArrowUpRight, MailIcon, PhoneIcon,
  EyeIcon, EyeOffIcon, LockIcon, CalendarIcon, btnPrimary, btnSecondary,
} from './ui';

const inputBase =
  'w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition-colors duration-200 hover:border-forest/30 focus:border-forest focus:outline-none';

function Field({ id, label, icon, trailing, hint, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink">{label}</label>
      <div className="relative">
        <input id={id} required className={`${inputBase} ${icon || trailing ? 'pr-10' : ''}`} {...props} />
        {(icon || trailing) && (
          <span className="absolute inset-y-0 right-3 flex items-center text-muted">{trailing || icon}</span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export default function AuthView({
  mode, values, setters, onSubmit, onGoogle, onSwitch, onBack, onForgot, onStaff,
  errorMsg, successMsg, remember, setRemember,
}) {
  const isLogin = mode === 'login';
  const [showPw, setShowPw] = useState(false);
  const { email, password, firstName, lastName, phone } = values;
  const { setEmail, setPassword, setFirstName, setLastName, setPhone } = setters;

  const passwordField = (
    <Field
      id="password"
      label="Password"
      type={showPw ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      autoComplete={isLogin ? 'current-password' : 'new-password'}
      minLength={isLogin ? undefined : 8}
      pattern={isLogin ? undefined : '(?=.*\\d).{8,}'}
      title={isLogin ? undefined : 'At least 8 characters, including a number.'}
      hint={isLogin ? undefined : 'At least 8 characters, including a number.'}
      trailing={
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          aria-label={showPw ? 'Hide password' : 'Show password'}
          className="rounded p-1 transition-colors hover:text-forest"
        >
          {showPw ? <EyeIcon size={15} /> : <EyeOffIcon size={15} />}
        </button>
      }
    />
  );

  return (
    <div className="page-enter grid min-h-screen bg-cream text-ink lg:grid-cols-[42%_1fr]">
      {/* Brand panel */}
      <aside className="hidden flex-col bg-forest px-10 py-8 text-cream lg:flex">
        <button onClick={onBack} className="flex w-fit items-center gap-2.5" aria-label="Pawradise home">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f0d9c0] text-forest">
            <PawIcon size={15} />
          </span>
          <span className="font-serif text-xl">Pawradise</span>
        </button>

        <div className="my-auto py-10">
          <h2 className="font-serif text-4xl leading-tight">Grooming &amp; daycare.</h2>
          <p className="mt-3 text-sm text-cream/75">Simple, gentle care in a calm space.</p>
          <Photo
            src="/images/dogs.jpg"
            alt="A group of friendly dogs and cats sitting together"
            className="mt-8 aspect-[4/3.3] w-full max-w-md rounded-2xl bg-forest-dark"
          />
          <p className="mt-6 flex items-center gap-2 text-xs text-cream/90">
            <HeartIcon size={14} className="text-[#f0d9c0]" /> Gentle grooming. Vaccinated play. Small groups.
          </p>
        </div>

        <p className="text-[11px] text-cream/60">&copy; {new Date().getFullYear()} Pawradise · Malolos, Bulacan</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-ink/70 transition-colors duration-200 hover:text-forest"
            >
              <ArrowLeft size={13} /> Back to Pawradise
            </button>
            <span className="text-muted">Need a hand?</span>
          </div>

          <div className="my-auto py-10">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/70">
              {isLogin ? 'Log in' : 'Create an account'}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-forest">
              {isLogin ? 'Welcome back.' : 'Book care online.'}
            </h1>
            <p className="mt-2 text-[13px] text-muted">
              {isLogin
                ? 'Log in to book, check bookings and update your pet’s profile.'
                : 'Create your account to book.'}
            </p>

            {errorMsg && (
              <div role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div role="status" className="mt-5 rounded-md border border-forest/20 bg-sage px-3.5 py-2.5 text-xs text-forest">
                {successMsg}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <Field id="first" label="First name" type="text" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} placeholder="Alex" autoComplete="given-name" />
                  <Field id="last" label="Last name" type="text" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} placeholder="Rivera" autoComplete="family-name" />
                </div>
              )}

              <Field id="email" label="Email address" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                autoComplete="email" icon={<MailIcon size={15} />} />

              {!isLogin && (
                <Field id="phone" label="Phone number" type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="09123456789"
                  autoComplete="tel" icon={<PhoneIcon size={15} />} />
              )}

              {passwordField}

              {isLogin ? (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-ink/80">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-3.5 w-3.5 accent-forest"
                    />
                    Keep me signed in
                  </label>
                  <button
                    type="button"
                    onClick={onForgot}
                    className="font-medium text-forest transition-colors hover:text-forest-dark hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-ink/80">
                  <input type="checkbox" required className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-forest" />
                  <span>I agree to the Terms of care and Privacy policy. A 50% deposit is required to request a visit.</span>
                </label>
              )}

              <button type="submit" className={`${btnPrimary} w-full`}>
                <ArrowRight size={14} /> {isLogin ? 'Log in' : 'Create account'}
              </button>

              <button type="button" onClick={onGoogle} className={`${btnSecondary} w-full`}>
                Continue with Google
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-muted">
              {isLogin ? 'New to Pawradise?' : 'Already part of the pack?'}{' '}
              <button onClick={onSwitch} className="font-semibold text-forest hover:underline">
                {isLogin ? 'Create an account' : 'Log in'}
              </button>
            </p>

            <hr className="my-6 border-line" />

            {isLogin ? (
              <>
                <div className="flex items-start gap-3 rounded-lg bg-sage p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-forest">
                    <CalendarIcon size={14} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-forest">Book grooming or daycare.</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                      Choose a service, pick your time, and we’ll handle the rest.
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-center text-[11px] text-muted">
                  Part of the team?{' '}
                  <button onClick={onStaff} className="inline-flex items-center gap-0.5 font-semibold text-forest hover:underline">
                    Staff login <ArrowUpRight size={11} />
                  </button>
                </p>
              </>
            ) : (
              <p className="flex items-center gap-2 text-[11px] text-muted">
                <LockIcon size={13} /> Your details stay safe.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
