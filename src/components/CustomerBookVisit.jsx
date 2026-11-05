import React, { useState, useEffect } from 'react';
import { addBooking, subscribeUserPets, addUserPet } from '../firebase';
import { PawIcon, ArrowRight, ArrowLeft, CheckIcon, UploadIcon, CloseIcon, ClockIcon, FileIcon, AlertIcon } from './ui';

export default function CustomerBookVisit({ currentUser, onBookingSubmitted, onCancel }) {
  const [step, setStep] = useState(1); // 1: Choose visit, 2: Payment & proof, 3: Success/Status
  
  // Real-time user pets
  const [userPets, setUserPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  // Quick Add Pet Inline Form State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetCareNotes, setNewPetCareNotes] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeUserPets(currentUser.uid, (data) => {
      setUserPets(data || []);
      if (data && data.length > 0 && !selectedPet) {
        setSelectedPet(data[0]);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  // Service selection
  const [serviceType, setServiceType] = useState('grooming'); // 'grooming' or 'daycare'
  const [groomingPackage, setGroomingPackage] = useState({ name: 'The Full Groom', duration: '90 min', price: 570 });
  const [daycareOption, setDaycareOption] = useState({ name: 'Half-day daycare', duration: '4 hours', price: 200 });
  const [addTeethBrushing, setAddTeethBrushing] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState('2026-11-05');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const presetTimeSlots = ['9:00 AM', '10:00 AM', '1:00 PM', '2:30 PM'];
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');
  
  // Step 2 state
  const [discountCode, setDiscountCode] = useState('WELCOME10');
  const [discountApplied, setDiscountApplied] = useState(true);
  const [receiptFile, setReceiptFile] = useState(''); // file name shown to the customer
  const [receiptError, setReceiptError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
  const ALLOWED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);

  // Quick Add Pet handler
  const handleQuickAddPet = async (e) => {
    e.preventDefault();
    if (!newPetName.trim()) return;
    
    const newPetData = {
      name: newPetName.trim(),
      breed: newPetBreed.trim() || 'Dog',
      careNotes: newPetCareNotes.trim(),
      vaccinations: 'Verified',
      avatar: 'paw'
    };

    try {
      const res = await addUserPet(currentUser?.uid, newPetData);
      const addedPetObj = { id: res.key, ...newPetData };
      setSelectedPet(addedPetObj);
      setNewPetName('');
      setNewPetBreed('');
      setNewPetCareNotes('');
      setIsQuickAddOpen(false);
    } catch (err) {
      console.error("Error adding pet:", err);
      alert("Failed to add pet. Please try again.");
    }
  };

  // Calculations
  const basePrice = serviceType === 'grooming' ? groomingPackage.price : daycareOption.price;
  const addonPrice = (serviceType === 'grooming' && addTeethBrushing) ? 70 : 0;
  const subtotal = basePrice + addonPrice;
  const discountAmount = discountApplied ? subtotal * 0.10 : 0;
  const totalAfterDiscount = subtotal - discountAmount;
  const requiredDownpayment = Math.round(totalAfterDiscount * 0.50);
  const balanceAtVisit = totalAfterDiscount - requiredDownpayment;

  const processReceipt = (file) => {
    if (!file) return;
    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
      setReceiptFile('');
      setReceiptError('Please upload a JPG, PNG or PDF of your payment receipt.');
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setReceiptFile('');
      setReceiptError('That file is larger than 5 MB. Please upload a smaller one.');
      return;
    }
    setReceiptError('');
    setReceiptFile(file.name);
  };

  const handleFileUpload = (e) => {
    processReceipt(e.target.files && e.target.files[0]);
    e.target.value = ''; // lets the same file be re-selected after removing it
  };

  const handleReceiptDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processReceipt(e.dataTransfer.files && e.dataTransfer.files[0]);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile('');
    setReceiptError('');
  };

  const handleSubmitBooking = async () => {
    if (!selectedPet) {
      alert("Please select or add a pet before submitting your booking.");
      return;
    }
    if (!selectedTime || !selectedTime.trim()) {
      alert("Please enter or select a valid visit time.");
      return;
    }
    if (!receiptFile) {
      setReceiptError('Please upload your payment receipt before submitting your booking.');
      return;
    }
    setIsSubmitting(true);
    const newBooking = {
      bookingCode: `PC-${Math.floor(1000 + Math.random() * 9000)}`,
      customerUid: currentUser?.uid || '',
      customerName: currentUser?.displayName || 'Pet Parent',
      customerEmail: currentUser?.email || '',
      dogName: selectedPet.name,
      breed: selectedPet.breed || 'Dog',
      service: `${serviceType === 'grooming' ? groomingPackage.name : daycareOption.name}${addTeethBrushing ? ' + teeth brushing' : ''}`,
      visitDate: selectedDate,
      visitTime: selectedTime.trim(),
      subtotal,
      discountAmount,
      totalAmount: totalAfterDiscount,
      downpaymentAmount: requiredDownpayment,
      balanceDue: balanceAtVisit,
      receiptFileName: receiptFile,
      status: 'waiting',
      paymentProofStatus: 'awaiting verification',
      careNotes: selectedPet.careNotes || '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await addBooking(newBooking);
      setCreatedBookingId(res.key);
      setIsSubmitting(false);
      setStep(3);
      if (onBookingSubmitted) onBookingSubmitted(newBooking);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert("Error submitting booking. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Wizard Progress Bar */}
      <div className="mb-8 flex items-center justify-between rounded-xl bg-sage/80 p-3 text-xs font-medium text-forest">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'font-bold text-forest' : 'text-muted'}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step > 1 ? 'bg-forest text-white' : 'bg-forest/20 text-forest'}`}>
            {step > 1 ? <CheckIcon size={13} /> : '1'}
          </span>
          <span>Choose a visit</span>
        </div>
        <ArrowRight size={14} className="text-line" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'font-bold text-forest' : 'text-muted'}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step > 2 ? 'bg-forest text-white' : step === 2 ? 'bg-forest text-white' : 'bg-forest/20 text-forest'}`}>
            {step > 2 ? <CheckIcon size={13} /> : '2'}
          </span>
          <span>Payment & proof</span>
        </div>
        <ArrowRight size={14} className="text-line" />
        <div className={`flex items-center gap-2 ${step === 3 ? 'font-bold text-forest' : 'text-muted'}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step === 3 ? 'bg-forest text-white' : 'bg-forest/20 text-forest'}`}>
            3
          </span>
          <span>Booking status</span>
        </div>
      </div>

      {/* STEP 1: Choose Visit */}
      {step === 1 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <h1 className="font-serif text-3xl text-forest">Book a visit</h1>
            <p className="text-sm text-muted">Choose a pet, service, date and time for your visit.</p>

            {/* Select Pet */}
            <div className="rounded-xl border border-line bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-forest">Select pet</h2>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                  className="text-xs font-bold text-forest hover:underline"
                >
                  {isQuickAddOpen ? 'Cancel' : '+ Add pet'}
                </button>
              </div>

              {/* Inline Quick Add Pet */}
              {isQuickAddOpen && (
                <form onSubmit={handleQuickAddPet} className="rounded-xl border border-line bg-sage/20 p-4 space-y-3 text-xs">
                  <div className="font-bold text-forest">Add a pet to your account</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-muted mb-0.5">Pet Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Max"
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        className="w-full rounded-md border border-line p-2 text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-0.5">Breed</label>
                      <input
                        type="text"
                        placeholder="e.g. Poodle"
                        value={newPetBreed}
                        onChange={(e) => setNewPetBreed(e.target.value)}
                        className="w-full rounded-md border border-line p-2 text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-muted mb-0.5">Grooming Care Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Sensitive ears, low dryer setting"
                      value={newPetCareNotes}
                      onChange={(e) => setNewPetCareNotes(e.target.value)}
                      className="w-full rounded-md border border-line p-2 text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-forest text-white py-2 text-xs font-bold hover:bg-forest-dark"
                  >
                    Save & Select Pet
                  </button>
                </form>
              )}

              {userPets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs space-y-2">
                  <p className="text-muted">You haven't added any pets yet.</p>
                  {!isQuickAddOpen && (
                    <button
                      type="button"
                      onClick={() => setIsQuickAddOpen(true)}
                      className="rounded-lg bg-forest text-white px-3 py-1.5 text-xs font-bold"
                    >
                      + Click here to add a pet
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userPets.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setSelectedPet(pet)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selectedPet?.id === pet.id ? 'border-forest bg-sage/40 ring-1 ring-forest' : 'border-line hover:border-forest/30'}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-forest shrink-0">
                        <PawIcon size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-forest">{pet.name}</div>
                        <div className="text-xs text-muted">{pet.breed || 'Pet'} {pet.weight ? `· ${pet.weight}` : ''}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Select Service */}
            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-forest mb-3">Select service</h2>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setServiceType('grooming')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${serviceType === 'grooming' ? 'bg-forest text-white' : 'bg-sage/60 text-forest'}`}
                >
                  Grooming
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('daycare')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${serviceType === 'daycare' ? 'bg-forest text-white' : 'bg-sage/60 text-forest'}`}
                >
                  Daycare
                </button>
              </div>

              {serviceType === 'grooming' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Grooming package</label>
                    <select
                      value={groomingPackage.name}
                      onChange={(e) => {
                        const pkgs = [
                          { name: 'The Freshen Up', duration: '60 min', price: 400 },
                          { name: 'The Tidy Up', duration: '60 min', price: 500 },
                          { name: 'The Full Groom', duration: '90 min', price: 570 },
                        ];
                        setGroomingPackage(pkgs.find(p => p.name === e.target.value));
                      }}
                      className="w-full rounded-lg border border-line p-2.5 text-sm bg-white focus:border-forest focus:outline-none"
                    >
                      <option value="The Freshen Up">The Freshen Up · 60 min · ₱400</option>
                      <option value="The Tidy Up">The Tidy Up · 60 min · ₱500</option>
                      <option value="The Full Groom">The Full Groom · 90 min · ₱570</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={addTeethBrushing}
                      onChange={(e) => setAddTeethBrushing(e.target.checked)}
                      className="h-4 w-4 rounded accent-forest"
                    />
                    <span>Add teeth brushing (+₱70)</span>
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Daycare option</label>
                  <select
                    value={daycareOption.name}
                    onChange={(e) => {
                      const opts = [
                        { name: 'Half-day daycare', duration: '4 hours', price: 200 },
                        { name: 'Full-day daycare', duration: '8 hours', price: 550 },
                        { name: 'Five-day pass', duration: '5 days', price: 2700 }
                      ];
                      setDaycareOption(opts.find(o => o.name === e.target.value));
                    }}
                    className="w-full rounded-lg border border-line p-2.5 text-sm bg-white focus:border-forest focus:outline-none"
                  >
                    <option value="Half-day daycare">Half-day daycare · 4 hrs · ₱200</option>
                    <option value="Full-day daycare">Full-day daycare · 8 hrs · ₱550</option>
                    <option value="Five-day pass">Five-day pass · 5 days · ₱2,700</option>
                  </select>
                </div>
              )}
            </div>

            {/* Select Date & Time */}
            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-forest mb-3">Select date & time</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-line p-2.5 text-sm bg-white focus:border-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Available time slots</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {presetTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedTime(slot);
                          setIsCustomTime(false);
                        }}
                        className={`rounded-lg border py-2 text-xs font-semibold transition ${!isCustomTime && selectedTime === slot ? 'border-forest bg-forest text-white' : 'border-line text-ink hover:border-forest'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-line/60">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTime(true);
                        const val = customTimeInput || '11:30 AM';
                        setCustomTimeInput(val);
                        setSelectedTime(val);
                      }}
                      className={`w-full rounded-lg border py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${isCustomTime ? 'border-forest bg-forest text-white' : 'border-line text-forest bg-sage/30 hover:bg-sage'}`}
                    >
                      <span>⏱️</span> {isCustomTime ? 'Custom time selected' : '+ Enter custom time'}
                    </button>

                    {isCustomTime && (
                      <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-semibold text-forest">Specify preferred time:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. 11:30 AM, 4:00 PM"
                            value={customTimeInput}
                            onChange={(e) => {
                              setCustomTimeInput(e.target.value);
                              setSelectedTime(e.target.value);
                            }}
                            className="w-full rounded-lg border border-line p-2 text-xs bg-white focus:border-forest focus:outline-none"
                          />
                          <input
                            type="time"
                            onChange={(e) => {
                              if (e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                let h = parseInt(hours, 10);
                                const ampm = h >= 12 ? 'PM' : 'AM';
                                h = h % 12 || 12;
                                const formatted = `${h}:${minutes} ${ampm}`;
                                setCustomTimeInput(formatted);
                                setSelectedTime(formatted);
                              }
                            }}
                            className="rounded-lg border border-line p-2 text-xs bg-white focus:border-forest focus:outline-none cursor-pointer"
                            title="Pick exact time"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h3 className="font-serif text-lg text-forest mb-4">Booking summary</h3>
              <div className="flex items-center gap-3 border-b border-line pb-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-forest shrink-0"><PawIcon size={20} /></div>
                <div>
                  <div className="font-bold text-sm text-forest">
                    {selectedPet ? selectedPet.name : 'No pet selected'}
                  </div>
                  <div className="text-xs text-muted">
                    {selectedPet ? `${selectedPet.breed || 'Pet'} ${selectedPet.weight ? `· ${selectedPet.weight}` : ''}` : 'Please choose a pet'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-b border-line pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted">{serviceType === 'grooming' ? groomingPackage.name : daycareOption.name}</span>
                  <span className="font-semibold text-ink">₱{basePrice.toFixed(2)}</span>
                </div>
                {addTeethBrushing && serviceType === 'grooming' && (
                  <div className="flex justify-between">
                    <span className="text-muted">Teeth brushing</span>
                    <span className="font-semibold text-ink">₱70.00</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-line/60">
                  <span>Subtotal</span>
                  <span className="text-forest">₱{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-sage/50 p-3 text-xs text-forest mb-5">
                <div className="font-semibold mb-1">{selectedDate}</div>
                <div className="text-muted">{selectedTime} - Malolos, Bulacan</div>
              </div>

              {selectedPet?.careNotes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 mb-5">
                  <span className="font-semibold block mb-0.5">Care notes:</span>
                  {selectedPet.careNotes}
                </div>
              )}

              <button
                type="button"
                disabled={!selectedPet || !selectedTime}
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-forest py-3 text-xs font-bold text-white shadow hover:bg-forest-dark transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Continue to payment <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Payment & Proof */}
      {step === 2 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to visit details
            </button>
            <h1 className="font-serif text-3xl text-forest">Payment & proof</h1>
            <p className="text-sm text-muted">Apply your discount, send your downpayment and upload your receipt.</p>

            {/* Discount Code */}
            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-forest mb-3">Discount</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="rounded-lg border border-line px-3 py-2 text-xs uppercase font-mono w-48 focus:border-forest focus:outline-none"
                  placeholder="PROMOCODE"
                />
                <button
                  type="button"
                  onClick={() => setDiscountApplied(discountCode.trim() === 'WELCOME10')}
                  className="px-4 py-2 rounded-lg bg-sage text-forest text-xs font-semibold hover:bg-sage/80"
                >
                  Apply
                </button>
              </div>
              {discountApplied && (
                <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5"><CheckIcon size={13} /> Applied · 10% off your first visit. Saved ₱{discountAmount.toFixed(2)}</p>
              )}
            </div>

            {/* Bank Transfer Details */}
            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-forest mb-2">Send your 50% downpayment</h2>
              <p className="text-xs text-muted mb-4">Pay ₱{requiredDownpayment.toFixed(2)} now. The remaining ₱{balanceAtVisit.toFixed(2)} is due at your visit.</p>

              <div className="rounded-xl bg-sage/40 border border-line p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Bank / E-Wallet:</span>
                  <span className="font-bold text-forest">Willow Bank / GCash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Account name:</span>
                  <span className="font-bold text-forest">Pawradise Grooming</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Account number:</span>
                  <span className="font-mono font-bold text-forest">000 118 2048</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Exact amount to send:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">₱{requiredDownpayment.toFixed(2)} PHP</span>
                </div>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-forest mb-3">Upload your payment receipt</h2>
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleReceiptDrop}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition ${
                  isDragging ? 'border-forest bg-sage/50' : receiptError ? 'border-rose-300 bg-rose-50/40' : 'border-line bg-sage/20 hover:border-forest/50'
                }`}
              >
                <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileUpload} className="hidden" />
                <div className="h-10 w-10 rounded-full bg-sage flex items-center justify-center text-forest mb-2"><UploadIcon size={18} /></div>
                <span className="text-xs font-semibold text-forest mb-1">Choose a file or drag it here</span>
                <span className="text-[11px] text-muted">JPG, PNG or PDF · Up to 5 MB</span>
              </label>

              {receiptError && (
                <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                  <AlertIcon size={14} /> {receiptError}
                </p>
              )}

              {receiptFile && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileIcon size={16} className="text-emerald-700 shrink-0" />
                    <span className="font-semibold text-emerald-950 truncate">{receiptFile}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">Uploaded</span>
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="text-emerald-800/70 hover:text-emerald-950"
                      aria-label="Remove receipt"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Payment Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h3 className="font-serif text-lg text-forest mb-4">Payment summary</h3>

              <div className="space-y-2 text-xs border-b border-line pb-4 mb-4">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>WELCOME10 · 10%</span>
                    <span>-₱{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-line/60">
                  <span>Total after discount</span>
                  <span className="text-forest">₱{totalAfterDiscount.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-forest/5 p-4 text-xs space-y-2 mb-5 border border-forest/10">
                <div className="flex justify-between font-bold text-forest text-sm">
                  <span>Required Now (50%)</span>
                  <span>₱{requiredDownpayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted pt-1 border-t border-forest/10">
                  <span>Balance at visit</span>
                  <span>₱{balanceAtVisit.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting || !receiptFile}
                onClick={handleSubmitBooking}
                className="w-full rounded-xl bg-forest py-3 text-xs font-bold text-white shadow hover:bg-forest-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting request...' : 'Submit booking request'}
              </button>
              {!receiptFile && (
                <p className="mt-2 text-center text-[11px] text-muted">Upload your payment receipt to submit your booking.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Booking Status Banner & Tracker */}
      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-forest text-white mx-auto flex items-center justify-center mb-3"><CheckIcon size={24} /></div>
            <h1 className="font-serif text-2xl text-forest font-bold mb-2">We have your request!</h1>
            <p className="text-xs text-emerald-950 max-w-md mx-auto leading-relaxed">
              Your visit request for <strong>{selectedPet?.name}</strong> is submitted. Our team is verifying your payment proof and visit details.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Booking Reference</span>
                <h2 className="font-serif text-xl font-bold text-forest">{selectedPet?.name}'s {serviceType === 'grooming' ? groomingPackage.name : daycareOption.name}</h2>
                <p className="text-xs text-muted mt-0.5">{selectedDate} · {selectedTime} · Pawradise Malolos</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                Waiting in Queue
              </span>
            </div>

            {/* Live Progress Tracker */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-forest mb-4">Visit progress tracker</h3>
              <ol className="relative border-l-2 border-emerald-200 ml-3 space-y-6">
                <li className="ml-6">
                  <span className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-forest text-white flex items-center justify-center"><CheckIcon size={11} /></span>
                  <h4 className="text-xs font-bold text-forest">Booking request & receipt received</h4>
                  <p className="text-[11px] text-muted">Uploaded {receiptFile}</p>
                </li>
                <li className="ml-6">
                  <span className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center"><ClockIcon size={11} /></span>
                  <h4 className="text-xs font-bold text-amber-900">Waiting for grooming session</h4>
                  <p className="text-[11px] text-muted">Checking receipt verification and staff availability</p>
                </li>
                <li className="ml-6 opacity-50">
                  <span className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center font-bold">3</span>
                  <h4 className="text-xs font-bold text-gray-700">Visit confirmation</h4>
                  <p className="text-[11px] text-muted">Confirmation notification will be sent here</p>
                </li>
              </ol>
            </div>

            <div className="pt-4 border-t border-line flex justify-between items-center">
              <button
                onClick={() => { setReceiptFile(''); setReceiptError(''); setCreatedBookingId(null); setStep(1); }}
                className="text-xs font-semibold text-forest hover:underline"
              >
                + Book another visit
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-forest text-white text-xs font-bold hover:bg-forest-dark"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
