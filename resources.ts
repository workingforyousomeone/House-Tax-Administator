
/**
 * CENTRALIZED RESOURCE MANAGEMENT
 * --------------------------------
 * To "hard code" images (so they work offline without internet):
 * 1. Use an online tool to convert your image file to a Base64 string.
 * 2. Paste the Base64 string into the variables below, replacing the URL.
 *    Example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 */

export const RESOURCES = {
  // Official Government of Andhra Pradesh Emblem
  // Current: User Provided URL
  AP_GOVT_LOGO: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOnXInFN-0DHfF8WexdBH7aynBuchHxLEP3A&s",
  
  // Panchayat Raj Department Logo
  // Current: User Provided URL
  PR_DEPT_LOGO: "https://ddnews.gov.in/wp-content/uploads/2025/11/images-1.png",
  
  // Fallback Emblem (Standard India Emblem)
  INDIA_EMBLEM: "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
};
