import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import AddLiabilityPopup from "./AddLiabilityPopup";
import EditLiabilityPopup from "./EditLiabilityPopup";
import { supabase } from "../../App";
import { updateFee, getFeeById, deleteFee } from "../../helpers/FeeHelpers";

const ManageDeptLiabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, liability: null });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingLiability, setEditingLiability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Preserve the organization information from location state
  const organization = location.state?.organization;
  
  const [liabilities, setLiabilities] = useState([]);

  // Critical function - fetch liabilities directly from the database
  const fetchLiabilities = async () => {
    setIsLoading(true);
    
    // Try to get organization ID from location state
    let orgId = organization.id;
    
    try {
      // Direct query to fees table for this organization
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('organization_id', orgId);
      
      if (error) {
        console.error("Error fetching fees:", error);
        setIsLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Map to component format
        const mappedLiabilities = data.map(fee => ({
          id: fee.id.toString(),
          name: fee.liab_name || 'Unknown Fee',
          type: fee.liab_type || 'School Fee',
          amount: fee.amount / 100, // Convert cents to dollars
          dueDate: fee.deadline ? new Date(fee.deadline).toISOString().split('T')[0] : null,
          collector: fee.collector_name || '',
          gcashNumber: fee.account_number || '',
          academicYear: fee.acad_year || '',
          period: fee.period_id ? fee.period_id.toString() : '1',
          qrCode: fee.qr_code || null
        }));
        
        setLiabilities(mappedLiabilities);
      } else {
        setLiabilities([]);
      }
    } catch (error) {
      console.error("Error fetching liabilities:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLiabilities();
  }, []);
  
  const rowsPerPage = 5;
  const totalPages = Math.ceil(liabilities.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentLiabilities = liabilities.slice(startIndex, startIndex + rowsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const goBackToManagement = () => {
    navigate(-1);
  };
  
  // Handle editing liability
  const handleEditLiability = async (liability, e) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    
    try {
      // Fetch the complete fee record if not already available
      const completeData = await getFeeById(parseInt(liability.id));
      
      if (completeData) {
        // Load the complete data into the editing state
        setEditingLiability({
          id: completeData.id.toString(),
          name: completeData.name,
          type: completeData.type,
          academicYear: completeData.academicYear,
          period: completeData.periodId.toString(), // Adjust according to your data structure
          amount: completeData.amount / 100, // Convert from cents to display amount
          dueDate: completeData.deadline ? completeData.deadline.toISOString().split('T')[0] : '',
          collector: completeData.collectorName,
          gcashNumber: completeData.accountNumber,
          qrCode: completeData.qrCode
        });
      } else {
        // Fallback to the provided data if fetching fails
        setEditingLiability({ ...liability });
      }
      
      setShowEditPopup(true);
    } catch (error) {
      console.error("Error fetching complete liability data:", error);
      // Even if we can't get complete data, still allow editing with available data
      setEditingLiability({ ...liability });
      setShowEditPopup(true);
    }
  };
  
  // Handle updating liability
  const handleUpdateLiability = async (updatedLiabilityData) => {
    try {
      // Convert the form data to match the expected format in your database
      const feeUpdates = {
        name: updatedLiabilityData.name,
        type: updatedLiabilityData.type,
        academicYear: updatedLiabilityData.academicYear,
        amount: Math.round(parseFloat(updatedLiabilityData.amount) * 100), // Convert to cents for database
        deadline: updatedLiabilityData.dueDate, 
        collectorName: updatedLiabilityData.collector,
        accountNumber: updatedLiabilityData.gcashNumber,
        periodId: parseInt(updatedLiabilityData.period) // Make sure period is an integer
      };
  
      // If there's a new QR code file
      const qrCodeFile = updatedLiabilityData.qrCode instanceof File ? 
                         updatedLiabilityData.qrCode : null;
  
      // Call the update function with properly parsed ID
      const success = await updateFee(
        parseInt(updatedLiabilityData.id), 
        feeUpdates, 
        qrCodeFile
      );
  
      if (success) {
        // Refresh data from the server
        fetchLiabilities();
        
        // Close the popup
        setShowEditPopup(false);
        setEditingLiability(null);
      } else {
        console.error("Failed to update liability in the database");
        alert("Failed to update liability. Please check console for errors.");
      }
    } catch (error) {
      console.error("Error updating liability:", error);
      alert("Error updating liability: " + error.message);
    }
  };
  
  // For adding new liability
  const openAddLiabilityPopup = () => {
    setShowAddPopup(true);
  };
  
  const closeAddLiabilityPopup = () => {
    setShowAddPopup(false);
  };
  
  const closeEditLiabilityPopup = () => {
    setShowEditPopup(false);
    setEditingLiability(null);
  };
  
  const handleAddLiability = (newLiability) => {
    // After adding, refresh the data from the database
    fetchLiabilities();
    
    // Update pagination if needed
    if ((liabilities.length + 1) > currentPage * rowsPerPage) {
      setCurrentPage(Math.ceil((liabilities.length + 1) / rowsPerPage));
    }
  };
  
  // For deleting liability
  const handleDeleteLiability = (liability, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({ show: true, liability });
  };
  
  const confirmDeleteLiability = async () => {
    try {
      // Delete from database
      const success = await deleteFee(parseInt(deleteModal.liability.id));
      
      if (success) {
        // Refresh data from the server
        fetchLiabilities();
        
        // Reset delete modal
        setDeleteModal({ show: false, liability: null });
        
        // Update pagination if needed
        const remainingItems = liabilities.length - 1;
        const newTotalPages = Math.ceil(remainingItems / rowsPerPage);
        if (currentPage > newTotalPages && currentPage > 1) {
          setCurrentPage(newTotalPages);
        }
      } else {
        console.error("Failed to delete liability from the database");
      }
    } catch (error) {
      console.error("Error deleting liability:", error);
    }
  };

  const cancelDeleteLiability = () => {
    setDeleteModal({ show: false, liability: null });
  };
  
  // Render component
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={goBackToManagement} 
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {organization.organization} Liabilities
          </h1>
          <p className="text-gray-500">
            Manage all financial liabilities for this organization
          </p>
        </div>
      </div>
      
      {/* Add New Button */}
      <div className="mb-6">
        <button 
          className="px-4 py-2 bg-[#a63f42] text-white rounded-md text-sm hover:bg-[#8a3538] transition-colors duration-200 flex items-center"
          onClick={openAddLiabilityPopup}
        >
          Add New Liability
        </button>
      </div>
      
      {/* Table Header */}
      <div className="w-full flex justify-between py-4 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "30%" }} className="text-gray-700 font-semibold">LIABILITY NAME</span>
        <span style={{ width: "25%" }} className="text-gray-700 font-semibold">AMOUNT</span>
        <span style={{ width: "30%" }} className="text-gray-700 font-semibold">DUE DATE</span>
        <span style={{ width: "30%" }} className="text-gray-700 font-semibold">COLLECTOR</span>
        <span style={{ width: "30%" }} className="text-gray-700 font-semibold">GCASH NUMBER</span>
        <span style={{ width: "10%" }} className="text-gray-700 font-semibold">ACTIONS</span>
      </div>
      
      {/* Table Content */}
      {isLoading ? (
        <div className="w-full flex justify-center items-center h-32 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#a63f42]"></div>
        </div>
      ) : liabilities.length === 0 ? (
        <div className="w-full flex flex-col justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          <p>No liabilities found for this organization.</p>
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentLiabilities.map((liability) => (
            <div
              key={liability.id}
              className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50"
            >
              <span style={{ width: "30%" }} className="text-gray-700">
                <span className="font-medium">{liability.name}</span>
                <div className="text-xs text-gray-500">{liability.type}</div>
              </span>
              <span style={{ width: "25%" }} className="text-gray-700 font-medium">
                {formatCurrency(liability.amount)}
              </span>
              <span style={{ width: "30%" }} className="text-gray-700">
                {formatDate(liability.dueDate)}
              </span>
              <span style={{ width: "30%" }} className="text-gray-700">
                {liability.collector}
              </span>
              <span style={{ width: "30%" }} className="text-gray-700">
                {liability.gcashNumber}
              </span>
              <span style={{ width: "10%" }} className="flex space-x-2">
                <button 
                  onClick={(e) => handleEditLiability(liability, e)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200"
                  title="Edit Liability"
                  type="button"
                  aria-label="Edit liability"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={(e) => handleDeleteLiability(liability, e)}
                  className="p-1 text-maroon hover:bg-red-100 rounded-full transition-all duration-200"
                  title="Delete Liability"
                  type="button"
                  aria-label="Delete liability"
                >
                  <Trash2 size={18} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {liabilities.length > 0 && (
        <div className="w-full flex items-center justify-between mt-6 px-4">
          <span className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 px-4 rounded-lg shadow border text-sm flex items-center ${
                currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex">
              {Array.from({ length: totalPages > 0 ? Math.min(5, totalPages) : 1 }, (_, i) => {
                const pageNum = currentPage <= 3 
                  ? i + 1 
                  : currentPage >= totalPages - 2 
                    ? totalPages - 4 + i 
                    : currentPage - 2 + i;
                
                if (pageNum <= totalPages && pageNum > 0) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md mx-0.5 ${
                        currentPage === pageNum 
                          ? "bg-[#a63f42] text-white" 
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 px-4 rounded-lg shadow border text-sm flex items-center ${
                currentPage === totalPages || totalPages === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Liability</h3>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.liability?.name}"?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteLiability}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLiability}
                className="px-4 py-2 bg-maroon text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Liability Popup */}
      {showAddPopup && (
        <AddLiabilityPopup
          organization={organization}
          onClose={closeAddLiabilityPopup}
          onAddLiability={handleAddLiability}
        />
      )}
      
      {/* Edit Liability Popup */}
      {showEditPopup && editingLiability && (
        <EditLiabilityPopup
          liability={editingLiability}
          organization={organization}
          onClose={closeEditLiabilityPopup}
          onUpdateLiability={handleUpdateLiability}
        />
      )}
    </div>
  );
};

export default ManageDeptLiabs;