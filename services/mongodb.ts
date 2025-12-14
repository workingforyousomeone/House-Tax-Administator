
// --- MONGODB ATLAS CONFIGURATION ---
// Credentials updated based on user input
const API_KEY = "c620c3a5-06c9-42cb-8432-730e70ee58b9"; // Private Key
const APP_ID = "qjfdmnco"; // Public Key (mapped as App ID)

// Default Cluster/DB details - Ensure these match your Atlas setup
const BASE_URL = `https://data.mongodb-api.com/app/${APP_ID}/endpoint/data/v1`;
const CLUSTER_NAME = "Cluster0";
const DATABASE_NAME = "Workingforyousomeone_db_user";
const COLLECTION_NAME = "households";

// Generic function to make requests to MongoDB Data API
async function mongoRequest(action: string, body: any) {
  if (!API_KEY || API_KEY.includes("YOUR_MONGODB")) {
    console.warn("MongoDB API Key not configured.");
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        dataSource: CLUSTER_NAME,
        database: DATABASE_NAME,
        collection: COLLECTION_NAME,
        ...body
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MongoDB API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`MongoDB Request Failed (${action}):`, error);
    throw error;
  }
}

export const mongoService = {
  // Fetch all households
  async getAllHouseholds() {
    const result = await mongoRequest('find', {
      filter: {}, // Empty filter gets all documents
      limit: 5000 // Adjust limit as needed
    });
    return result?.documents || [];
  },

  // Save/Update a specific household by ID
  async saveHousehold(household: any) {
    // We use updateOne with upsert: true to either update or create
    return await mongoRequest('updateOne', {
      filter: { id: household.id },
      update: { $set: household },
      upsert: true
    });
  },

  // Bulk save (for seeding)
  async insertMany(documents: any[]) {
    return await mongoRequest('insertMany', {
      documents: documents
    });
  }
};
