// src/helpers/supabaseHelpers.js
import { supabase } from "../App";

/**
 * Adds a new liability to the fees table
 * @param {Object} liability - The liability to add
 * @returns {Promise<{data: any, error: any}>} - The result of the insertion
 */
export const addLiability = async (liability) => {
  // Create the record object with exact column names from your table
  const newFee = {
    organization_id: liability.organizationId,
    period_id: liability.periodId,
    amount: liability.amount,
    deadline: liability.dueDate,
    collector_name: liability.collectorName,
    liab_name: liability.liabilityName, 
    liab_type: liability.liabilityType,
    acad_year: liability.academicYear,
    account_number: liability.gcashNumber,
    qr_code: liability.qrCodePath || null
  };

  // Insert the record into the fees table
  return await supabase.from('fees').insert([newFee]);
};

/**
 * Uploads a QR code image to storage and returns the path
 * @param {File} file - The QR code image file
 * @returns {Promise<string|null>} - The path to the uploaded file or null
 */
export const uploadQRCode = async (file) => {
  if (!file) return null;
  
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `qrcodes/${fileName}`;
    
    // Upload the file
    const { error } = await supabase.storage
      .from('fee-qr-codes') // Replace with your bucket name
      .upload(filePath, file);
    
    if (error) throw error;
    
    return filePath;
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return null;
  }
};