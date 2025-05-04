import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit, Trash2, CheckCircle } from "lucide-react";
import AddLiabilityPopup from "./AddLiabilityPopup";
import EditLiabilityPopup from "./EditLiabilityPopup";
import { supabase } from "../../App";
import { updateFee, getFeeById, deleteFee } from "../../helpers/FeeHelpers";
import { useFees } from "./hooks/useFees";

const ManageDeptLiabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, liability: null });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingLiability, setEditingLiability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, message: '', action: '' });
  
  // Preserve the organization information from location state
  const organization = location.state?.organization;
  
  const { fees, loading, error, refetchFees } = useFees(organization.id);
  
  const rowsPerPage = 5;
  const totalPages = Math.ceil(fees.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentLiabilities = fees.slice(startIndex, startIndex + rowsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount/100);
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
      // Set loading state
      setIsLoading(true);
      
      // Fetch the complete fee record if not already available
      const completeData = await getFeeById(parseInt(liability.id));
      
      if (completeData) {
        // Load the complete data into the editing state
        setEditingLiability({
          id: completeData.id.toString(),
          dueDate: completeData.deadline ? new Date(completeData.deadline).toISOString().split('T')[0] : '',
          collectorName: completeData.collectorName,
          gcashNumber: completeData.accountNumber,
          qrCode: completeData.qrCode
        });
      } else {
        // Fallback to the provided data if fetching fails
        setEditingLiability({ 
          id: liability.id,
          dueDate: liability.deadline ? new Date(liability.deadline).toISOString().split('T')[0] : '',
          collectorName: liability.collectorName,
          gcashNumber: liability.accountNumber,
          qrCode: liability.qrCode
        });
      }
      
      setShowEditPopup(true);
    } catch (error) {
      console.error("Error fetching complete liability data:", error);
      // Show an error modal
      setSuccessModal({ 
        show: true, 
        message: "Could not load liability details: " + error.message,
        action: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle updating liability
  const handleUpdateLiability = async (updatedLiabilityData) => {
    try {
      setIsLoading(true);
      
      // Convert the form data to match the expected format in the database
      const feeUpdates = {
        deadline: updatedLiabilityData.dueDate, 
        collectorName: updatedLiabilityData.collectorName,
        accountNumber: updatedLiabilityData.gcashNumber
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
        // Close the popup
        setShowEditPopup(false);
        setEditingLiability(null);
        
        // Show success message
        setSuccessModal({
          show: true,
          message: "Liability has been successfully updated.",
          action: "update"
        });
        
        // Refresh the data
        await refetchFees();
      } else {
        throw new Error("Failed to update liability in the database");
      }
    } catch (error) {
      console.error("Error updating liability:", error);
      setSuccessModal({
        show: true,
        message: "Error updating liability: " + error.message,
        action: "error"
      });
    } finally {
      setIsLoading(false);
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
  
  const handleAddLiability = async (newLiability) => {
    // Close the popup
    setShowAddPopup(false);
    
    // Show success message
    setSuccessModal({
      show: true,
      message: "Liability successfully added!",
      action: "add"
    });
    
    // Refresh the data
    await refetchFees();
  };
  
  // For deleting liability
  const handleDeleteLiability = (liability, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({ show: true, liability });
  };
  
  const confirmDeleteLiability = async () => {
    if (!deleteModal.liability || !deleteModal.liability.id) {
      console.error("No liability selected for deletion or missing ID");
      return;
    }
  
    try {
      // Store the ID and name of the liability to be deleted
      const liabilityIdToDelete = parseInt(deleteModal.liability.id);
      const liabilityName = deleteModal.liability.name || "Selected liability";
      
      // Close the modal immediately
      setDeleteModal({ show: false, liability: null });
      
      // Show loading indicator
      setIsLoading(true);
      
      // Perform the database deletion
      const success = await deleteFee(liabilityIdToDelete);
      
      if (!success) {
        throw new Error("Failed to delete liability from the database");
      }
      
      // Show success message
      setSuccessModal({
        show: true,
        message: `"${liabilityName}" has been successfully deleted.`,
        action: "delete"
      });
      
      // Refresh the data
      await refetchFees();
      
    } catch (error) {
      console.error("Error deleting liability:", error);
      setSuccessModal({
        show: true,
        message: "Error deleting liability: " + error.message,
        action: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeleteLiability = () => {
    setDeleteModal({ show: false, liability: null });
  };
  
  // Get semester label based on period value
  const getSemesterLabel = (period) => {
    if (!period) return '';
    
    switch(period.semester) {
      case "1": return "1st Semester";
      case "2": return "2nd Semester";
      case "SUMMER": return "Summer";
      default: return period.semester;
    }
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
            {organization.name} 
          </h1>
          <p className="text-gray-500">
            Manage all membership fees for this organization
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
      
      {/* Table Header - Removed LIABILITY NAME column */}
      <div className="w-full grid grid-cols-6 py-4 border-b bg-gray-50 px-4 rounded-t-lg">
        <span className="text-gray-700 font-semibold">ACADEMIC YEAR</span>
        <span className="text-gray-700 font-semibold">PERIOD</span>
        <span className="text-gray-700 font-semibold">AMOUNT</span>
        <span className="text-gray-700 font-semibold">DUE DATE</span>
        <span className="text-gray-700 font-semibold">COLLECTOR</span>
        <span className="text-gray-700 font-semibold text-center">ACTIONS</span>
      </div>
      
      {/* Table Content - Removed LIABILITY NAME column and adjusted grid */}
      {isLoading || loading ? (
        <div className="w-full flex justify-center items-center h-32 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#a63f42]"></div>
        </div>
      ) : fees.length === 0 ? (
        <div className="w-full flex flex-col justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          <p>No liabilities found for this organization.</p>
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentLiabilities.map((liability) => (
            <div
              key={liability.id}
              className="w-full grid grid-cols-6 py-4 px-4 border-b hover:bg-gray-50"
            >
              <span className="text-gray-700">{liability.academicYear}</span>
              <span className="text-gray-700">{getSemesterLabel(liability.periodId)}</span>
              <span className="text-gray-700">{formatCurrency(liability.amount)}</span>
              <span className="text-gray-700">{formatDate(liability.deadline)}</span>
              <span className="text-gray-700">{liability.collectorName}</span>
              <div className="flex space-x-2 justify-center">
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
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {fees.length > 0 && (
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
              Are you sure you want to delete "{deleteModal.liability?.name || 'this liability'}"?
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
      
      {/* Success/Error Modal */}
      {successModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <div className="p-4 flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-center text-gray-600 mb-4">
                {successModal.message}
              </p>
              <button
                onClick={() => setSuccessModal({ show: false, message: '', action: '' })}
                className="px-4 py-2 bg-[#a63f42] text-white rounded-md hover:bg-[#8a3538] transition-colors duration-200 w-full"
              >
                OK
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