// 3rd nav sa management
// add new liab button

import React, { useState, useEffect } from "react";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddLiabilityPopup = ({ organization, onClose, onAddLiability }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id: Date.now().toString(),
    liabilityType: "",
    name: "",
    type: "",
    amount: "",
    dueDate: "",
    collector: "",
    gcashNumber: "",
    qrCode: null
  });
  
  // QR code preview
  const [qrPreview, setQrPreview] = useState(null);
  
  // modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // animation states
  const [formVisible, setFormVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setFormVisible(true), 50);
  }, []);
  
  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      setSuccessModalVisible(true);
      timer = setTimeout(() => handleSuccessModalClose(), 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal]);
  
  useEffect(() => {
    let timer;
    if (showErrorModal) {
      setErrorModalVisible(true);
      timer = setTimeout(() => handleErrorModalClose(), 3000);
    }
    return () => clearTimeout(timer);
  }, [showErrorModal]);
  
  const handleCloseWithAnimation = () => {
    setFormVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "liabilityType") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        type: value
      }));
    } else if (name === "liabilityName") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        name: value
      }));
    } else if (name === "gcashNumber") {

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
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, qrCode: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => setQrPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    const requiredFields = ['liabilityType', 'name', 'amount', 'dueDate', 'collector', 'gcashNumber'];
    const missingFields = requiredFields.filter(field => 
      !formData[field] || formData[field].toString().trim() === ''
    );
    
    if (missingFields.length > 0) {
      setErrorMessage("Please fill in all required fields");
      setShowErrorModal(true);
      return false;
    }
    
    if (formData.gcashNumber.length !== 11) {
      setErrorMessage("GCash number must be 11 digits");
      setShowErrorModal(true);
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) return;

    const newLiability = {
      id: formData.id,
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      collector: formData.collector,
      gcashNumber: formData.gcashNumber,
      qrCode: qrPreview
    };
    
    onAddLiability(newLiability);
    
    setShowSuccessModal(true);
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
    setTimeout(() => setShowErrorModal(false), 300);
  };
  
  const getLiabilityNameOptions = () => {
    if (formData.liabilityType === "School Fee") {
      return ["Tuition Fee", "Laboratory Fee", "Library Fee", "Technology Fee", "Athletic Fee"];
    } else if (formData.liabilityType === "Membership Fee") {
      return ["Student Council", "Engineering Society", "Business Club", "Arts Club", "Medical Society"];
    }
    return [];
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
         style={{ opacity: formVisible ? 1 : 0 }}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] transition-all duration-300 ease-in-out ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Add New Liability</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                value={organization}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm"
              />
            </div>
            
            {/* Liability Type and Name */}
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Liability Type *</label>
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
              
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Liability Name *</label>
                <select
                  name="liabilityName"
                  value={formData.liabilityName}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.liabilityType}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select name</option>
                  {getLiabilityNameOptions().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Amount and Due Date */}
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PHP) *</label>
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
              
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
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
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Collector Name *</label>
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
              
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">GCash Number *</label>
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
                <span className="text-xs text-gray-500 mt-1 block">{formData.gcashNumber.length}/11 digits</span>
              </div>
            </div>
            
            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GCash QR Code</label>
              <div className="flex items-start gap-3">
                <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {qrPreview ? (
                    <img src={qrPreview} alt="QR Code Preview" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-gray-400" />
                      <span className="mt-1 block text-xs font-medium text-gray-500">Upload QR</span>
                    </div>
                  )}
                </label>
                <div className="text-xs text-gray-500 pt-1">Upload the GCash QR code for easy payments</div>
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
            Save Liability
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
              <p className="text-center text-gray-600 mb-4">New liability has been successfully added.</p>
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
              <p className="text-center text-gray-600 mb-4">{errorMessage}</p>
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

export default AddLiabilityPopup;