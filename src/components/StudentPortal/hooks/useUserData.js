import { useState, useEffect } from 'react';
import { supabase } from '../../../App';
import { Student } from '../../../models/Student';

/**
 * Custom hook to fetch and manage user data from Supabase
 * This connects the auth.users table with the public.students table
 * @returns {Object} User data, loading state, error state, and utility functions
 */
const useUserData = () => {
  const [userData, setUserData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches user data from Supabase
   */
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get the current authenticated user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error:', authError);
        setError(authError);
        return;
      }
      
      if (!authData.user) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }
      
      // Step 2: Get the student record using the auth user ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (studentError) {
        console.error('Error fetching student data:', studentError);
        
        // TODO: remove in final version
        // Fallback: Try to find any student data as a demo
        if (process.env.NODE_ENV === 'development') {
          console.log('Attempting to fetch fallback student data for development...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('students')
            .select('*')
            .limit(1)
            .single();
            
          if (!fallbackError && fallbackData) {
            console.log('Using fallback student data:', fallbackData);
            setUserData({
              id: fallbackData.id,
              firstName: fallbackData.first_name,
              lastName: fallbackData.last_name,
              srCode: fallbackData.sr_code,
              createdAt: fallbackData.created_at,
            });
          } else {
            setError(studentError);
          }
        } else {
          setError(studentError);
        }
      } else if (studentData) {
        // Successfully retrieved student data
        setUserData(new Student(studentData));
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns the full name of the user
   * @returns {string} Full name or loading placeholder
   */
  const getFullName = () => {
    return userData?.firstName && userData?.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : "Loading...";
  };
  
  /**
   * Returns the first letter of the first name for the avatar
   * @returns {string} First letter or placeholder
   */
  const getAvatarLetter = () => {
    return userData?.firstName ? userData?.firstName.charAt(0) : "?";
  };

  /**
   * Returns the student ID (SR Code)
   * @returns {string} SR Code or loading placeholder
   */
  const getSrCode = () => {
    return userData?.srCode || "Loading...";
  };
  
  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);
  
  // Return the userData state and helper functions
  return {
    userData,
    loading,
    error,
    fetchUserData,
    getFullName,
    getAvatarLetter,
    getSrCode
  };
};

export default useUserData;