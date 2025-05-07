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
 * * 
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
  console.log("OCR Raw Text:", text); // Debug: log the entire text for inspection
  
  // Regular expression patterns
  const amountPattern = /GCash\s*\n\s*Amount\s*([\d,]+\.\d{2})/;
  
  // Multiple patterns for reference numbers to increase chances of extraction
  const refNoPatterns = [
      /Ref(?:\.|erence)?\s*No\.?\s*([\d\s]{7,20})/i,          // Standard format
      /No\.\s*([\d\s]{7,20})/i,                               // Just "No." followed by digits
      /(\d{4}\s+\d{3}\s+\d{6})/,                              // Specific format: XXXX XXX XXXXXX
      /(\d{4}[\s\-]*\d{3}[\s\-]*\d{6})/                       // Allow for different separators
  ];
  
  const datePattern = /([A-Za-z]{3}\s+\d{1,2},?\s+\d{4}\s+\d{1,2}:\d{2}\s+(AM|PM))/;

  // Try different patterns for reference number
  let refNo;
  for (const pattern of refNoPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
          refNo = match[1].trim();
          console.log(`Reference number found with pattern ${pattern}: ${refNo}`);
          break;
      }
  }
  
  // Fall back to searching for any pattern that looks like a reference number
  if (!refNo) {
      // Look for lines that have numbers in the expected format of a reference number
      const lines = text.split('\n');
      for (const line of lines) {
          const lineMatch = line.trim().match(/(\d{4}\s+\d{3}\s+\d{6})/);
          if (lineMatch && lineMatch[1]) {
              refNo = lineMatch[1];
              console.log(`Reference number found in line: ${refNo}`);
              break;
          }
      }
  }

  const amountMatch = text.match(amountPattern);
  const dateMatch = text.match(datePattern);

  return {
    amount: amountMatch ? amountMatch[1] : undefined,
    refNo: refNo,
    date: dateMatch ? dateMatch[0] : undefined,
  };
};