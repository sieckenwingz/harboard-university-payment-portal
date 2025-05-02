import { supabase } from "../App";
import { Fee, LiabilityType, LiabilityName, AcademicYear } from "../models/Fee";

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
  updates: Partial<Omit<Fee, 'id' | 'createdAt'>>,
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
    
    // Format update parameters for the database - normalize data types
    let updateObj: any = {};
    
    if (updates.name) updateObj.liab_name = updates.name;
    if (updates.type) updateObj.liab_type = updates.type;
    if (updates.academicYear) updateObj.acad_year = updates.academicYear;
    if (updates.amount !== undefined) updateObj.amount = updates.amount;
    if (updates.deadline) {
      // Convert to string if it's a Date object
      updateObj.deadline = typeof updates.deadline === 'string' 
        ? updates.deadline 
        : updates.deadline instanceof Date ? updates.deadline.toISOString() : null;
    }
    if (updates.collectorName) updateObj.collector_name = updates.collectorName;
    if (updates.accountNumber) updateObj.account_number = updates.accountNumber;
    if (updates.qrCode) updateObj.qr_code = updates.qrCode;
    if (updates.organizationId) {
      updateObj.organization_id = typeof updates.organizationId === 'object' 
        ? updates.organizationId.id : updates.organizationId;
    }
    if (updates.periodId) {
      updateObj.period_id = typeof updates.periodId === 'object'
        ? updates.periodId.id : updates.periodId;
    }
    
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
 * Gets fees for a specific organization
 * @param organizationId The ID of the organization
 * @returns Array of fees or null if retrieval failed
 */
export async function getFeesByOrganization(organizationId: number): Promise<Fee[] | null> {
    try {
      console.log(`Fetching fees for organization ID: ${organizationId}`);
      
      // Check if organizationId is valid
      if (!organizationId || isNaN(Number(organizationId))) {
        console.error(`Invalid organization ID: ${organizationId}`);
        return [];
      }
      
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} fees from database:`, data);
      
      if (!data || data.length === 0) {
        console.log('No fees found for this organization');
        return [];
      }
      
      // Map the data to Fee objects
      try {
        const mappedFees = data.map(item => {
          console.log('Mapping fee item:', item);
          return new Fee(item);
        });
        
        console.log('Mapped fees:', mappedFees);
        return mappedFees;
      } catch (mappingError) {
        console.error('Error mapping fee data to Fee objects:', mappingError);
        // Return the raw data as a fallback if mapping fails
        return data;
      }
    } catch (error) {
      console.error('Error fetching fees by organization:', error);
      return [];
    }
  }

/**
 * Deletes a fee record from the database
 * @param id The ID of the fee to delete
 * @returns True if the deletion was successful, false otherwise
 */
export async function deleteFee(id: number): Promise<boolean> {
  try {
    // Call the database function or use a direct delete
    const { data, error } = await supabase
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

/**
 * Retrieves a list of all fees
 * @returns Array of fees or null if retrieval failed
 */
export async function getAllFees(): Promise<Fee[] | null> {
  try {
    const { data, error } = await supabase
      .from('fees')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => new Fee(item));
  } catch (error) {
    console.error('Error fetching fees:', error);
    return null;
  }
}