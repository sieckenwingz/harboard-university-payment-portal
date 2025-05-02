import { supabase } from "../App";
import { Fee, LiabilityType, LiabilityName, AcademicYear } from "../models/Fee";

/**
 * Uploads a QR code image to storage
 * @param file The file to upload
 * @returns The path to the uploaded file or null if upload failed
 */
export async function uploadQRCode(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `qrcodes/${fileName}`; // Changed from 'liabilities/' to match other code
      
      const { data, error } = await supabase.storage
        .from('fee-qr-codes') // Changed from 'qr_codes' to match other code
        .upload(filePath, file);
      
      if (error) throw error;
      
      return filePath;
    } catch (error) {
      console.error('Error uploading QR code:', error);
      return null;
    }
  }

/**
 * Gets the public URL for a QR code
 * @param path The storage path of the QR code
 * @returns The public URL for the QR code
 */
export function getQRCodeUrl(path: string): string | null {
  if (!path) return null;
  
  const { data } = supabase.storage
    .from('qr_codes')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Creates a new fee record
 * @param fee The fee to create
 * @param qrCodeFile Optional QR code file to upload
 * @returns The ID of the created fee or null if creation failed
 */
export async function createFee(
  fee: Omit<Fee, 'id' | 'createdAt'>, 
  qrCodeFile?: File
): Promise<number | null> {
  try {
    // Upload QR code if provided
    // let qrCodePath = null;
    let qrCodePath: string | null = null; // need mag null
    if (qrCodeFile) {
      qrCodePath = await uploadQRCode(qrCodeFile) || null;
    }
    
    // Convert to API object
    const organizationId = typeof fee.organizationId === 'object' 
      ? fee.organizationId.id 
      : fee.organizationId;
      
    const periodId = typeof fee.periodId === 'object'
      ? fee.periodId.id
      : fee.periodId;
    
    // Call the database function
    const { data, error } = await supabase.rpc('insert_liability', {
      p_organization_id: organizationId,
      p_period_id: periodId,
      p_amount: Math.round(fee.amount), // Amount should already be in cents
      p_deadline: fee.deadline?.toISOString(),
      p_collector_name: fee.collectorName,
      p_liab_name: fee.name,
      p_liab_type: fee.type,
      p_acad_year: fee.academicYear,
      p_account_number: fee.accountNumber,
      p_qr_code: qrCodePath
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating fee:', error);
    return null;
  }
}

/**
 * Updates an existing fee record
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
    // Upload new QR code if provided
    if (qrCodeFile) {
      const qrCodePath = await uploadQRCode(qrCodeFile);
      if (qrCodePath) {
        updates.qrCode = qrCodePath;
      }
    }
    
    // Format the update parameters
    const updateParams: Record<string, any> = {
      p_id: id
    };
    
    // Only include fields that are present in updates
    if (updates.organizationId !== undefined) {
      updateParams.p_organization_id = typeof updates.organizationId === 'object' 
        ? updates.organizationId.id 
        : updates.organizationId;
    }
    
    if (updates.periodId !== undefined) {
      updateParams.p_period_id = typeof updates.periodId === 'object'
        ? updates.periodId.id
        : updates.periodId;
    }
    
    if (updates.amount !== undefined) {
      updateParams.p_amount = Math.round(updates.amount); // Amount should already be in cents
    }
    
    if (updates.deadline !== undefined) {
      updateParams.p_deadline = updates.deadline?.toISOString();
    }
    
    if (updates.name !== undefined) {
      updateParams.p_liab_name = updates.name;
    }
    
    if (updates.type !== undefined) {
      updateParams.p_liab_type = updates.type;
    }
    
    if (updates.academicYear !== undefined) {
      updateParams.p_acad_year = updates.academicYear;
    }
    
    if (updates.collectorName !== undefined) {
      updateParams.p_collector_name = updates.collectorName;
    }
    
    if (updates.accountNumber !== undefined) {
      updateParams.p_account_number = updates.accountNumber;
    }
    
    if (updates.qrCode !== undefined) {
      updateParams.p_qr_code = updates.qrCode;
    }
    
    // Call the database function
    const { data, error } = await supabase.rpc('update_liability', updateParams);
    
    if (error) throw error;
    
    return data === true;
  } catch (error) {
    console.error('Error updating fee:', error);
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
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    
    return data.map(item => new Fee(item));
  } catch (error) {
    console.error('Error fetching fees by organization:', error);
    return null;
  }
}

/**
 * Gets fees for a specific period
 * @param periodId The ID of the period
 * @returns Array of fees or null if retrieval failed
 */
export async function getFeesByPeriod(periodId: number): Promise<Fee[] | null> {
  try {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('period_id', periodId);
    
    if (error) throw error;
    
    return data.map(item => new Fee(item));
  } catch (error) {
    console.error('Error fetching fees by period:', error);
    return null;
  }
}