import React, { useState, useEffect } from 'react';
import { subscribeUserPets, addUserPet, updateUserPet, removeUserPet } from '../firebase';
import { PetAvatar, CheckCircleIcon, PencilIcon, TrashIcon, CloseIcon } from './ui';

export default function CustomerMyPets({ currentUser, onBookForPet }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null); // null if adding new pet

  // Form fields
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [vaccinations, setVaccinations] = useState('Verified (Rabies, DHPP valid)');
  const [careNotes, setCareNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) {
      setPets([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeUserPets(currentUser.uid, (data) => {
      setPets(data || []);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  const handleOpenAddModal = () => {
    setEditingPet(null);
    setName('');
    setBreed('');
    setAge('');
    setWeight('');
    setGender('Male');
    setVaccinations('Verified (Rabies, DHPP valid)');
    setCareNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pet) => {
    setEditingPet(pet);
    setName(pet.name || '');
    setBreed(pet.breed || '');
    setAge(pet.age || '');
    setWeight(pet.weight || '');
    setGender(pet.gender || 'Male');
    setVaccinations(pet.vaccinations || 'Verified');
    setCareNotes(pet.careNotes || '');
    setIsModalOpen(true);
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);

    const petData = {
      name: name.trim(),
      breed: breed.trim(),
      age: age.trim(),
      weight: weight.trim(),
      gender,
      vaccinations: vaccinations.trim(),
      careNotes: careNotes.trim(),
      avatar: 'paw'
    };

    try {
      if (editingPet) {
        await updateUserPet(currentUser.uid, editingPet.id, petData);
      } else {
        await addUserPet(currentUser.uid, petData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving pet:", err);
      alert("Failed to save pet details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePet = async (pet) => {
    if (window.confirm(`Are you sure you want to delete ${pet.name}'s profile?`)) {
      try {
        await removeUserPet(currentUser.uid, pet.id);
      } catch (err) {
        console.error("Error deleting pet:", err);
        alert("Failed to delete pet. Please try again.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-forest">My Pets</h1>
          <p className="text-sm text-muted">Manage your pet profiles, care preferences, and vaccination records.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="rounded-xl bg-forest text-white px-4 py-2.5 text-xs font-bold shadow hover:bg-forest-dark transition flex items-center gap-1.5"
        >
          <span>+</span> Add new pet
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted">
          Loading your pets...
        </div>
      ) : pets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center space-y-4">
          <img src="/images/paws.jpg" alt="" aria-hidden="true" className="mx-auto h-20 w-20 object-contain mix-blend-multiply" />
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-forest">No pets added yet</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Add your dog or cat profile to easily book grooming and daycare appointments with custom care notes.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="rounded-xl bg-forest text-white px-5 py-2.5 text-xs font-bold shadow hover:bg-forest-dark transition"
          >
            + Add your first pet
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pets.map((pet) => (
            <div key={pet.id} className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-amber-100 overflow-hidden shrink-0">
                      <PetAvatar breed={pet.breed} className="h-full w-full" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-forest">{pet.name}</h2>
                      <p className="text-xs font-semibold text-muted">
                        {pet.breed || 'Pet'} {pet.gender ? `· ${pet.gender}` : ''} {pet.age ? `· ${pet.age}` : ''} {pet.weight ? `(${pet.weight})` : ''}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircleIcon size={11} /> Vaccinations Verified
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(pet)}
                      className="px-2.5 py-1.5 rounded-lg border border-line text-xs font-bold text-forest hover:bg-sage transition inline-flex items-center gap-1.5"
                      title="Edit Pet"
                    >
                      <PencilIcon size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet)}
                      className="p-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                      title="Delete Pet"
                      aria-label="Delete pet"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-sage/30 p-3 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-forest block">Vaccination status:</span>
                    <span className="text-muted">{pet.vaccinations || 'Verified'}</span>
                  </div>
                  {pet.careNotes && (
                    <div>
                      <span className="font-bold text-forest block">Groomer Care Notes:</span>
                      <span className="text-muted">{pet.careNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onBookForPet && onBookForPet(pet)}
                className="w-full rounded-xl bg-forest py-2.5 text-xs font-bold text-white hover:bg-forest-dark transition"
              >
                Book visit for {pet.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-serif text-xl font-bold text-forest">
                {editingPet ? `Edit ${editingPet.name}'s Profile` : 'Add a New Pet'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-forest"
                aria-label="Close"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePet} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-forest mb-1">Pet Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-line p-2.5 text-sm focus:border-forest focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest mb-1">Breed</label>
                  <input
                    type="text"
                    placeholder="e.g. Golden Retriever"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-line p-2.5 text-xs bg-white focus:border-forest focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest mb-1">Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 years"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">Weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-forest mb-1">Vaccination Info</label>
                <input
                  type="text"
                  placeholder="e.g. Rabies, 5-in-1 valid thru 2027"
                  value={vaccinations}
                  onChange={(e) => setVaccinations(e.target.value)}
                  className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest mb-1">Special Care Notes for Groomer</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Sensitive paws, prefers low dryer speed..."
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-forest focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-line flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-muted hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-forest text-white px-5 py-2 text-xs font-bold hover:bg-forest-dark transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingPet ? 'Update Pet' : 'Save Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
