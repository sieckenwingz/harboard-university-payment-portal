import React, { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

const EditLiabilityPopup = ({ liability, organization, onClose, onUpdateLiability }) => {
  // Create references for DOM elements to safely handle them
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Initialize form data safely
  const [formData, setFormData] = useState({
    id: liability?.id || "",
    liabilityType: liability?.type || "",
    liabilityName: liability?.name || "",
    academicYear: liability?.academicYear || "",
    period: liability?.period || "",
    amount: liability?.amount || "",
    dueDate: liability?.dueDate || "",
    collector: liability?.collector || "",
    gcashNumber: liability?.gcashNumber || "",
    qrCode: null,
  });

  // Define academic years and periods
  const academicYears = [
    "2023-2024",
    "2024-2025",
    "2025-2026",
  ];
  
  const periodOptions = [
    { value: "1", label: "1st Semester" },
    { value: "2", label: "2nd Semester" },
    { value: "SUMMER", label: "Summer" }
  ];
  
  // QR code preview
  const [qrPreview, setQrPreview] = useState(liability?.qrCode || null);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Animation states
  const [formVisible, setFormVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  // Click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Close only if clicking on the backdrop, not on child elements
        if (event.target.classList.contains('modal-backdrop')) {
          handleCloseWithAnimation();
        }
      }
    };

    // Add event listener only when the component is mounted
    document.addEventListener('mousedown', handleClickOutside);
    
    // Animation setup
    setTimeout(() => {
      setFormVisible(true);
    }, 50);
    
    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Reset form data whenever liability changes
  useEffect(() => {
    if (liability) {
      try {
        setFormData({
          id: liability.id || "",
          liabilityType: liability.type || "",
          liabilityName: liability.name || "",
          academicYear: liability.academicYear || "",
          period: liability.period || "",
          amount: liability.amount || "",
          dueDate: liability.dueDate ? String(liability.dueDate).split('T')[0] : "",
          collector: liability.collector || "",
          gcashNumber: liability.gcashNumber || "",
          qrCode: null
        });
        
        // Set QR preview if available
        if (liability.qrCode) {
          setQrPreview(liability.qrCode);
        }
      } catch (error) {
        console.error("Error setting form data:", error);
        // Provide fallback values
        setFormData({
          id: liability?.id || "",
          liabilityType: "School Fee",
          liabilityName: "",
          academicYear: "2024-2025",
          period: "1",
          amount: "0",
          dueDate: "",
          collector: "",
          gcashNumber: "",
          qrCode: null
        });
      }
    }
  }, [liability]);
  
  // Handle Success Modal Timeouts
  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      setSuccessModalVisible(true);
      timer = setTimeout(() => {
        handleSuccessModalClose();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal]);
  
  // Handle Error Modal Timeouts
  useEffect(() => {
    let timer;
    if (showErrorModal) {
      setErrorModalVisible(true);
      timer = setTimeout(() => {
        handleErrorModalClose();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showErrorModal]);
  
  const handleCloseWithAnimation = () => {
    if (formVisible) {
      setFormVisible(false);
      setTimeout(() => {
        if (typeof onClose === 'function') {
          onClose();
        }
      }, 300);
    } else {
      if (typeof onClose === 'function') {
        onClose();
      }
    }
  };

  const handleInputChange = (e) => {
    try {
      const { name, value } = e.target;
      
      if (name === "gcashNumber") {
        const filteredValue = value.replace(/\D/g, '');
        const truncatedValue = filteredValue.slice(0, 11);
        
        setFormData(prev => ({
          ...prev,
          [name]: truncatedValue
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      
      // For special fields that need to update two properties
      if (name === "liabilityType") {
        setFormData(prev => ({
          ...prev,
          type: value
        }));
      } else if (name === "liabilityName") {
        setFormData(prev => ({
          ...prev,
          name: value
        }));
      }
    } catch (error) {
      console.error("Error handling input change:", error);
    }
  };

  const handleFileChange = (e) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          qrCode: file
        }));
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setQrPreview(reader.result);
        };
        reader.onerror = () => {
          console.error("Error reading file");
          setErrorMessage("Failed to read the uploaded file");
          setShowErrorModal(true);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Error handling file change:", error);
    }
  };

  const validateForm = () => {
    // Updated required fields list with the new fields
    const requiredFields = [
      'liabilityType', 'liabilityName', 'academicYear', 'period',
      'amount', 'dueDate', 'collector', 'gcashNumber'
    ];
    
    try {
      const missingFields = requiredFields.filter(field => 
        !formData[field] || String(formData[field]).trim() === ''
      );
      
      if (missingFields.length > 0) {
        setErrorMessage("Please fill in all required fields");
        setShowErrorModal(true);
        return false;
      }
      
      if (formData.gcashNumber && formData.gcashNumber.length !== 11) {
        setErrorMessage("GCash number must be 11 digits");
        setShowErrorModal(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating form:", error);
      setErrorMessage("An error occurred while validating the form");
      setShowErrorModal(true);
      return false;
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepare the liability data in the format expected by the update function
      const updatedLiability = {
        id: formData.id,
        type: formData.liabilityType, 
        name: formData.liabilityName,
        academicYear: formData.academicYear,
        period: formData.period,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        collector: formData.collector,
        gcashNumber: formData.gcashNumber,
        qrCode: formData.qrCode // This will be the File object if a new QR was uploaded
      };
      
      // Call the parent component's update function
      if (typeof onUpdateLiability === 'function') {
        onUpdateLiability(updatedLiability);
        // Show success modal - this will be shown if the update is successful
        setShowSuccessModal(true);
      } else {
        console.error("onUpdateLiability is not a function");
        setErrorMessage("Update function not available");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An error occurred while submitting the form");
      setShowErrorModal(true);
    }
  };
  
  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    setTimeout(() => {
      setShowSuccessModal(false);
      handleCloseWithAnimation();
    }, 300);
  };
  
  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
    setTimeout(() => {
      setShowErrorModal(false);
    }, 300);
  };

  const getLiabilityNameOptions = () => {
    if (formData.liabilityType === "School Fee") {
      return [
        "Tuition Fee", "Laboratory Fee", "Library Fee", 
        "Technology Fee", "Athletic Fee"
      ];
    } else if (formData.liabilityType === "Membership Fee") {
      return [
        "Student Council", "Engineering Society", "Business Club", 
        "Arts Club", "Medical Society"
      ];
    }
    return [];
  };

  const handleFileUploadClick = () => {
    // Safely access the file input reference
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out modal-backdrop"
         style={{ opacity: formVisible ? 1 : 0 }}>
      <div 
        ref={popupRef}
        className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] transition-all duration-300 ease-in-out ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Edit Liability</h2>
          <button 
            onClick={handleCloseWithAnimation} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-2 px-4">
          <div className="space-y-4">
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={organization || ''}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm"
              />
            </div>

            {/* Liability Type and Name */}
            <div className="flex gap-3">
              {/* Liability Type */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liability Type *
                </label>
                <select
                  name="liabilityType"
                  value={formData.liabilityType}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="School Fee">School Fee</option>
                  <option value="Membership Fee">Membership Fee</option>
                </select>
              </div>
              
              {/* Liability Name */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liability Name *
                </label>
                <select
                  name="liabilityName"
                  value={formData.liabilityName}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.liabilityType}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select name</option>
                  {getLiabilityNameOptions().map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Academic Year and Period */}
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period *
                </label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                >
                  <option value="">Select period</option>
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount and Due Date */}
            <div className="flex gap-3">
              {/* Amount */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (PHP) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                </div>
              </div>
              
              {/* Due Date */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                />
              </div>
            </div>

            {/* Collector and GCash Number */}
            <div className="flex gap-3">
              {/* Collector */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collector Name *
                </label>
                <input
                  type="text"
                  name="collector"
                  value={formData.collector}
                  onChange={handleInputChange}
                  required
                  placeholder="Name of collector"
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                />
              </div>
              
              {/* GCash Number */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GCash Number *
                </label>
                <input
                  type="text"
                  name="gcashNumber"
                  value={formData.gcashNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="09XX XXX XXXX"
                  maxLength={11}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  {formData.gcashNumber ? formData.gcashNumber.length : 0}/11 digits
                </span>
              </div>
            </div>

            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GCash QR Code
              </label>
              <div className="flex items-start gap-3">
                <div 
                  onClick={handleFileUploadClick}
                  className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 shrink-0"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {qrPreview ? (
                    <img
                      src={qrPreview}
                      alt="QR Code Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-gray-400" />
                      <span className="mt-1 block text-xs font-medium text-gray-500">
                        Upload QR
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  Upload the GCash QR code for easy payments
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-2 p-4 bg-gray-50 border-t flex justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={handleCloseWithAnimation}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-[#a63f42] text-sm text-white rounded-md hover:bg-[#8a3538] transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4 transition-opacity duration-300 ease-in-out"
             style={{ opacity: successModalVisible ? 1 : 0 }}>
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden transition-all duration-300 ease-in-out ${successModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="p-4 flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-center text-gray-600 mb-4">
                Liability has been successfully updated.
              </p>
              <button
                onClick={handleSuccessModalClose}
                className="px-4 py-2 bg-[#a63f42] text-white rounded-md hover:bg-[#8a3538] transition-colors duration-200 w-full"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4 transition-opacity duration-300 ease-in-out"
             style={{ opacity: errorModalVisible ? 1 : 0 }}>
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden transition-all duration-300 ease-in-out ${errorModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="p-4 flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Error</h3>
              <p className="text-center text-gray-600 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={handleErrorModalClose}
                className="px-4 py-2 bg-[#a63f42] text-white rounded-md hover:bg-[#8a3538] transition-colors duration-200 w-full"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditLiabilityPopup;