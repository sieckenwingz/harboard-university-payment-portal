import Tesseract, { ImageLike } from "tesseract.js";
import { extractData } from "./OcrUtils";

/**
 * Processes an image file using OCR.
 *
 * @param file - An image file (e.g., JPG, PNG) containing a receipt.
 *
 * @returns A promise for an object containing:
 * - `refNo`: The extracted reference number or `undefined` if not found.
 * - `amount`: The amount in cents (integer) or `undefined` if not found.
 * - `date`: A `Date` object or `undefined`.
 */
export async function processOcr(file: ImageLike): Promise<{
    refNo: String | undefined,
    amount: number | undefined,
    date: Date | undefined,
}> {
    const { data: { text } } =  await Tesseract.recognize(
        file,
        'eng'
    );

    const extracted = extractData(text);
    console.log(extracted);

    return {
        refNo: extracted.refNo,
        amount: extracted.amount != null ? Number.parseInt(extracted.amount) * 100 : undefined,
        date: extracted.date != null ? new Date(extracted.date) : undefined,
    }
}