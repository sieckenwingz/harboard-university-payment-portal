import { supabase } from "../App";
import { Fee } from "../models/Fee";

/**
 * Uploads a QR code image to storage with proper error handling
 * @param file The file to upload
 * @returns The path to the uploaded file or null if upload failed
 */
export async function uploadQRCode(file: File): Promise<string | null> {
  // Skip if file is null or undefined
  if (!file) return null;
  
  try {
    // Check if we're in a browser context with storage access
    if (typeof window === 'undefined') {
      console.error('Storage access attempted in non-browser context');
      return null;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `qrcodes/${fileName}`;
    
    // Make sure we're not uploading a blob URL
    const fileToUpload = file instanceof Blob ? file : await fetch(file).then(r => r.blob());
    
    try {
      const { data, error } = await supabase.storage
        .from('fee-qr-codes')
        .upload(filePath, fileToUpload);
      
      if (error) {
        // Check if it's a storage access error
        if (error.message && error.message.includes('Access to storage is not allowed')) {
          console.warn('Storage access not allowed. Skipping QR code upload.');
          return null;
        }
        throw error;
      }
      
      return filePath;
    } catch (storageError) {
      console.error('Storage access error:', storageError);
      return null; // Return null but don't break the flow
    }
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return null;
  }
}

/**
 * Updates an existing fee record with graceful storage error handling
 * @param id The ID of the fee to update
 * @param updates The partial fee updates
 * @param qrCodeFile Optional new QR code file
 * @returns True if update was successful, false otherwise
 */
export async function updateFee(
  id: number,
  updates: Partial<{
    deadline: string,
    collectorName: string,
    accountNumber: string,
    qrCode: string
  }>,
  qrCodeFile?: File
): Promise<boolean> {
  try {
    // Upload new QR code if provided, with error handling
    if (qrCodeFile) {
      try {
        const qrCodePath = await uploadQRCode(qrCodeFile);
        if (qrCodePath) {
          updates.qrCode = qrCodePath;
        }
      } catch (uploadError) {
        console.warn('QR code upload failed, but continuing with fee update:', uploadError);
        // Continue with the update even if QR upload fails
      }
    }
    
    // Format update parameters for the database
    let updateObj: any = {};
    
    if (updates.deadline) updateObj.deadline = updates.deadline;
    if (updates.collectorName) updateObj.collector_name = updates.collectorName;
    if (updates.accountNumber) updateObj.account_number = updates.accountNumber;
    if (updates.qrCode) updateObj.qr_code = updates.qrCode;
    
    // Direct update to the fees table
    const { error } = await supabase
      .from('fees')
      .update(updateObj)
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating fee:', error);
    return false;
  }
}

/**
 * Retrieves a fee by ID
 * @param id The ID of the fee to retrieve
 * @returns The fee or null if not found
 */
export async function getFeeById(id: number): Promise<Fee | null> {
  try {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return new Fee(data);
  } catch (error) {
    console.error('Error fetching fee:', error);
    return null;
  }
}

/**
 * Deletes a fee record from the database
 * @param id The ID of the fee to delete
 * @returns True if the deletion was successful, false otherwise
 */
export async function deleteFee(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting fee:', error);
    return false;
  }
}