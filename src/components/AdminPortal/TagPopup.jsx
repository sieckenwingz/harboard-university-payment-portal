import React, { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../App";
import { useUntaggedStudents } from "./hooks/useUntaggedStudents";

const TagPopup = ({ liability, onClose, onTagged }) => {
  // Create references for DOM elements
  const popupRef = useRef(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Animation states
  const [formVisible, setFormVisible] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // const { studentPeriods, spLoading, spError } = useStudentPeriods(organization.id, liability.period.id);
  const { untaggedStudents, loading: usLoading, error: usError } = useUntaggedStudents(liability.id);

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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (usLoading) {
      alert("Users loading")
      return;
    }
    
    setLoading(true);
    
    try {
      // Create data for bulk insert
      const data = untaggedStudents.map((s) => {
        return {
          'student_id': s.id,
          'fee_id': liability.id,
        }
      });

      const { error } = await supabase
        .from('student_fees')
        .insert(data);
      if (error) throw error;
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage("An error occurred while tagging");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      handleCloseWithAnimation();
      onTagged();
    }, 300);
  };
  
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out modal-backdrop"
         style={{ opacity: formVisible ? 1 : 0 }}>
      <div 
        ref={popupRef}
        className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] transition-all duration-300 ease-in-out ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Tag students</h2>
          <button 
            onClick={handleCloseWithAnimation} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto py-4 px-4">
          {
            usLoading ? <p>Loading</p> 
            : <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Found <b>{untaggedStudents.length}</b> untagged students</p>
              {untaggedStudents.map((student) => (
                <p key={student.id}>{student.getFullName()}</p>
              ))}
            </div>
          }
        </div>

        {/* Footer */}
        <div className="mt-2 p-4 bg-gray-50 border-t flex justify-end space-x-3 shrink-0">
          {untaggedStudents?.length > 0 ? 
            <div>
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
                {loading ? 'Saving...' : 'Tag students'}
              </button>
            </div>
          : 
            <button
                type="button"
                onClick={handleCloseWithAnimation}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
              Cancel
            </button>}
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
                Students tagged
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

export default TagPopup;