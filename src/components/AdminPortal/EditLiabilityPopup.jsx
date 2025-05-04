import React, { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../App";

const EditLiabilityPopup = ({ liability, organization, onClose, onUpdateLiability }) => {
  // Create references for DOM elements
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Initialize form data
  const [formData, setFormData] = useState({
    id: liability?.id || "",
    dueDate: liability?.dueDate || "",
    collectorName: liability?.collectorName || "",
    gcashNumber: liability?.gcashNumber || "",
    qrCode: null,
  });

  // QR code preview
  const [qrPreview, setQrPreview] = useState(liability?.qrCode || null);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Animation states
  const [formVisible, setFormVisible] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Close only if clicking on the backdrop
        if (event.target.classList.contains('modal-backdrop')) {
          handleCloseWithAnimation();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Animation setup
    setTimeout(() => {
      setFormVisible(true);
    }, 50);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
    // Only validating the fields we're keeping
    const requiredFields = [
      'dueDate', 'collectorName', 'gcashNumber'
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Extract only the editable fields
      const updatedLiability = {
        id: formData.id,
        dueDate: formData.dueDate,
        collectorName: formData.collectorName,
        gcashNumber: formData.gcashNumber,
        qrCode: formData.qrCode
      };
      
      // Call the parent component's update function
      if (typeof onUpdateLiability === 'function') {
        await onUpdateLiability(updatedLiability);
        // Show success modal
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
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      handleCloseWithAnimation();
    }, 300);
  };
  
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleFileUploadClick = () => {
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

        {/* Form - Only showing the fields we want to keep */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 px-4">
          <div className="space-y-5">
            {/* Organization - Display only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm">
                {organization?.name || "Organization"}
              </div>
            </div>

            {/* Due Date */}
            <div>
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
            
            {/* Collector Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collector Name *</label>
              <input
                type="text"
                name="collectorName"
                value={formData.collectorName}
                onChange={handleInputChange}
                required
                placeholder="Name of collector"
                className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
              />
            </div>
            
            {/* GCash Number */}
            <div>
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
            
            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GCash QR Code</label>
              <div className="flex items-start gap-4">
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
                <div className="text-xs text-gray-500 pt-2">
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
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#a63f42] text-sm text-white rounded-md hover:bg-[#8a3538] transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4 transition-opacity duration-300 ease-in-out"
             style={{ opacity: showSuccessModal ? 1 : 0 }}>
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden transition-all duration-300 ease-in-out ${showSuccessModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
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
             style={{ opacity: showErrorModal ? 1 : 0 }}>
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden transition-all duration-300 ease-in-out ${showErrorModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
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