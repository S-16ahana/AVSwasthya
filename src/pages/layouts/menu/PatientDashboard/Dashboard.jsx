import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CircleUser, Heart, Users, ClipboardCheck, Pencil } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import DashboardOverview from './DashboardOverview';
import ReusableModal from '../../../../components/microcomponents/Modal';

const API_BASE_URL = 'https://680cc0c92ea307e081d4edda.mockapi.io';
const FAMILY_API_URL = 'https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData';

const initialUserData = {
  name: '', email: '', gender: '', phone: '', dob: '', bloodGroup: '', height: '', weight: '',
  isAlcoholic: false, isSmoker: false, isTobaccoUser: false, smokingDuration: '', alcoholDuration: '', tobaccoDuration: '', allergies: '', surgeries: '',
  familyHistory: { diabetes: false, cancer: false, heartDisease: false, mentalHealth: false, disability: false },
  familyMembers: [], additionalDetails: { provider: '', policyNumber: '', coverageType: '', startDate: '', endDate: '', coverageAmount: '', primaryHolder: false }
};

const defaultFamilyMember = { name: '', relation: '', number: '', diseases: [], email: '' };

const getProgressColor = (completion) =>
  completion <= 33 ? '#ef4444' : completion <= 67 ? '#f59e42' : completion < 100 ? '#facc15' : '#22c55e';

function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [activeSection, setActiveSection] = useState('basic');
  const [showModal, setShowModal] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMode, setModalMode] = useState('edit');
  const [modalData, setModalData] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(25);
  const [feedbackMessage, setFeedbackMessage] = useState({ show: false, message: '', type: '' });
  const [editFamilyMember, setEditFamilyMember] = useState(null);

 const personalFields = [
  { name: 'height', label: 'Height (cm)', type: 'number', colSpan: 1 },
  { name: 'weight', label: 'Weight (kg)', type: 'number', colSpan: 1 },
  { name: 'bloodGroup', label: 'Blood Group', type: 'select', colSpan: 1, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => ({ label: bg, value: bg })) },
  { name: 'surgeries', label: 'Surgeries', type: 'textarea', colSpan: 1 },
  { name: 'allergies', label: 'Allergies', type: 'textarea', colSpan: 2 },
  { name: 'isSmoker', label: 'Do you smoke?', type: 'checkbox', colSpan: 1 },
  { name: 'smokingDuration', label: 'If yes, for how long (in years)?', type: 'number', colSpan: 2 },
  { name: 'isAlcoholic', label: 'Do you consume alcohol?', type: 'checkbox', colSpan: 1 },
  { name: 'alcoholDuration', label: 'If yes, for how long (in years)?', type: 'number', colSpan: 2 },
  { name: 'isTobaccoUser', label: 'Do you use tobacco?', type: 'checkbox', colSpan: 1 },
  { name: 'tobaccoDuration', label: 'If yes, for how long (in years)?', type: 'number', colSpan: 2 }
];
  const familyFields = [
    { name: 'relation', label: 'Relation', type: 'select', colSpan: 1, options: ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister'].map(r => ({ label: r, value: r })) },
    { name: 'name', label: 'Name', type: 'text', colSpan: 2 },
    { name: 'number', label: 'Phone Number', type: 'text', colSpan: 1 },
    {
      name: 'diseases', label: 'Health Conditions', type: 'multiselect', colSpan: 2, options: [
        'Diabetes', 'Hypertension', 'Cancer', 'Heart Disease', 'Asthma', 'Stroke',
        "Alzheimer's", 'Arthritis', 'Depression', 'Chronic Kidney Disease',
        'Osteoporosis', 'Liver Disease', 'Thyroid Disorders'
      ].map(d => ({ label: d, value: d }))
    }
  ];

  const additionalFields = [
    { name: 'provider', label: 'Insurance Provider', type: 'text', colSpan: 2 },
    { name: 'policyNumber', label: 'Policy Number', type: 'text', colSpan: 1 },
    {
      name: 'coverageType', label: 'Coverage Type', type: 'select', colSpan: 1, options: [
        'Individual', 'Family', 'Group', 'Senior Citizen', 'Critical Illness', 'Accident'
      ].map(t => ({ label: t, value: t }))
    },
    { name: 'coverageAmount', label: 'Coverage Amount', type: 'number', colSpan: 1 },
     { name: 'primaryHolder', label: 'Primary Holder', type: 'radio', colSpan: 1, options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }] },
    { name: 'startDate', label: 'Start Date', type: 'date', colSpan: 1.5 },
    { name: 'endDate', label: 'End Date', type: 'date', colSpan: 1.5 },
   
  ];

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage({ show: true, message, type });
    setTimeout(() => setFeedbackMessage({ show: false, message: '', type: '' }), 3000);
  };

  const handleEditClick = () => navigate('/dashboard/settings');
  const handleGenerateCard = () => navigate("/healthcard");

