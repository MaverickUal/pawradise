import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomepageView from './components/HomepageView';
import ServicesView from './components/ServicesView';
import AuthView from './components/AuthView';
import AboutView from './components/AboutView';
import AdminView from './components/AdminView';
import CustomerBookVisit from './components/CustomerBookVisit';
import CustomerMyBookings from './components/CustomerMyBookings';
import CustomerMyPets from './components/CustomerMyPets';
import UserProfileModal from './components/UserProfileModal';
import { btnPrimary } from './components/ui';
import { auth, db, loginWithEmail, resetPassword, registerWithEmail, loginWithGoogle, logoutUser, handleRedirectResult } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

function EmptyState({ title, text, action, onAction }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 md:py-20">
      <h1 className="font-serif text-4xl text-forest">{title}</h1>
      <div className="mt-8 rounded-xl border border-line bg-white p-10 text-center">
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">{text}</p>
        {action && <button onClick={onAction} className={`${btnPrimary} mt-6`}>{action}</button>}
      </div>
    </section>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    handleRedirectResult().then((user) => {
      if (user) {
        setCurrentUser(user);
        setActiveTab('home');
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snapshot = await get(ref(db, `users/${user.uid}`));
          const data = snapshot.exists() ? snapshot.val() : null;
          setUserData(data);
          
          // Automatically navigate customer to Pawradise Landing ('home') after successful login
          const targetTab = data?.role === 'admin' ? 'admin' : 'home';
          setActiveTab((prev) => (prev === 'login' || prev === 'register' ? targetTab : prev));
        } catch (err) {
          console.error("Error fetching user data:", err);
          setActiveTab((prev) => (prev === 'login' || prev === 'register' ? 'home' : prev));
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await loginWithEmail(email, password, remember);
      setEmail('');
      setPassword('');
      setActiveTab('home');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleForgot = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email) {
      setErrorMsg('Enter your email above, then select Forgot password.');
      return;
    }
    try {
      await resetPassword(email);
      setSuccessMsg(`We sent a password reset link to ${email}.`);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await registerWithEmail(email, password, firstName, lastName, phone);
      setActiveTab('home');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const anchorRef = useRef(null);

  const navigate = (tab, anchor) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Auth Guard: If customer attempts to visit protected tabs without logging in
    const protectedCustomerTabs = ['visit', 'mypets', 'bookings'];
    if (protectedCustomerTabs.includes(tab) && !currentUser) {
      setActiveTab('login');
      setErrorMsg('Please log in or create an account to book a visit and manage your pets and bookings.');
      return;
    }

    if (anchor && tab === activeTab) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    anchorRef.current = anchor || null;
    setActiveTab(tab);
  };

  useEffect(() => {
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0 });
  }, [activeTab]);

  const handleBook = () => navigate(currentUser ? 'visit' : 'login');
  const handleLogout = () => { 
    logoutUser(); 
    setIsProfileOpen(false);
    navigate('home'); 
  };

  const handleProfileUpdated = (updatedFields) => {
    setUserData((prev) => ({
      ...(prev || {}),
      ...updatedFields
    }));
  };

  const isAdmin = userData?.role === 'admin';
  const displayName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : (currentUser?.displayName || 'Customer');

  const authProps = {
    values: { email, password, firstName, lastName, phone },
    setters: { setEmail, setPassword, setFirstName, setLastName, setPhone },
    onGoogle: handleGoogleAuth,
    errorMsg,
    successMsg,
    remember,
    setRemember,
    onForgot: handleForgot,
    onBack: () => navigate('home'),
    onStaff: () => setSuccessMsg('Staff: log in with your admin account to open the dashboard.'),
  };

  if (activeTab === 'login' || activeTab === 'register') {
    const isLogin = activeTab === 'login';
    return (
      <AuthView
        key={activeTab}
        mode={activeTab}
        {...authProps}
        onSubmit={isLogin ? handleLogin : handleRegister}
        onSwitch={() => navigate(isLogin ? 'register' : 'login')}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Header
        activeTab={activeTab}
        currentUser={currentUser}
        displayName={displayName}
        isAdmin={isAdmin}
        onNavigate={navigate}
        onBook={handleBook}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1">
        {errorMsg && (
          <div role="alert" className="mx-auto mt-6 max-w-3xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div key={activeTab} className="page-enter">
          {activeTab === 'home' && <HomepageView onNavigate={navigate} onBook={handleBook} />}
          {activeTab === 'services' && <ServicesView onBook={handleBook} />}
          {activeTab === 'about' && <AboutView onNavigate={navigate} onBook={handleBook} />}
          {activeTab === 'admin' && (
            isAdmin ? (
              <AdminView adminName={displayName} />
            ) : (
              <EmptyState
                title="Staff only"
                text="This area is for Pawradise staff. Log in with an admin account to continue."
                action={currentUser ? 'Go to Customer Booking' : 'Staff log in'}
                onAction={() => navigate(currentUser ? 'visit' : 'login')}
              />
            )
          )}
          {activeTab === 'visit' && (
            <CustomerBookVisit
              currentUser={currentUser}
              userData={userData}
              onBookingSubmitted={() => navigate('bookings')}
              onCancel={() => navigate('home')}
            />
          )}
          {activeTab === 'mypets' && (
            <CustomerMyPets
              currentUser={currentUser}
              onBookForPet={(pet) => navigate('visit')}
            />
          )}
          {activeTab === 'bookings' && (
            <CustomerMyBookings
              currentUser={currentUser}
              onBookNew={() => navigate('visit')}
            />
          )}
        </div>
      </main>

      {/* User Profile & Logout Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        userData={userData}
        onProfileUpdated={handleProfileUpdated}
        onLogout={handleLogout}
      />

      <Footer onStaffLogin={() => navigate('login')} />
    </div>
  );
}
