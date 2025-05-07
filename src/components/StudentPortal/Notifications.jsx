import React, { useState, useEffect } from 'react';
import { Menu, MoreVertical, Check, Trash, Loader2 } from 'lucide-react';
import { supabase } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../Utils';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { user } = useAuth();

  // Fetch notifications from Supabase when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          console.error("No authenticated user found");
          setLoading(false);
          return;
        }

        // Fetch notifications for the current user
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setNotifications(data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Handle notification click (mark as read)
  const handleNotificationClick = async (id) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      // Update in local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      // Update in local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark notification as unread
  const markAsUnread = async (id) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', id);

      if (error) throw error;

      // Update in local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: false } : notification
      ));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error marking notification as unread:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.filter(notification => notification.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Toggle menu open/close
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={24} className="animate-spin text-[#a63f42]" />
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-red-500">Error loading notifications: {error}</p>
        </div>
      ) : notifications.length === 0 ? (
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
                  <p className="text-xs text-gray-400 mt-2">{formatDate(notification.created_at)}</p>
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