const getSectionCompletionStatus = () => ({
  basic: true,
  personal: Boolean(userData.height && userData.weight && userData.bloodGroup),
  family: Array.isArray(userData.familyMembers) && userData.familyMembers.length > 0
});
  const saveUserData = async (updatedData) => {
    if (!user?.email) return showFeedback('Please login to save data', 'error');
    const payload = { ...updatedData, email: user.email, name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim() };
    try {
      if (!updatedData.id) {
        const res = await axios.post(`${API_BASE_URL}/personalHealthDetails`, payload);
        const saved = { ...updatedData, id: res.data.id, email: user.email };
        setUserData(saved);
        localStorage.setItem('userData', JSON.stringify(saved));
      } else {
        await axios.put(`${API_BASE_URL}/personalHealthDetails/${updatedData.id}`, payload);
        setUserData(updatedData);
        localStorage.setItem('userData', JSON.stringify(updatedData));
      }
      showFeedback('Data saved successfully');
      return true;
    } catch {
      showFeedback('Failed to save data', 'error');
      return false;
    }
  };

  const openModal = (section, data = null) => {
    setActiveSection(section);
    setShowModal(true);
    setModalMode(data && section === 'family' ? 'edit' : 'edit');
    setModalFields(section === 'personal' ? personalFields : section === 'family' ? familyFields : additionalFields);
    setModalTitle(section === 'personal' ? 'Personal Health Details' : section === 'family' ? (data ? 'Edit Family Member' : 'Add Family Member') : 'Additional Details');
    setModalData(section === 'personal' ? userData : section === 'family' ? data || defaultFamilyMember : userData.additionalDetails);
    if (section === 'family') setEditFamilyMember(data);
  };

  const handleModalSave = async (formValues) => {
    if (activeSection === 'personal') await saveUserData({ ...userData, ...formValues });
    else if (activeSection === 'family') {
      const memberData = { ...formValues, email: user.email };
      try {
        editFamilyMember?.id
          ? await axios.put(`${FAMILY_API_URL}/${editFamilyMember.id}`, memberData)
          : await axios.post(FAMILY_API_URL, memberData);
        const res = await axios.get(`${FAMILY_API_URL}?email=${user.email}`);
        setUserData(prev => ({ ...prev, familyMembers: res.data }));
        showFeedback(editFamilyMember ? 'Family member updated' : 'Family member saved');
      } catch {
        showFeedback('Failed to save family member', 'error');
      }
      setEditFamilyMember(null);
    } else if (activeSection === 'additional') await saveUserData({ ...userData, additionalDetails: formValues });
    setShowModal(false);
  };

  const handleModalDelete = async (formValues) => {
    if (activeSection === 'family' && formValues.id) {
      try {
        await axios.delete(`${FAMILY_API_URL}/${formValues.id}`);
        const res = await axios.get(`${FAMILY_API_URL}?email=${user.email}`);
        setUserData(prev => ({ ...prev, familyMembers: res.data }));
        showFeedback('Family member deleted');
      } catch {
        showFeedback('Failed to delete family member', 'error');
      }
    }
    setShowModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return showFeedback('Please login to access data', 'error') || navigate('/login');
      let healthData = JSON.parse(localStorage.getItem('userData'));
      if (!healthData || healthData.email !== user.email) {
        try {
          const res = await axios.get(`${API_BASE_URL}/personalHealthDetails?email=${encodeURIComponent(user.email)}`);
          healthData = res.data[0] || {
            ...initialUserData,
            email: user.email,
            name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim()
          };
          if (!res.data.length) {
            const createRes = await axios.post(`${API_BASE_URL}/personalHealthDetails`, healthData);
            healthData.id = createRes.data.id;
          }
          const familyRes = await axios.get(`${FAMILY_API_URL}?email=${user.email}`);
          healthData.familyMembers = familyRes.data;
          localStorage.setItem('userData', JSON.stringify(healthData));
        } catch {
          healthData = { ...initialUserData, email: user.email };
          localStorage.setItem('userData', JSON.stringify(healthData));
        }
      }
      setUserData(healthData);
    };
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    const completed = Object.values(getSectionCompletionStatus()).filter(Boolean).length;
    setProfileCompletion(Math.round((completed / 3) * 100));
  }, [userData]);

  const sections = [
    { id: 'basic', name: 'Basic Details', icon: 'user' },
    { id: 'personal', name: 'Personal Health', icon: 'heart' },
    { id: 'family', name: 'Family Details', icon: 'users' }
  ];

  const completionStatus = getSectionCompletionStatus();

  return (
  <div className="min-h-screen bg-gray-100">
  <div className="bg-[#0e1630] text-white sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="relative w-24 h-24 sm:w-30 sm:h-30">
      <div className="w-full h-full rounded-full bg-white/60 flex items-center justify-center">
        <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle className="text-white/80" strokeWidth="1" stroke="currentColor" fill="none" r="16" cx="18" cy="18" />
          <circle style={{ transition: 'stroke 0.4s' }} stroke={getProgressColor(profileCompletion)} strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - profileCompletion} strokeLinecap="round" fill="none" r="16" cx="18" cy="18" />
        </svg>
        <CircleUser className="w-16 h-16 sm:w-28 sm:h-28 text-white" />
      </div>
      <div className="absolute -bottom-1 -right-1 bg-[var(--accent-color)] text-[#0e1630] font-bold px-3 py-2 rounded-full text-xs sm:text-base">{profileCompletion}%</div>
    </div>
    <div className="flex flex-wrap gap-6 items-center max-w-6xl text-white-700 text-lg">
      {[
        { label: "Name", value: `${user?.firstName || "Guest"} ${user?.lastName || ""}` },
        { label: "Date of Birth", value: user?.dob || "N/A" },
        { label: "Gender", value: user?.gender || "N/A" },
        { label: "Phone No.", value: user?.phone || "N/A" },
        { label: "Blood Group", value: userData.bloodGroup || "Not Set" }
      ].map((item, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-[var(--accent-color)]">{item.label}</span>
          <span className="text-white-600">{item.value}</span>
        </div>
      ))}
    </div>
    <button onClick={handleGenerateCard} className="shrink-0 px-4 py-4 rounded bg-[var(--accent-color)] font-semibold text-sm text-[var(--color-surface)]">Generate Health Card</button>
    <div className="relative group">
      <Pencil onClick={handleEditClick} className="w-9 h-8 p-1.5 rounded-full bg-[var(--color-surface)] text-black cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out" />
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[11px] bg-white text-black rounded-md px-2 py-1 opacity-0 scale-90 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 ease-out shadow-lg z-10">Edit</span>
    </div>
  </div>

  <div className="mt-6 sm:mt-10 flex gap-4 sm:gap-6 flex-wrap">
    {sections.map(({ id, name, icon }) => {
      const Icon = icon === 'user' ? CircleUser : icon === 'heart' ? Heart : Users;
      return (
        <button key={id} onClick={() => id !== 'basic' && openModal(id)} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm sm:text-base ${activeSection === id ? 'bg-[#0e1630]' : 'bg-[#1f2a4d] hover:bg-[#1b264a]'} transition-all duration-300`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          {name}
          {completionStatus[id] && <ClipboardCheck className="text-green-400 ml-1 animate-pulse" />}
        </button>
      );
    })}
    <button onClick={() => openModal('additional')} className="px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm sm:text-base bg-[#1f2a4d] hover:bg-[#1b264a] transition-all duration-300">Additional Details</button>
  </div>

  {feedbackMessage.show && (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all duration-300`}>
      {feedbackMessage.message}
    </div>
  )}

  <ReusableModal
    isOpen={showModal}
    onClose={() => { setShowModal(false); setEditFamilyMember(null); }}
    mode={modalMode}
    title={modalTitle}
    data={modalData}
    fields={modalFields}
    onSave={handleModalSave}
    onDelete={handleModalDelete}
    saveLabel="Save"
    cancelLabel="Cancel"
    deleteLabel="Delete"
    size="md"
  extraContent={activeSection === 'family' && Array.isArray(userData.familyMembers) && userData.familyMembers.length > 0 && (
      <div className="mt-6 space-y-3">
        <h3 className="text-md font-semibold">Saved Family Members</h3>
        {userData.familyMembers.map((m) => (
          <div key={m.id} className="p-3 bg-gray-100 rounded-md flex justify-between items-start">
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-gray-700"><strong>Relation:</strong> {m.relation}</p>
              {m.number && <p className="text-sm text-gray-700"><strong>Phone:</strong> {m.number}</p>}
              {m.diseases.length > 0 && <p className="text-sm text-gray-700 mt-1"><strong>Conditions:</strong> {m.diseases.join(', ')}</p>}
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:underline text-sm" onClick={() => openModal('family', m)}>Edit</button>
              <button className="text-red-600 hover:underline text-sm" onClick={() => handleModalDelete(m)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    )}
  />

  <div className="mt-8">
    <DashboardOverview />
  </div>
</div>
  );
}
export default Dashboard;