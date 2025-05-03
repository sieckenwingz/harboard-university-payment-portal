// In your AddLiabilityPopup component:

import React, { useState, useEffect } from "react";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../App"; // Adjust path if needed

const AddLiabilityPopup = ({ organization, onClose, onAddLiability }) => {
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    organizationId: "", // Will store the ID, not the name
    periodId: "",
    liabilityType: "",
    liabilityName: "",
    academicYear: "",
    amount: "",
    dueDate: "",
    collectorName: "",
    gcashNumber: "",
    qrCode: null
  });
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [qrPreview, setQrPreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  
  // Fetch organizations and set the organizationId based on the organization name prop
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        // Fetch organizations from database
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name');
          
        if (error) throw error;
        
        if (data) {
          setOrganizations(data);
          console.log("Fetched organizations:", data);
          
          // If organization name prop is provided, find matching ID
          if (organization.organization) {
            const orgMatch = data.find(org => {
              // Try several matching strategies
              return org.name === organization.organization || 
                    org.name.includes(organization.organization) || 
                    organization.organization.includes(org.name);
            });
            
            if (orgMatch) {
              console.log(`Found organization match: ${orgMatch.name} (ID: ${orgMatch.id})`);
              
              // Set the organizationId in form data
              setFormData(prev => ({
                ...prev,
                organizationId: orgMatch.id.toString() // Convert to string for form handling
              }));
            } else {
              console.warn(`No organization match found for "${organization}"`);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    
    fetchOrganizations();
    
    // Other initialization (periods, animation)
    const fetchPeriods = async () => {
      try {
        const { data, error } = await supabase
          .from('periods')
          .select('id, year, semester');
        
        if (error) throw error;
        
        if (data) {
          setPeriods(data);
        }
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };
    
    fetchPeriods();
    
    // Set form visible with animation
    setTimeout(() => setFormVisible(true), 50);
  }, [organization]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "gcashNumber") {
      // Filter non-numeric characters and limit to 11 digits
      const filteredValue = value.replace(/\D/g, '');
      const truncatedValue = filteredValue.slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: truncatedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Debug log
    console.log(`Updated ${name} to:`, value);
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
      'organizationId', 
      'periodId', 
      'liabilityType', 
      'liabilityName', 
      'academicYear', 
      'amount', 
      'dueDate', 
      'collectorName', 
      'gcashNumber'
    ];
    
    // Log current form state for debugging
    console.log("Validating form with data:", formData);
    
    const missingFields = requiredFields.filter(field => {
      const isEmpty = !formData[field] || formData[field].toString().trim() === '';
      console.log(`Field ${field}: ${formData[field]} - isEmpty: ${isEmpty}`);
      return isEmpty;
    });
    
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      setErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
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
  
  // Submit form
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare data for insertion
      const newFee = {
        organization_id: parseInt(formData.organizationId),
        period_id: parseInt(formData.periodId),
        amount: Math.round(parseFloat(formData.amount)), 
        deadline: formData.dueDate,
        collector_name: formData.collectorName,
        liab_name: formData.liabilityName,
        liab_type: formData.liabilityType,
        acad_year: formData.academicYear,
        account_number: formData.gcashNumber
      };
      
      // Upload QR code if provided
      if (formData.qrCode) {
        const fileExt = formData.qrCode.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `qrcodes/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('fee-qr-codes') // bucket name sa storage
          .upload(filePath, formData.qrCode);
          
        if (uploadError) throw uploadError;
        
        // Add QR code path to the fee data
        newFee.qr_code = filePath;
      }
      
      // Insert fee into database
      const { data, error } = await supabase
        .from('fees')
        .insert([newFee], { returning: 'minimal' });
        
      if (error) throw error;
      
      // Create object for UI update
      const newLiability = {
        id: data?.[0]?.id || Date.now().toString(),
        name: formData.liabilityName,
        type: formData.liabilityType,
        academicYear: formData.academicYear,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        collector: formData.collectorName,
        gcashNumber: formData.gcashNumber,
        qrCode: qrPreview
      };
      
      // Update UI through callback
      onAddLiability(newLiability);
      
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
      onClose();
    }, 300);
  };
  
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };
  
  // Get liability name options based on selected type
  const getLiabilityNameOptions = () => {
    if (formData.liabilityType === "School Fee") {
      return ["Tuition Fee", "Laboratory Fee", "Library Fee", "Technology Fee", "Athletic Fee"];
    } else if (formData.liabilityType === "Membership Fee") {
      return ["Student Council", "Engineering Society", "Business Club", "Arts Club", "Medical Society"];
    }
    return [];
  };
  
  // Find organization name by ID for display
  const getOrganizationName = (id) => {
    const org = organizations.find(o => o.id.toString() === id.toString());
    return org ? org.name : "";
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
            {/* Organization - Display name but store ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              {organization.organization ? (
                <>
                  <input
                    type="text"
                    value={organization.organization}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm"
                  />
                  <input 
                    type="hidden"
                    name="organizationId"
                    value={formData.organizationId}
                  />
                </>
              ) : (
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                >
                  <option value="">Select organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Academic Year and Period */}
            <div className="flex gap-3">
              <div className="w-1/2">
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
              
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
                <select
                  name="periodId"
                  value={formData.periodId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent"
                >
                  <option value="">Select period</option>
                  {periods.map(period => (
                    <option key={period.id} value={period.id}>
                      {period.year} - {period.semester === "1" ? "1st" : period.semester === "2" ? "2nd" : "Summer"}
                    </option>
                  ))}
                </select>
              </div>
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
            
            {/* Collector Name and GCash Number */}
            <div className="flex gap-3">
              <div className="w-1/2">
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-[#a63f42] text-sm text-white rounded-md hover:bg-[#8a3538] transition-colors duration-200"
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