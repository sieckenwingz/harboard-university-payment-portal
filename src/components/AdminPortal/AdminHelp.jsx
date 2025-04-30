import React from 'react';

const AdminHelp = () => {
  return (
    <>
      <h1 className="text-gray-700 text-[28px] font-medium">Admin Help & Support</h1>
      
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Resources</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-[#a63f42] mb-2">Student Management</h3>
              <p className="text-gray-600">
                Access student records, update profiles, and manage student accounts through the Student Management module. 
                For bulk operations, use the Import/Export tool available in the Actions menu.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-[#a63f42] mb-2">Financial Administration</h3>
              <p className="text-gray-600">
                Process payments, approve fee adjustments, and manage payment extensions in the Finance module. 
                All financial transactions are logged and can be audited in the Transaction History section.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-[#a63f42] mb-2">System Configuration</h3>
              <p className="text-gray-600">
                Configure system settings, manage user roles, and update academic terms in the System Settings area.
                Changes to core configuration settings require approval from the IT Department.
              </p>
            </div>
            
            <div className="border-b pb-4 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-medium text-[#a63f42] mb-2">Reports Generation</h3>
              <p className="text-gray-600">
                Generate enrollment reports, financial summaries, and performance analytics through the Reports Dashboard.
                Custom reports can be created using the Report Builder tool with appropriate permissions.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Administrative Support</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">IT Support (Priority Line)</h3>
              <p className="text-gray-600">Email: admin-support@harboard.edu</p>
              <p className="text-gray-600">Phone: (123) 456-7899</p>
              <p className="text-gray-600">Available: 24/7 for critical issues</p>
              <p className="text-gray-600">Support Ticket</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">System Administration</h3>
              <p className="text-gray-600">Email: sysadmin@harboard.edu</p>
              <p className="text-gray-600">Phone: (123) 456-7895</p>
              <p className="text-gray-600">Office Hours: Monday-Friday, 8:00 AM - 8:00 PM</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">Executive Office</h3>
              <p className="text-gray-600">Email: executive@harboard.edu</p>
              <p className="text-gray-600">Phone: (123) 456-7880</p>
              <p className="text-gray-600">Office Hours: Monday-Friday, 9:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Documentation</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">Administrator's Handbook</h3>
              <p className="text-gray-600">
                Access comprehensive documentation on all administrative functions.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">Training Videos</h3>
              <p className="text-gray-600">
                Watch tutorials for common administrative tasks.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#a63f42] mb-1">System Updates & Changelogs</h3>
              <p className="text-gray-600">
                Stay updated with the latest system changes and features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHelp;