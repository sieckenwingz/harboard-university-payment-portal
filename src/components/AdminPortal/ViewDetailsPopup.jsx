import React from "react";
import { X, CheckCircle, AlertTriangle, Calendar, Clock, RefreshCw } from "lucide-react";

const ViewDetailsPopup = ({ show, organizationData, onClose, onDataChange }) => {
  if (!show || !organizationData) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityLabel = (pendingCount) => {
    if (pendingCount >= 20) {
      return {
        label: "High Priority",
        icon: <AlertTriangle size={16} className="mr-1" />,
        color: "text-red-600"
      };
    } else if (pendingCount >= 10) {
      return {
        label: "Medium Priority",
        icon: <RefreshCw size={16} className="mr-1" />,
        color: "text-orange-600"
      };
    } else {
      return {
        label: "Low Priority",
        icon: <CheckCircle size={16} className="mr-1" />,
        color: "text-green-600"
      };
    }
  };

  const priorityInfo = getPriorityLabel(organizationData.pendingVerifications);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Organization Details</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {organizationData.name}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-500 mr-2" />
                <span className="text-gray-700">
                  Last Updated: {formatDate(organizationData.lastUpdate)}
                </span>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="text-gray-500 mr-2" />
                <span className="text-gray-700">
                  Type: {organizationData.type}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">
              Verification Status
            </h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending:</span>
              <span className="font-semibold text-gray-800">
                {organizationData.pendingVerifications}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
              <div
                className={`h-2.5 rounded-full ${
                  organizationData.pendingVerifications >= 20
                    ? "bg-red-500"
                    : organizationData.pendingVerifications >= 10
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (organizationData.pendingVerifications / 30) * 100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center">
              <div className={`flex items-center ${priorityInfo.color}`}>
                {priorityInfo.icon}
                <span>{priorityInfo.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsPopup;