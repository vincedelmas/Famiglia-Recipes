export const WIDTH = 373;

export const HEIGHT = 290;

export const RATIO = WIDTH / HEIGHT;

export const MAX_IMPORT_TEXT_LENGTH = 10_000;

export const MAX_IMPORT_FILE_SIZE = 20 * 1024 * 1024;

export const DEFAULT_SCRYPT_METHOD = "scrypt:32768:8:1";

export const RECIPE_IMPORT_FILE_TYPES: Record<string, string[]> = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
};
