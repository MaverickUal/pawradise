import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getDatabase, ref, set, get, child, onValue, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCBbTFOR85AC0yfjidsKtigPFaFvFIXyzM",
  authDomain: "pawradise-awa.firebaseapp.com",
  databaseURL: "https://pawradise-awa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pawradise-awa",
  storageBucket: "pawradise-awa.firebasestorage.app",
  messagingSenderId: "81999333946",
  appId: "1:81999333946:web:c0cc7848c2083170c3c303",
  measurementId: "G-FTSWWTNL2S"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithEmail = async (email, password, remember = true) => {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  return signInWithEmailAndPassword(auth, email, password);
};

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const registerWithEmail = async (email, password, firstName, lastName, phone) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await set(ref(db, `users/${user.uid}`), {
    firstName,
    lastName,
    email,
    phone,
    role: 'customer',
    createdAt: new Date().toISOString()
  });
  return user;
};

export const loginWithGoogle = async () => {
  await signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        const nameParts = (user.displayName || '').split(' ');
        await set(userRef, {
          firstName: nameParts[0] || 'Pet',
          lastName: nameParts.slice(1).join(' ') || 'Parent',
          email: user.email,
          phone: user.phoneNumber || '',
          role: 'customer',
          createdAt: new Date().toISOString()
        });
      }
      return user;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const logoutUser = () => signOut(auth);

// ---- Real-time Grooming & Daycare Bookings ----

// Admin subscription: admins can read the complete bookings collection.
export const subscribeBookings = (onData, onError) =>
  onValue(
    ref(db, 'bookings'),
    (snap) => {
      const val = snap.val() || {};
      onData(Object.entries(val).map(([id, booking]) => ({ id, ...booking })));
    },
    onError
  );

// Customer subscription: query only bookings owned by the signed-in customer.
// This query must match the database rules on /bookings.
export const subscribeCustomerBookings = (uid, onData, onError) => {
  if (!uid) {
    onData([]);
    return () => {};
  }

  const customerBookingsQuery = query(
    ref(db, 'bookings'),
    orderByChild('customerUid'),
    equalTo(uid)
  );

  return onValue(
    customerBookingsQuery,
    (snap) => {
      const val = snap.val() || {};
      onData(Object.entries(val).map(([id, booking]) => ({ id, ...booking })));
    },
    onError
  );
};

export const addBooking = (booking) =>
  push(ref(db, 'bookings'), {
    ...booking,
    status: 'waiting',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

export const setBookingStatus = (id, status, by) =>
  update(ref(db, `bookings/${id}`), { status, updatedAt: Date.now(), updatedBy: by || null });

export const removeBooking = (id) => remove(ref(db, `bookings/${id}`));

export const listenToBookings = subscribeBookings;

// ---- Real-time User Pets ----
export const subscribeUserPets = (uid, onData, onError) => {
  if (!uid) {
    onData([]);
    return () => {};
  }
  return onValue(
    ref(db, `users/${uid}/pets`),
    (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([id, p]) => ({ id, ...p }));
      onData(list);
    },
    onError
  );
};

export const addUserPet = (uid, petData) => {
  if (!uid) return Promise.reject(new Error("User not logged in"));
  return push(ref(db, `users/${uid}/pets`), {
    ...petData,
    createdAt: Date.now()
  });
};

export const removeUserPet = (uid, petId) => {
  if (!uid || !petId) return Promise.reject(new Error("Invalid request"));
  return remove(ref(db, `users/${uid}/pets/${petId}`));
};

export const updateUserPet = (uid, petId, petData) => {
  if (!uid || !petId) return Promise.reject(new Error("Invalid request"));
  return update(ref(db, `users/${uid}/pets/${petId}`), {
    ...petData,
    updatedAt: Date.now()
  });
};

export const updateUserProfile = (uid, profileData) => {
  if (!uid) return Promise.reject(new Error("Invalid user ID"));
  return update(ref(db, `users/${uid}`), {
    ...profileData,
    updatedAt: new Date().toISOString()
  });
};
