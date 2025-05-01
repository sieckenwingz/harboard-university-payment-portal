/**
 * Extracts payment-related information from OCR-scanned text of a receipt.
 *
 * This looks for specific patterns in the given text and extracts:
 * - `amount`: The value following the "GCash" and "Amount" lines (e.g., 350.00).
 * - `refNo`: The reference number following "Ref No."
 * - `date`: The date.
 *
 * @param text - The processed text from OCR.
 * @returns An object containing the extracted `amount`, `refNo`, and `date`. 
 *          If any field is not found, it will be `undefined`.
 * 
 * @example
 * const text = `
 *   FI..T NAM«-E L. +63 999 214 12...
 *   Sent via GCash
 *   Amount
 *   350.00
 *   Total Amount Sent ₱350.00
 *   Ref No. 0019284762842
 *   Feb 25, 2025 8:50 PM
 * `;
 *
 * const result = extractData(text);
 * // result = {
 * //   amount: "350.00",
 * //   refNo: "0019284762842",
 * //   date: "Feb 25, 2025 8:50 PM"
 * // };
 */
export const extractData = (text: String) => {
    // Regular expression patterns to extract Amount, Ref No., and Date
    const amountPattern = /GCash\s*\n\s*Amount\s*([\d,]+\.\d{2})/; // Amount like 350.00
    const refNoPattern = /Ref No\.?\s*(\d{12,16})/i; // Ref No. like 0019284762842
    const datePattern = /([A-Za-z]{3} \d{1,2}, \d{4} \d{1,2}:\d{2} (AM|PM))/; // Date format like Feb 25, 2025 8:50 PM

    const amountMatch = text.match(amountPattern);
    const refNoMatch = text.match(refNoPattern);
    const dateMatch = text.match(datePattern);

    return {
      amount: amountMatch ? amountMatch[1] : undefined,
      refNo: refNoMatch ? refNoMatch[1] : undefined,
      date: dateMatch ? dateMatch[0] : undefined,
    };
  };