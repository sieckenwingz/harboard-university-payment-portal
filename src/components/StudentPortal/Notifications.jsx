import React, { useState } from 'react';
import { Menu, MoreVertical, Check, Trash } from 'lucide-react';
import { formatDate } from '../../Utils';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Payment Due Reminder",
      message: "Your tuition fee payment is due in 5 days.",
      date: "2025-04-10",
      read: false
    },
    {
      id: 2,
      title: "New Fee Added",
      message: "A new laboratory fee has been added to your account.",
      date: "2025-04-08",
      read: true
    },
    {
      id: 3,
      title: "Payment Successful",
      message: "Your recent payment of ₱2,500 has been successfully processed.",
      date: "2025-04-05",
      read: true
    },
    {
      id: 4,
      title: "Account Update",
      message: "Your student account details have been updated.",
      date: "2025-04-01",
      read: true
    }
  ]);

  const [openMenuId, setOpenMenuId] = useState(null);

  // Function to handle notification click (mark as read)
  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Function to mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setOpenMenuId(null);
  };

  // Function to mark notification as unread
  const markAsUnread = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: false } : notification
    ));
    setOpenMenuId(null);
  };

  // Function to delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    setOpenMenuId(null);
  };

  // Toggle menu open/close
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No notifications available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`relative bg-white rounded-lg shadow p-4 border-l-4 ${notification.read ? 'border-gray-200' : 'border-red-500'} transition-all hover:shadow-md`}
              onClick={(e) => {
                // Prevent click if menu was clicked
                if (e.target.closest('.menu-button') || e.target.closest('.dropdown-menu')) return;
                handleNotificationClick(notification.id);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${notification.read ? 'text-gray-700' : 'text-black'}`}>
                    {notification.title}
                    {!notification.read && <span className="ml-2 bg-red-500 w-2 h-2 rounded-full inline-block"></span>}
                  </h3>
                  <p className={`mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-800'}`}>{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(notification.date)}</p>
                </div>
                
                <div className="relative">
                  <button 
                    className="menu-button p-1 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(notification.id);
                    }}
                  >
                    <MoreVertical size={18} className="text-gray-500" />
                  </button>
                  
                  {openMenuId === notification.id && (
                    <div className="dropdown-menu absolute right-0 top-8 bg-white shadow-lg rounded-md py-1 w-48 z-10 border border-gray-200">
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check size={16} className="mr-2" />
                        Mark as read
                      </button>
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnread(notification.id);
                        }}
                      >
                        <Check size={16} className="mr-2" />
                        Mark as unread
                      </button>
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
