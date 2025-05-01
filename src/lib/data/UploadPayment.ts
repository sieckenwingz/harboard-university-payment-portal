import { supabase } from "../../App";
import { Status,statusToJson } from "../../models/Status";

function generateFilename(ext: String) : String {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
}

interface UploadReceiptParams {
  userId: string;
  receiptFile: File;
  amount: number;
  refNo: string;
  date: string;
  selectedLiabilityId: number;
}

/**
 * Handles uploading a receipt image and updating related database records.
 *
 * Workflow:
 * 1. Attempts to upload the receipt image.
 *    - If the upload fails, the function exits early and no database operations are performed.
 * 2. If the upload succeeds:
 *    - Inserts a new row into the `payments` table.
 *    - Updates the related row in the `student_fees` table with the newly created `payment` ID.
 *
 * Note:
 * - If the file upload succeeds but the database update fails, the uploaded file will remain and 
 * is not automatically deleted.
 */
export async function uploadReceiptAndInsertPayment({
  userId,
  receiptFile,
  amount,
  refNo,
  date,
  selectedLiabilityId,
}: UploadReceiptParams) : Promise<
    | { error: null }
    | { error: Error }
  > {
    
  const { data: imageUploadData, error: fileError } = await supabase
    .storage
    .from('receipts')
    .upload(`${userId}/${generateFilename(receiptFile.name.split('.').pop()!)}`, receiptFile, {
      cacheControl: '3600',
      upsert: true,
      contentType: receiptFile.type,
    });

  if (fileError) {
    console.error('Error uploading file:', fileError);
    return { error: fileError };
  }

  const { data: dbData, error: dbError } = await supabase.functions.invoke('insert-payment', {
    body: {
      amount: amount,
      ref_number: refNo,
      payment_date: new Date(date).toISOString(),
      receipt_path: imageUploadData?.path ?? '',
      status: statusToJson(Status.UNDER_REVIEW),
      student_fee_id: selectedLiabilityId,
    }
  });

  if (dbError) {
    console.error('Error inserting payment and updating fee:', dbError);
    return { error: dbError };
  }

  return { error: null };
}
