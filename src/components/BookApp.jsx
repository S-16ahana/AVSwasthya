

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const symptomSpecialtyMap = {
  fever: ["General Physician", "Pediatrics", "Pathology", "Psychiatry", "Oncology"],
  cough: ["General Physician", "Pulmonology", "ENT", "Oncology", "Pathology"],
  chestpain: ["Cardiology", "Pulmonology", "Gastroenterology", "General Medicine", "Orthopedics"],
  acne: ["Dermatology", "Endocrinology", "Psychiatry", "Pathology"],
  skinrash: ["Dermatology", "Pediatrics", "Pathology", "Oncology"],
  headache: ["Neurology", "General Medicine", "Psychiatry", "ENT"],
  stomachache: ["Gastroenterology", "General Medicine", "Pediatrics", "Endocrinology"],
  toothache: ["Dentistry", "Pediatrics", "General Medicine"],
  pregnancy: ["Gynecology", "Pediatrics", "Nephrology"],
  anxiety: ["Psychiatry", "Endocrinology", "General Medicine"],
  bloodinurine: ["Nephrology", "Hematology", "Urology"],
  fatigue: ["General Medicine", "Endocrinology", "Oncology", "Psychiatry"],
  jointpain: ["Orthopedics", "General Medicine", "Endocrinology"]
};

