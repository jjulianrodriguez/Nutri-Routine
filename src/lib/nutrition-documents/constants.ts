export const NUTRITION_PDF_BUCKET = "nutrition-pdfs";
export const NUTRITION_PDF_MAX_SIZE_BYTES =
  Number(process.env.NUTRITION_PDF_MAX_SIZE_BYTES) || 10 * 1024 * 1024;
export const NUTRITION_PDF_SIGNED_URL_SECONDS = 5 * 60;
