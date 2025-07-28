import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createRoot } from "react-dom/client";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import {
  ArrowLeft,
  User,
  Stethoscope,
  ChevronDown,
  X,
  Printer,
  CheckCircle,
  FileText,
  Pill,
  TestTube,
} from "lucide-react";

// JSX component for print content
const PrintContent = ({ requestData, selectedRecord, formData }) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
    <div className="header" style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>SECOND OPINION REQUEST</h1>
      <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>Expert Medical Consultation Form</p>
    </div>
    <div className="request-info" style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>Request Information</h3>
      <p><strong>Request ID:</strong> {requestData.id}</p>
      <p><strong>Date of Request:</strong> {requestData.requestDate}</p>
      <p><strong>Status:</strong> Pending Review</p>
    </div>
    <div className="medical-records-attached" style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #4caf50' }}>
      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '10px' }}>✓ Medical Records Attached</h4>
      <p style={{ margin: '0', color: '#2e7d32' }}>Complete patient medical history, vitals, prescriptions, and lab reports are included with this request.</p>
    </div>
    <div className="patient-section" style={{ marginBottom: '25px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Patient Information</h3>
      <div className="patient-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {Object.entries(requestData.patientInfo).map(([key, value]) => (
          <div key={key} className="patient-item" style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <strong>{key.replace(/([A-Z])/g, ' $1') + ':'}</strong>
            <span style={{ marginLeft: '10px' }}>{value}</span>
          </div>
        ))}
        <div className="patient-item" style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <strong>K/C/O:</strong>
          <span style={{ marginLeft: '10px' }}>{selectedRecord["K/C/O"] ?? "--"}</span>
        </div>
      </div>
    </div>
    <div className="request-details" style={{ marginBottom: '30px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Consultation Request Details</h3>
      {Object.entries(formData).map(([key, value]) => (
        <div key={key} className="detail-item" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
          <div className="detail-label" style={{ fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
            {key.replace(/([A-Z])/g, ' $1') + ':'}
          </div>
          <div className="detail-value" style={{ color: '#333' }}>
            {value || "Not specified"}
          </div>
        </div>
      ))}
    </div>
    <div className="footer" style={{ borderTop: '1px solid #ddd', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
      <p style={{ margin: '5px 0' }}>This is an official second opinion request generated on {new Date().toLocaleString()}</p>
      <p style={{ margin: '5px 0' }}>For any queries, please contact the medical records department.</p>
    </div>
  </div>
);

const MedicalRecordsDetailsPreview = ({ selectedRecord, onClose }) => {
  if (!selectedRecord) return null;

  const [detailsActiveTab, setDetailsActiveTab] = useState("medical-records");

  const renderTabContent = () => {
    const tabContentMap = {
      "medical-records": (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-[var(--primary-color)]" />
              <h3 className="h3-heading">Medical Information</h3>
            </div>
            <button className="view-btn">View Original</button>
          </div>
          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(selectedRecord?.medicalDetails || {}).map(([label, value]) => (
                <div key={label} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="font-bold text-sm text-gray-600 mb-2">{label.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-gray-800 text-sm">{value || "N/A"}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ),
      prescriptions: (
        <DynamicTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Doctor Name", accessor: "doctorName" },
            { header: "Medicines", accessor: "medicines" },
            { header: "Instructions", accessor: "instructions" },
          ]}
          data={selectedRecord?.prescriptionsData || []}
        />
      ),
      "lab-tests": (
        <DynamicTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Test Name", accessor: "testName" },
            { header: "Result", accessor: "result" },
            { header: "Normal Range", accessor: "normalRange" },
            {
              header: "Status",
              accessor: "status",
              cell: (row) => (
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {row.status}
                </span>
              ),
            },
          ]}
          data={selectedRecord?.labTestsData || []}
        />
      ),
    };

    return tabContentMap[detailsActiveTab] || null;
  };

  const detailsTabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab Tests", icon: TestTube },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto m-4">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Medical Records Preview</h2>
              <p className="text-gray-600">Complete patient medical information</p>
            </div>
            <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
              <X size={20} />
              Close
            </button>
          </div>

          <div className="flex border-gray-200 mb-6">
            {detailsTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDetailsActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-300 ${detailsActiveTab === tab.id ? "border-b-2 text-[var(--primary-color)] border-[var(--primary-color)]" : "text-gray-500 hover:text-[var(--accent-color)]"}`}
                >
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="animate-slide-fade-in">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

const SecondOpinion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let selectedRecord = location.state?.selectedRecord;

  if (!selectedRecord || !selectedRecord.medicalDetails) {
    console.warn("No selected record found or medical details missing. Using mock data for testing.");
    selectedRecord = {
      ...selectedRecord,
      medicalDetails: {
        chiefComplaint: "High fever with chills, body ache, and headache for 3 days",
        pastHistory: "No significant past medical or surgical history. No known allergies.",
        initialAssessment: "Patient appears weak, febrile, and dehydrated.",
        systematicExamination: "Mild hepatomegaly, no signs of rash or bleeding.",
        investigations: "CBC, Dengue NS1 Antigen, Dengue IgM/IgG, Platelet Count.",
        treatmentAdvice: "Maintain hydration, avoid NSAIDs, and monitor platelet count daily.",
        treatmentGiven: "IV fluids, Paracetamol for fever, complete bed rest, platelet monitoring",
        diagnosis: "Dengue Fever (Confirmed by NS1 Antigen and IgM positive)",
        doctorsNotes: "Patient responded well to treatment. Platelet count stabilized.",
        dischargeSummary: "Patient admitted with dengue fever, treated with supportive care. Patient is stable and ready for discharge.",
      },
    };
  }

  const [formData, setFormData] = useState({
    selectedDoctor: "",
    urgencyLevel: "",
    preferredMode: "",
    additionalNotes: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const doctors = [
    "Dr. Rajesh Kumar (Cardiologist)",
    "Dr. Priya Sharma (Physician)",
    "Dr. Amit Patel (Neurologist)",
    "Dr. Sunita Reddy (Gastroenterologist)",
  ];

  const urgencyLevels = [
    { label: "Normal (3-5 days)", value: "normal" },
    { label: "Urgent (1-2 days)", value: "urgent" },
    { label: "Critical (Same day)", value: "critical" },
  ];

  const consultationModes = [
    { label: "In-person Visit", value: "in-person" },
    { label: "Teleconsultation", value: "teleconsultation" },
    { label: "Email Report", value: "email" },
    { label: "Phone Consultation", value: "phone" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDoctorSelect = (doctor) => {
    setFormData((prev) => ({ ...prev, selectedDoctor: doctor }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.selectedDoctor.trim()) {
      alert("Please select a consulting doctor");
      return;
    }
    setShowPreview(true);
  };

  const handleBack = () => {
    navigate("/patientdashboard/medical-record-details", { state: { selectedRecord } });
  };

  const handleBackToRecords = () => {
    navigate("/patientdashboard/medical-records");
  };

  const handlePrint = () => {
    const requestData = {
      id: `SO-${Date.now()}`,
      requestDate: new Date().toLocaleDateString("en-GB"),
      patientInfo: {
        name: selectedRecord.patientName,
        age: selectedRecord.age,
        sex: selectedRecord.sex,
        patientId: selectedRecord.id,
        hospitalName: selectedRecord.hospitalName,
        diagnosis: selectedRecord.diagnosis,
        visitDate: selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation,
      },
      requestData: formData,
    };

    const printWindow = window.open('', '_blank');
    const printDiv = document.createElement('div');
    createRoot(printDiv).render(<PrintContent requestData={requestData} selectedRecord={selectedRecord} formData={formData} />);

    setTimeout(() => {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Second Opinion Request</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              @media print { body { -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>${printDiv.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  if (!selectedRecord) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">No record found. Please go back and select a record.</div>
      </div>
    );
  }

  if (showMedicalRecords) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto m-4">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Medical Records Preview</h2>
                <p className="text-gray-600">Complete patient medical information</p>
              </div>
              <button onClick={() => setShowMedicalRecords(false)} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
                Close
              </button>
            </div>
            <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
              <h3 className="text-2xl font-bold mb-4">{selectedRecord.patientName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
                <div>Age: {selectedRecord.age}</div>
                <div>Gender: {selectedRecord.sex}</div>
                <div>Hospital: {selectedRecord.hospitalName}</div>
                <div>Diagnosis: {selectedRecord.diagnosis}</div>
                <div>K/C/O: {selectedRecord["K/C/O"] ?? "--"}</div>
              </div>
            </div>
            <section className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Vitals Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(selectedRecord.vitals || {}).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</div>
                    <div className="text-sm font-semibold text-gray-800">{value}</div>
                  </div>
                ))}
              </div>
            </section>
            <section className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(selectedRecord?.medicalDetails || {}).map(([label, value]) => (
                  <div key={label} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="font-bold text-sm text-gray-600 mb-2">{label.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-gray-800 text-sm">{value || "N/A"}</div>
                  </div>
                ))}
              </div>
            </section>
            <section className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Prescriptions</h4>
              <DynamicTable
                columns={[
                  { header: "Date", accessor: "date" },
                  { header: "Doctor Name", accessor: "doctorName" },
                  { header: "Medicines", accessor: "medicines" },
                  { header: "Instructions", accessor: "instructions" },
                ]}
                data={selectedRecord.prescriptionsData || []}
              />
            </section>
            <section className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Lab Tests</h4>
              <DynamicTable
                columns={[
                  { header: "Date", accessor: "date" },
                  { header: "Test Name", accessor: "testName" },
                  { header: "Result", accessor: "result" },
                  { header: "Normal Range", accessor: "normalRange" },
                  {
                    header: "Status",
                    accessor: "status",
                    cell: (row) => (
                      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {row.status}
                      </span>
                    ),
                  },
                ]}
                data={selectedRecord.labTestsData || []}
              />
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (showPreview) {
    const requestData = {
      id: `SO-${Date.now()}`,
      requestDate: new Date().toLocaleDateString("en-GB"),
      patientInfo: {
        name: selectedRecord.patientName,
        age: selectedRecord.age,
        sex: selectedRecord.sex,
        patientId: selectedRecord.id,
        hospitalName: selectedRecord.hospitalName,
        diagnosis: selectedRecord.diagnosis,
        visitDate: selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation,
      },
      requestData: formData,
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="h2-heading">Second Opinion Request</h2>
              <p className="text-sm text-gray-500">Expert consultation for your medical condition</p>
            </div>
            <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-red-600 transition">
              <X size={20} />
            </button>
          </div>

          <div className="border-b pb-4 mb-6 text-center">
            <h3 className="h4-heading mb-1">Request Details</h3>
            <p className="text-sm text-gray-700"><strong>Request ID:</strong> {requestData.id}</p>
            <p className="text-sm text-gray-700"><strong>Date:</strong> {requestData.requestDate}</p>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  <span className="font-medium text-blue-800">Medical Records Attached</span>
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <button onClick={() => setShowMedicalRecords(true)} className="view-btn">View Medical Records</button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 text-white mb-6">
            <h4 className="text-base font-bold mb-4 flex items-center gap-2">
              <User  size={18} />
              Patient Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(requestData.patientInfo).map(([key, value]) => (
                <p key={key}><span className="font-bold">{key.replace(/([A-Z])/g, ' $1') + ':'}</span> {value}</p>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="h4-heading mb-2">Request Details</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <span className="font-bold text-gray-600">{key.replace(/([A-Z])/g, ' $1') + ':'}</span> {value || "Not specified"}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={handlePrint} className="edit-btn flex items-center gap-2">
              <Printer size={16} />
              Print
            </button>
            <div className="flex gap-3">
              <button onClick={() => setShowPreview(false)} className="delete-btn">Edit Request</button>
              <button onClick={handleBackToRecords} className="view-btn">Submit & Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="flex items-center gap-2 hover:text-[var(--accent-color)] transition-colors text-gray-600">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Medical Record Details</span>
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
            <Stethoscope size={32} className="text-purple-600" />
          </div>
        </div>
        <h1 className="h1-heading mb-2">Second Opinion Request</h1>
        <p className="text-gray-600">Get expert consultation for your medical condition</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Medical Records Automatically Attached</h3>
              <p className="text-sm text-green-700">Patient information, vitals, and medical history will be included</p>
            </div>
          </div>
          <button onClick={() => setShowMedicalRecords(true)} className="view-btn">Preview Medical Records</button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User  size={20} />
          Patient Information (Auto-attached)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p><span className="font-semibold">Patient Name:</span> {selectedRecord.patientName}</p>
            <p><span className="font-semibold">Age:</span> {selectedRecord.age}</p>
            <p><span className="font-semibold">Gender:</span> {selectedRecord.sex}</p>
            <p><span className="font-semibold">K/C/O:</span> {selectedRecord["K/C/O"] ?? "--"}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-semibold">Hospital:</span> {selectedRecord.hospitalName}</p>
            <p><span className="font-semibold">Visit Date:</span> {selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation}</p>
            <p><span className="font-semibold">Diagnosis:</span> {selectedRecord.diagnosis}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Consulting Doctor <span className="text-red-500">*</span></label>
            <div className="relative">
              <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="input-field w-full flex items-center justify-between bg-white">
                <span className={formData.selectedDoctor ? "text-gray-900" : "text-gray-500"}>{formData.selectedDoctor || "Select a doctor..."}</span>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {doctors.map((doctor) => (
                    <button key={doctor} type="button" onClick={() => handleDoctorSelect(doctor)} className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors">{doctor}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
            <select value={formData.urgencyLevel} onChange={(e) => handleInputChange("urgencyLevel", e.target.value)} className="input-field w-full">
              <option value="">Select urgency level</option>
              {urgencyLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Consultation Mode</label>
            <select value={formData.preferredMode} onChange={(e) => handleInputChange("preferredMode", e.target.value)} className="input-field">
              <option value="">Select consultation mode</option>
              {consultationModes.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Additional Reports (Optional)</label>
            <div>
              <button type="button" onClick={() => document.getElementById("fileUpload").click()} className="input-field w-full flex items-center justify-center text-gray-500 cursor-pointer text-sm h-[44px]">Attach Document</button>
              <input id="fileUpload" type="file" className="hidden" onChange={(e) => handleInputChange("uploadedFile", e.target.files[0])} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
          <textarea value={formData.additionalNotes} onChange={(e) => handleInputChange("additionalNotes", e.target.value)} rows={3} className="input-field" placeholder="Any additional information for the consulting doctor..." />
        </div>
      </div>

      <div className="flex justify-between items-center pt-6">
        <button onClick={handlePrint} className="edit-btn flex items-center gap-2">
          <Printer size={18} />
          Print Form
        </button>

        <div className="flex gap-3">
          <button onClick={handleBack} className="delete-btn">Cancel</button>
     
        </div>
      </div>
    </div>
  );
};

export default SecondOpinion;