const MultiStepForm = () => {
  const suggestedValues = {
    location: sessionStorage.getItem('suggestedLocation') || "",
    specialty: sessionStorage.getItem('suggestedSpecialty') || "",
    doctorType: sessionStorage.getItem('suggestedDoctorType') || "All",
    symptoms: sessionStorage.getItem('suggestedSymptoms') || ""
  };

  const [state, setState] = useState({
    consultationType: "Physical",symptoms: suggestedValues.symptoms,specialty: suggestedValues.specialty,specialties: [],selectedDoctor: null,doctors: [],filteredDoctors: [],
    cities: [],location: suggestedValues.location,doctorType: suggestedValues.doctorType,hospitalName: "",minPrice: "",maxPrice: "",selectedDate: '',selectedTime: '', fullAddress: '',showBookingModal: false,showConfirmationModal: false,isLoading: false,loadingCities: false
  });
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const scrollRef = useRef();
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, doctorsRes] = await Promise.all([
          fetch('https://countriesnow.space/api/v0.1/countries/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: 'India' })
          }).then(r => r.json()),
          axios.get("https://mocki.io/v1/7d33d5bc-8485-4059-b475-c6b62d5c3191")
        ]);

        const cities = citiesRes.data.filter(c => 
          ['Mumbai','Delhi','Bangalore','Hyderabad','Ahmedabad','Chennai','Kolkata','Pune','Jaipur','Surat','Lucknow','Kanpur','Nagpur','Indore','Bhopal'].includes(c)
        ).sort();

        updateState({ 
          cities, 
          doctors: doctorsRes.data,
          loadingCities: false 
        });

        if (suggestedValues.specialty && suggestedValues.doctorType === "AV Swasthya") {
          const filtered = doctorsRes.data.filter(d => 
            d.specialty === suggestedValues.specialty &&
            d.doctorType === "AV Swasthya" &&
            (suggestedValues.location ? d.location === suggestedValues.location : true)
          );
          updateState({ filteredDoctors: filtered });
        }

        if (suggestedValues.symptoms) {
          const val = suggestedValues.symptoms.toLowerCase().replace(/\s/g, "");
          updateState({ specialties: symptomSpecialtyMap[val] || [] });
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
    return () => {
      Object.keys(suggestedValues).forEach(key => 
        sessionStorage.removeItem(`suggested${key.charAt(0).toUpperCase() + key.slice(1)}`)
      );
    };
  }, []);

  useEffect(() => {
    const filtered = state.doctors.filter(d => 
      d.consultationType.toLowerCase() === state.consultationType.toLowerCase() &&
      d.specialty === state.specialty &&
      (state.consultationType !== "Physical" || d.location === state.location) &&
      (state.minPrice === "" || parseInt(d.fees) >= parseInt(state.minPrice)) &&
      (state.maxPrice === "" || parseInt(d.fees) <= parseInt(state.maxPrice)) &&
      (state.hospitalName === "" || d.hospital.toLowerCase().includes(state.hospitalName.toLowerCase())) &&
      (state.doctorType === "All" || d.doctorType === state.doctorType)
    );
    updateState({ filteredDoctors: filtered });
  }, [state.doctors, state.consultationType, state.specialty, state.location, state.minPrice, state.maxPrice, state.hospitalName, state.doctorType]);

  const handleLocationChange = e => {
    if (e.target.value === 'current-location') {
      if (!navigator.geolocation) return alert('Geolocation not supported');
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
          const data = await response.json();
          updateState({
            location: data.address.city || data.address.town || data.address.village || "",
            fullAddress: data.display_name || ""
          });
        } catch (error) {
          console.error("Location error:", error);
          alert("Failed to fetch location");
        }
      });
    } else {
      updateState({ location: e.target.value, fullAddress: '' });
    }
  };

  const handleSymptomsChange = e => {
    const val = e.target.value.toLowerCase().replace(/\s/g, "");
    updateState({ 
      symptoms: e.target.value,
      specialties: symptomSpecialtyMap[val] || [],
      specialty: ""
    });
  };

  const handlePayment = async () => {
    const userId = localStorage.getItem("userId");
    const payload = {
      userId,name: `${user?.firstName || "Guest"} ${user?.lastName || ""}`,phone: user?.phone || "N/A",email: user?.email,symptoms: state.symptoms,date: state.selectedDate,
      time: state.selectedTime,specialty: state.specialty,consultationType: state.consultationType,location: state.location,doctorId: state.selectedDoctor?.id || "N/A",doctorName: state.selectedDoctor?.name || "N/A",status: "Upcoming",
      notification: {
        doctorId: state.selectedDoctor?.id || "N/A",
        message: `New appointment with ${user?.firstName || "a patient"} on ${state.selectedDate} at ${state.selectedTime}. Symptoms: ${state.symptoms || "None"}. Location: ${state.location || "Not specified"}.`
      }
    };

    updateState({ isLoading: true, showBookingModal: false, showConfirmationModal: true });
    try {
      await Promise.all([
        axios.post("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book", payload),
        axios.post("https://67e631656530dbd3110f0322.mockapi.io/drnotifiy", payload.notification)
      ]);
      
      setTimeout(() => {
        updateState({
          showConfirmationModal: false,location: "",symptoms: "",selectedDate: "",selectedTime: "",specialty: "",specialties: [],selectedDoctor: null,consultationType: "Physical"});
        navigate("/dashboard/book-appointment");
      }, 100);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      updateState({ isLoading: false });
    }
  };

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  const getTimesForDate = (date) => state.selectedDoctor?.availability.find(slot => slot.date === date)?.times || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-[var(--color-surface)] rounded-2xl shadow-xl p-8">
        <h2 className="h2-heading ">Book an <span className="text-[var(--accent-color)]">Appointment</span></h2>
       <section className="mb-8"><h4 className="text-lg font-semibold mb-4 text-slate-700">Choose Consultation Type</h4><div className="flex gap-4">{["Physical", "Virtual"].map(type => <button key={type} onClick={() => updateState({ consultationType: type })} className={`px-6 py-3 rounded-xl  font-medium transition-all duration-200 ${state.consultationType === type ? "bg-slate-600 text-[var(--color-surface)] shadow-lg shadow-slate-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{type}</button>)}</div></section>
   <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div><label className="block  font-medium text-yy mb-2">Select Location</label><select value={state.location} onChange={handleLocationChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-400"><option value="">Select Location</option><option value="current-location">Use My Location</option>{state.loadingCities ? <option disabled>Loading cities...</option> : state.cities.map(city => <option key={city} value={city}>{city}</option>)}</select>{state.location && state.location !== "current-location" && <p className="paragraph">Selected Location: {state.location}</p>}</div>
  <div><label className="block font-medium text-slate-700 mb-2">Search Dr by Hospital Name</label><input type="text" placeholder="Enter hospital name" value={state.hospitalName} onChange={(e) => updateState({ hospitalName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-400" /></div>
</section>
       <section className="mb-8"><label className="block  font-medium text-slate-700 mb-2">Describe your symptoms</label><input type="text" placeholder="e.g. Fever, Cough..." value={state.symptoms} onChange={handleSymptomsChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-400" /></section>
        {state.specialties.length > 0 && <section className="mb-8"><h4 className="text-lg font-semibold mb-4 text-slate-700">Suggested Specialties</h4><div className="flex flex-wrap gap-3">{state.specialties.map(spec => <button key={spec} onClick={() => updateState({ specialty: spec })} className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${state.specialty === spec ? "bg-slate-600 text-[var(--color-surface)] shadow-lg shadow-slate-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{spec}</button>)}</div></section>}
        <section className="mb-8">
          <h4 className="text-lg font-semibold mb-4 text-slate-700">Doctor Type</h4>
          <div className="flex flex-wrap gap-3">
            {["All", "Hospital Associated", "AV Swasthya", "Freelancer"].map(type => (
              <button key={type} onClick={() => updateState({ doctorType: type })}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  state.doctorType === type
                    ? "bg-slate-600 text-[var(--color-surface)] shadow-lg shadow-slate-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* Price Range */}
       <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"><div><label className="block text-sm font-medium text-slate-700 mb-2">Minimum Fees (₹)</label><input type="number" placeholder="e.g. 300" value={state.minPrice} onChange={(e) => updateState({ minPrice: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-400" /></div><div><label className="block font-medium text-slate-700 mb-2">Maximum Fees (₹)</label><input type="number" placeholder="e.g. 1000" value={state.maxPrice} onChange={(e) => updateState({ maxPrice: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-400" /></div></section>
        <section className="relative">
          <h4 className="text-lg font-semibold mb-4 text-slate-700">Available Doctors</h4>
          {state.filteredDoctors.length > 0 ? (
            <div className="relative">
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                {state.filteredDoctors.map(doc => (
                  <div key={doc.id} onClick={() => updateState({ selectedDoctor: doc, showBookingModal: true })}
                    className="min-w-[280px] p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all duration-200 cursor-pointer bg-[var(--color-surface)] flex gap-4 items-start">
                    <img src={doc.image || "/default-doctor.png"} alt={doc.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-300" />
                    <div>
                      <h5 className="text-lg font-semibold text-slate-800 mb-1">{doc.name}</h5>
                      <p className="paragraph">{doc.specialty}</p>
                      <p className="paragraph">₹{doc.fees}</p>
                      <div >
                        <p className="paragraph">{doc.location || 'N/A'}</p>
                        <p className="paragraph">{doc.doctorType}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--color-surface)] shadow-lg hover:bg-slate-50">
                <FaChevronLeft className="text-slate-600" size={20} />
              </button>
              <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--color-surface)] shadow-lg hover:bg-slate-50">
                <FaChevronRight className="text-slate-600" size={20} />
              </button>
            </div>
          ) : (
            <p className="paragraph">No doctors match the selected filters.</p>
          )}
        </section>
      </div>

      {/* Booking Modal */}
    {state.showBookingModal && state.selectedDoctor && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"><div className="bg-[var(--color-surface)] rounded-2xl p-8 w-full max-w-md shadow-2xl"><button onClick={() => updateState({ showBookingModal: false })} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-xl">×</button><div className="text-center mb-6"><h2 className="h2-heading">{state.selectedDoctor.name}</h2><p className="paragraph">{state.selectedDoctor.specialty} • {state.selectedDoctor.qualification}</p><p className="paragraph">{state.selectedDoctor.experience} years experience</p><p className="text-slate-600 font-medium mt-2">₹{state.selectedDoctor.fees}</p></div><div className="space-y-4"><div><label className="block  font-medium text-slate-700 mb-2">Select Date</label><select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-400" value={state.selectedDate} onChange={(e) => updateState({ selectedDate: e.target.value, selectedTime: '' })}><option value="">Choose a Date</option>{state.selectedDoctor.availability?.map(slot => (<option key={slot.date} value={slot.date}>{slot.date}</option>))}</select></div>{state.selectedDate && (<div><label className="block  font-medium text-slate-700 mb-2">Available Time Slots</label><div className="grid grid-cols-3 gap-2">{getTimesForDate(state.selectedDate).map(time => {const isBooked = state.selectedDoctor.bookedSlots?.some(slot => slot.date === state.selectedDate && slot.time === time);const isSelected = state.selectedTime === time;return (
      <button key={time} disabled={isBooked} onClick={() => updateState({ selectedTime: time })} className={`py-2 px-3 rounded-xl  font-medium transition-all duration-200 ${isBooked ? "bg-red-100 text-red-500 border border-red-300 cursor-not-allowed" : isSelected ? "bg-green-600 text-[var(--color-surface)] border border-green-700 shadow" : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"}`}>{time}</button>);})}</div></div>)}
   <div className="flex justify-center">
  <button onClick={handlePayment} disabled={!state.selectedDate || !state.selectedTime || state.isLoading} className={`btn ${!state.selectedDate || !state.selectedTime || state.isLoading ? "btn-disabled" : "btn-primary hover:bg-slate-700"}`}>
    {state.isLoading ? "Processing..." : "Confirm Booking"}
  </button>
</div>

</div></div></div>)}
      {state.showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface)] rounded-2xl p-8 w-full max-w-sm text-center">
            <h3 className="h3-heading">Booking Confirmed!</h3>
            <p className="paragraph">Your appointment has been successfully scheduled.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;