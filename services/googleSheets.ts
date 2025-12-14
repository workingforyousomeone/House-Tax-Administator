
// REPLACE THE URL BELOW WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzDqx7DXSnVmZ5pTno1U-s4RagvL-or5jzZA4LNVAdNua8zXdJYxa-8AvYlqYG3HHc/exec";

export const googleSheetsService = {
  async fetchAll() {
    if (SCRIPT_URL.includes("REPLACE")) {
        console.warn("Google Sheets URL not configured");
        return null;
    }
    try {
      // Add timestamp to prevent caching
      const url = `${SCRIPT_URL}?t=${Date.now()}`;
      console.log("Fetching from:", url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
      
      const data = await response.json();
      console.log("Google Sheets Data Received:", {
          owners: data.owners?.length,
          properties: data.properties?.length,
          demands: data.demands?.length
      });
      return data;
    } catch (error) {
      console.error("Failed to fetch from Google Sheets:", error);
      return null;
    }
  },

  async addPayment(paymentData: any) {
    if (SCRIPT_URL.includes("REPLACE")) return false;
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "addPayment", data: paymentData })
      });
      return true;
    } catch (error) {
      console.error("Failed to save payment:", error);
      return false;
    }
  },

  async updateHousehold(id: string, ownerData: any, propertyData: any, demands: any[]) {
    if (SCRIPT_URL.includes("REPLACE")) return false;
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "updateHousehold",
          id: id,
          owner: ownerData,
          property: propertyData,
          demands: demands
        })
      });
      return true;
    } catch (error) {
      console.error("Failed to update household:", error);
      return false;
    }
  }
};
