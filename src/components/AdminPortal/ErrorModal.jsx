//error modal for error handling

import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-4 flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Error</h3>
          <p className="text-center text-gray-600 mb-4">{message}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#a63f42] text-white rounded-md hover:bg-[#8a3538] transition-colors duration-200 w-full"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;