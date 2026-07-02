export const RESOURCE_PDF_BUCKET = "resource-pdfs";
export const RESOURCE_PDF_MAX_SIZE_BYTES =
 Number(process.env.RESOURCE_PDF_MAX_SIZE_BYTES) || 10 * 1024 * 1024;
export const RESOURCE_PDF_SIGNED_URL_SECONDS = 5 * 60;
