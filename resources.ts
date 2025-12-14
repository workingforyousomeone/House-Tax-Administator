
/**
 * centralized resource management.
 * To "hard code" images (so they work offline):
 * 1. Convert your image to Base64 (online tools available).
 * 2. Replace the URL string below with the Base64 string (e.g., "data:image/png;base64,iVBORw0KGgo...")
 */

export const RESOURCES = {
  // Official Government of Andhra Pradesh Emblem (Round)
  AP_GOVT_LOGO: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOnXInFN-0DHfF8WexdBH7aynBuchHxLEP3A&s",
  
  // Panchayat Raj Department Logo (Orange/Black figures)
  PR_DEPT_LOGO: "https://ddnews.gov.in/wp-content/uploads/2025/11/images-1.png",
  
  // Fallback Emblem of India
  INDIA_EMBLEM: "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
};
