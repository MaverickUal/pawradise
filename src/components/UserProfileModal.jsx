import React, { useState, useEffect } from 'react';
import { PawIcon, ShieldIcon, CloseIcon, LogOutIcon } from './ui';
import { updateUserProfile } from '../firebase';

export default function UserProfileModal({ isOpen, onClose, currentUser, userData, onProfileUpdated, onLogout }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setPhone(userData.phone || '');
    } else if (currentUser?.displayName) {
      const parts = currentUser.displayName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone('');
    }
  }, [userData, currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setIsSaving(true);

    try {
      const updatedData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim()
      };
      await updateUserProfile(currentUser.uid, updatedData);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      if (onProfileUpdated) {
        onProfileUpdated(updatedData);
      }
      setTimeout(() => {
        setMsg({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || currentUser.email || 'Pet Parent';
  const avatarInitials = (firstName ? firstName[0] : currentUser.email ? currentUser.email[0] : 'P').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-6 relative overflow-hidden">
        {/* Header Banner */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-forest text-cream font-bold text-lg flex items-center justify-center shadow-inner">
              {avatarInitials}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-forest">{displayName}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-sage text-forest px-2 py-0.5 rounded-full">
                {userData?.role === 'admin' ? <><ShieldIcon size={12} /> Staff / Admin</> : <><PawIcon size={12} /> Pet Parent</>}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-forest p-1 rounded-lg transition"
            aria-label="Close modal"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Feedback Messages */}
        {msg.text && (
          <div
            className={`rounded-xl p-3 text-xs font-semibold ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-forest mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={currentUser.email || ''}
              className="w-full rounded-lg border border-line bg-gray-50 p-2.5 text-xs text-muted cursor-not-allowed"
            />
            <span className="text-[10px] text-muted mt-0.5 block">Email address is managed via login authentication.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-forest mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-forest mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-forest mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +63 917 123 4567"
              className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-line">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-forest text-white px-5 py-2.5 text-xs font-bold hover:bg-forest-dark transition disabled:opacity-50"
            >
              {isSaving ? 'Saving changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Account Actions & Logout Button */}
        <div className="pt-4 border-t border-line/80 space-y-2">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Account Actions</div>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className="w-full rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:text-red-800 transition flex items-center justify-center gap-2"
          >
            <LogOutIcon size={14} /> Log out of account
          </button>
        </div>
      </div>
    </div>
  );
}
