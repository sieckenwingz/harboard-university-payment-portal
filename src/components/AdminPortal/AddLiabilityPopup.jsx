import React, { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../App";
import { AcademicYear, Semester } from "../../models/Period";
import { usePeriods } from "./hooks/usePeriods";

const AddLiabilityPopup = ({ organization, onClose, onLiabilityAdded }) => {
  // Form data state
  const [formData, setFormData] = useState({
    organizationId: organization?.id || "",
    name: "",
    academicYear: AcademicYear.YEAR_2024_2025, // Default to current academic year
    periodId: undefined,
    amount: "",
    dueDate: "",
    collectorName: "",
    gcashNumber: "",
    qrCode: null
  });
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [newLiabilityData, setNewLiabilityData] = useState(null);
  
  const { periods, yearPeriods, loading: periodsLoading, error: periodsError } = usePeriods();

  const [ periodOptions, setPeriodOptions] = useState([]);

  useEffect(() => {
    setPeriodOptions(yearPeriods[formData.academicYear]);
  }, [formData.academicYear, periods]);

  useEffect(() => {
  }, [formData]);

  useEffect(() => {    
    // Animation timing
    setTimeout(() => setFormVisible(true), 50);
  }, []);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "gcashNumber") {
      // Filter non-numeric characters and limit to 11 digits
      const filteredValue = value.replace(/\D/g, '');
      const truncatedValue = filteredValue.slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: truncatedValue }));
    } else if (name === "amount") {
      // Allow only numeric values with decimal point
      const numericalValue = value.replace(/[^\d.]/g, '');
      // Ensure only one decimal point
      const parts = numericalValue.split('.');
      const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, qrCode: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => setQrPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const requiredFields = [
      'name', 
      'academicYear', 
      'periodId',
      'amount', 
      'dueDate', 
      'collectorName', 
      'gcashNumber'
    ];
    
    const missingFields = requiredFields.filter(field => {
      return !formData[field] || formData[field].toString().trim() === '';
    });
    
    console.log(missingFields)
    
    if (missingFields.length > 0) {
      setErrorMessage(`Please fill in all required fields`);
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Generate liability name from organization name
      const liabilityName = `${organization.name} Membership Fee`;
      
      // Prepare data for insertion
      const newFee = {
        organization_id: parseInt(formData.organizationId),
        name: liabilityName,
        period_id: parseInt(formData.periodId),
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to cents
        deadline: formData.dueDate,
        collector_name: formData.collectorName,
        account_number: formData.gcashNumber
      };
      
      // Upload QR code if provided
      if (formData.qrCode) {
        const fileExt = formData.qrCode.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `qrcodes/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('fee-qr-codes')
          .upload(filePath, formData.qrCode);
          
        if (uploadError) throw uploadError;
        
        // Add QR code path to the fee data
        newFee.qr_code = filePath;
      }
      
      // Insert fee into database
      const { data, error } = await supabase
        .from('fees')
        .insert([newFee]);
        
      if (error) throw error;
      
      // Create object for UI update
      const newLiability = {
        id: data?.[0]?.id || Date.now().toString(),
        name: liabilityName,
        type: "Membership Fee",
        academicYear: formData.academicYear,
        period: formData.periodId,
        amount: parseFloat(formData.amount) * 100, // Store as cents
        dueDate: formData.dueDate,
        collectorName: formData.collectorName,
        gcashNumber: formData.gcashNumber,
        qrCode: qrPreview
      };
      
      // Store for use with callback
      setNewLiabilityData(newLiability);
      
      // Show success message
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error adding liability:", error);
      setErrorMessage(error.message || "Failed to add liability");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Modal close handlers
  const handleCloseWithAnimation = () => {
    setFormVisible(false);
    setTimeout(() => onClose(), 300);
  };
  
  const handleSuccessModalClose = () => {
    setFormVisible(false);
    setTimeout(() => {
      setShowSuccessModal(false);
      // Call the parent callback with the new liability data
      if (typeof onLiabilityAdded === 'function' && newLiabilityData) {
        onLiabilityAdded(newLiabilityData);
      }
      onClose();
    }, 300);
  };
  
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
         style={{ opacity: formVisible ? 1 : 0 }}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ease-in-out ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 px-4">
          <div className="space-y-5">
            {/* Organization - Display only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm">
                {organization?.name || "Selected Organization"}
              </div>
              <input type="hidden" name="organizationId" value={formData.organizationId} />
            </div>

            {/* Organization - Display only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full pl-2 p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent" />
            </div>
            
            {/* Academic Year and Period - Side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                >
                  <option value="">Select year</option>
                  <option value="2023 - 2024">2023 - 2024</option>
                  <option value="2024 - 2025">2024 - 2025</option>
                  <option value="2025 - 2026">2025 - 2026</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <select
                  name="periodId"
                  value={formData.periodId?.id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                >
                  <option value={undefined}>Select semester</option>
                  {periodOptions?.map(period => (
                    <option key={period.id} value={period.id}>{period.semester}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Amount and Due Date - Side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PHP) *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    className="w-full pl-8 p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                </div>
              </div>
              
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
            </div>
            
            {/* Collector Name and GCash Number - Side by side */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GCash QR Code</label>
              <div className="flex items-start gap-4">
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
            {loading ? 'Adding...' : 'Add Liability'}
          </button>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
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