
import { Cluster, Household, DemandDetail, TapDemandDetail, PaymentRecord, User, HistoryRecord } from '../types';
import { 
  loadRawUsers, 
  loadRawOwners, 
  loadRawProperties, 
  loadRawDemands, 
  loadRawCollections, 
  loadRawHistory,
  RawDemand,
  RawCollection,
  RawHistory
} from './loaders';
import { googleSheetsService } from './googleSheets';

// --- DATA STORE ---
// We keep the raw data in variables so we can re-merge when Cloud data arrives
let rawDataStore = {
  users: loadRawUsers(),
  owners: loadRawOwners(),
  properties: loadRawProperties(),
  demands: loadRawDemands(),
  collections: loadRawCollections(),
  history: loadRawHistory()
};

// --- 0. DATA NORMALIZATION HELPER ---
// This ensures that headers like "Owner Name" from Sheets become "OwnerName" for the app
const normalizeSheetData = (data: any[]): any[] => {
    if (!Array.isArray(data)) return [];
    return data.map(row => {
        const normalized: any = {};
        Object.keys(row).forEach(key => {
            // 1. Standard Normalization: Remove spaces, dots, special chars
            // e.g. "Owner Name" -> "OwnerName", "Assessment No." -> "AssessmentNo"
            const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '');
            normalized[cleanKey] = row[key];
            
            // 2. Explicit Mappings for tricky fields/Aliases
            const lowerKey = cleanKey.toLowerCase();
            
            // Owner Mappings
            if (lowerKey === 'assessmentno' || lowerKey === 'newassessmentno') normalized['AssessmentNo'] = row[key];
            if (lowerKey === 'ownername' || lowerKey === 'nameofowner') normalized['OwnerName'] = row[key];
            if (lowerKey === 'cluster' || lowerKey === 'clusterno' || lowerKey === 'clusterid') normalized['ClusterId'] = row[key];
            if (lowerKey === 'doorno' || lowerKey === 'houseno') normalized['DoorNo'] = row[key];
            if (lowerKey === 'mobile' || lowerKey === 'mobileno' || lowerKey === 'phone') normalized['Mobile'] = row[key];
            
            // Property Mappings
            if (lowerKey === 'oldassessmentno') normalized['OldAssessmentNo'] = row[key];
            if (lowerKey === 'buildingage' || lowerKey === 'age') normalized['BuildingAge'] = row[key];
            if (lowerKey === 'natureofproperty' || lowerKey === 'propertytype') normalized['NatureOfProperty'] = row[key];
            
            // Keep original key too just in case
            normalized[key] = row[key];
        });
        return normalized;
    });
};

// --- 1. USER PROCESSING ---

const processUsers = (raw: any[]): User[] => {
  return raw.map((u) => ({
    id: String(u.UserId || u.id || ''),
    name: u.Name || u.name || 'Unknown',
    password: String(u.Password || u.password || ''),
    phone: String(u.Phone || u.phone || ''),
    role: (u.Role || u.role || 'USER') as 'SUPER_ADMIN' | 'ADMIN' | 'USER',
    clusters: (u.Clusters || u.clusters || '').split('|').filter(Boolean)
  }));
};

export let USERS: User[] = processUsers(rawDataStore.users);

// --- 2. DATA MERGING HELPERS ---

const processDemands = (assessmentId: string, allDemands: any[]): DemandDetail[] => {
  return allDemands
    .filter((d) => String(d.AssessmentNo) === assessmentId)
    .map(d => ({
      demandYear: d.DemandYear,
      propertyTax: Number(d.PropertyTax || 0),
      libraryCess: Number(d.LibraryCess || 0),
      lightingTax: Number(d.LightingTax || 0),
      drainageTax: Number(d.DrainageTax || 0),
      sportsCess: Number(d.SportsCess || 0),
      fireTax: Number(d.FireTax || 0),
      waterTax: Number(d.WaterTax || 0),
      totalDemand: Number(d.TotalDemand || 0)
    }));
};

const processTapDemands = (assessmentId: string, allDemands: any[]): TapDemandDetail[] => {
  return allDemands
    .filter((d) => String(d.AssessmentNo) === assessmentId)
    .filter(d => d.TapFeeDemand > 0 || (d.TapRemarks && d.TapRemarks !== ''))
    .map(d => ({
      demandYear: d.DemandYear,
      tapFeeDemand: Number(d.TapFeeDemand || 0),
      remarks: d.TapRemarks
    }));
};

const processPaymentHistory = (assessmentId: string, allCollections: any[]): PaymentRecord[] => {
  return allCollections
    .filter((c) => String(c['New Assessment No'] || c.AssessmentNo || c.NewAssessmentNo) === assessmentId)
    .map((c, index) => ({
      sNo: String(index + 1),
      receiptNo: c['Receipt No'] || c.ReceiptNo,
      dateOfPayment: c['Date of Payment'] || c.DateofPayment,
      paymentSource: c['Payment Source'] || c.PaymentSource,
      paymentMode: c['Payment Mode'] || c.PaymentMode,
      amount: Number(c['TOTAL Tax (Rs.)'] || c.TOTALTaxRs || c.TotalTax || 0),
      status: c['Receipt Status'] || c.ReceiptStatus,
      cfmsStatus: c['Settlement at CFMS'] || c.SettlementatCFMS,
      dueYear: c['Due Year'] || c.DueYear,
      demandCategory: c['Demand Category'] || c.DemandCategory,
      guardianName: c['Guardian Name'] || c.GuardianName
    }));
};

const processHistory = (assessmentId: string, allHistory: any[]): HistoryRecord[] => {
  return allHistory
    .filter((h) => String(h.AssessmentNo) === assessmentId)
    .map((h) => ({
      date: h.Date,
      eventType: h.EventType,
      description: h.Description,
      fromOwner: h.FromOwner,
      toOwner: h.ToOwner
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// --- 3. MAIN JOIN LOGIC ---

const mergeHouseholds = (dataStore: any): Household[] => {
  return dataStore.owners.map((owner: any) => {
    const assessmentNo = String(owner.AssessmentNo);
    // Loose comparison for strings/numbers
    const property = dataStore.properties.find((p: any) => String(p.AssessmentNo) === assessmentNo) || {} as any;
    
    const demandDetails = processDemands(assessmentNo, dataStore.demands);
    const tapDemands = processTapDemands(assessmentNo, dataStore.demands);
    const paymentHistory = processPaymentHistory(assessmentNo, dataStore.collections);
    const history = processHistory(assessmentNo, dataStore.history);
    
    const totalDemandAmount = demandDetails.reduce((sum, d) => sum + d.totalDemand, 0);
    const totalCollectedAmount = paymentHistory.reduce((sum, p) => sum + p.amount, 0);

    return {
      id: assessmentNo,
      clusterId: String(owner.ClusterId || 'C1'),
      assessmentNumber: assessmentNo,
      oldAssessmentNumber: String(property.OldAssessmentNo || ''),
      ownerName: owner.OwnerName,
      mobileNumber: String(owner.Mobile || ''),
      aadharNumber: owner.Aadhar,
      gender: owner.Gender,
      guardianName: owner.GuardianName,
      relationType: 'Father',
      doorNumber: owner.DoorNo,
      address: owner.Address,
      surveyNumber: String(property.SurveyNo || ''),
      buildingAge: property.BuildingAge || '',
      natureOfProperty: property.NatureOfProperty || '',
      natureOfLandUse: property.NatureOfLandUse || '',
      natureOfUsage: property.NatureOfUsage || '',
      natureOfOwnership: property.NatureOfOwnership || '',
      modeOfAcquisition: property.ModeOfAcquisition || '',
      boundaries: {
        east: property.East || '',
        west: property.West || '',
        north: property.North || '',
        south: property.South || ''
      },
      floorDescription: property.FloorDesc || '',
      classificationDescription: property.ClassDesc || '',
      buildingCategoryDescription: property.BldgCat || '',
      occupancyDescription: property.OccDesc || '',
      constructionDate: property.ConstDate || '',
      effectiveFromDate: property.EffDate || '',
      buildingAgeDate: property.BuildingAge || '',
      floorLength: Number(property.FloorLen || 0),
      floorBreadth: Number(property.FloorBreadth || 0),
      totalFloorArea: Number(property.TotalFloorArea || 0),
      subtypeConstructionDescription: property.SubtypeDesc || '',
      siteLength: Number(property.SiteLen || 0),
      siteBreadth: Number(property.SiteBreadth || 0),
      siteCapitalValue: Number(property.SiteCapVal || 0),
      siteRatePerSqYard: Number(property.SiteRate || 0),
      buildingTypeDescription: property.BldgType || '',
      buildingCapitalValue: Number(property.BldgCapVal || 0),
      buildingRatePerSqFeet: Number(property.BldgRate || 0),
      demandDetails,
      tapDemands,
      totalDemand: totalDemandAmount,
      totalCollected: totalCollectedAmount,
      paymentHistory,
      history,
      auditLogs: []
    };
  });
};

// INITIAL LOAD (Synchronous, from Mock Data)
export const HOUSEHOLDS: Household[] = mergeHouseholds(rawDataStore);

// --- 4. CLUSTER DERIVATION ---

const deriveClusters = (): Cluster[] => {
  const uniqueClusterIds = Array.from(new Set(HOUSEHOLDS.map(h => h.clusterId)));
  return uniqueClusterIds.map((id) => {
    const clusterHouseholds = HOUSEHOLDS.filter(h => h.clusterId === id);
    const totalDemand = clusterHouseholds.reduce((sum, h) => sum + h.totalDemand, 0);
    const totalCollected = clusterHouseholds.reduce((sum, h) => sum + h.totalCollected, 0);

    return {
      id: id,
      code: id,
      name: `Cluster ${id.replace('C', '')}`,
      totalHouseholds: clusterHouseholds.length,
      totalDemand: totalDemand,
      totalCollected: totalCollected
    };
  });
};

// Mutable Clusters Array
export let CLUSTERS: Cluster[] = deriveClusters();
export let isCloudConnected = false; 

// --- 5. RE-RENDER LOGIC ---

const listeners: (() => void)[] = [];

export const subscribeToData = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  const newClusters = deriveClusters();
  CLUSTERS.splice(0, CLUSTERS.length, ...newClusters);
  listeners.forEach(cb => cb());
};

// --- 6. GOOGLE SHEETS SYNC LOGIC ---

export const initializeCloudSync = async () => {
  console.log("Initializing Google Sheets Sync...");
  try {
    const cloudData = await googleSheetsService.fetchAll();
    
    if (cloudData && cloudData.owners && cloudData.owners.length > 0) {
      console.log(`Loaded ${cloudData.owners.length} owners from Google Sheets`);
      
      // Normalize incoming data (Fixes Space vs CamelCase issues)
      const normalizedOwners = normalizeSheetData(cloudData.owners);
      const normalizedProperties = normalizeSheetData(cloudData.properties);
      const normalizedDemands = normalizeSheetData(cloudData.demands);
      const normalizedCollections = normalizeSheetData(cloudData.collections);
      const normalizedHistory = normalizeSheetData(cloudData.history);
      const normalizedUsers = normalizeSheetData(cloudData.users || []);

      // Update the raw data store
      rawDataStore = {
        users: normalizedUsers.length > 0 ? normalizedUsers : rawDataStore.users,
        owners: normalizedOwners,
        properties: normalizedProperties,
        demands: normalizedDemands,
        collections: normalizedCollections,
        history: normalizedHistory
      };

      // Re-process Users
      const updatedUsers = processUsers(rawDataStore.users);
      USERS.splice(0, USERS.length, ...updatedUsers);

      // Re-merge Households
      const newHouseholds = mergeHouseholds(rawDataStore);
      HOUSEHOLDS.splice(0, HOUSEHOLDS.length, ...newHouseholds);
      
      isCloudConnected = true;
      notifyListeners();
    } else {
      console.warn("Google Sheets returned empty data. Using local backup.");
    }
  } catch (e) {
    console.error("Cloud Sync Failed, running in Offline Mode:", e);
    isCloudConnected = false;
  }
  notifyListeners();
};

const saveHouseholdToCloud = async (household: Household) => {
  // We need to split the Household object back into Owner, Property and Demand updates
  const ownerUpdate = {
     OwnerName: household.ownerName,
     Mobile: household.mobileNumber,
     Aadhar: household.aadharNumber,
     DoorNo: household.doorNumber,
     GuardianName: household.guardianName
  };

  const propertyUpdate = {
     BuildingAge: household.buildingAge,
     NatureOfProperty: household.natureOfProperty,
     NatureOfUsage: household.natureOfUsage,
     NatureOfOwnership: household.natureOfOwnership,
     // Add fields as necessary matching the headers in Sheet
     FloorDesc: household.floorDescription,
     SiteLen: household.siteLength,
     SiteBreadth: household.siteBreadth,
     TotalFloorArea: household.totalFloorArea
  };
  
  // Send full demand breakdown so correct columns in Sheets are updated
  const demandUpdates = household.demandDetails.map(d => ({
      DemandYear: d.demandYear,
      PropertyTax: d.propertyTax,
      LibraryCess: d.libraryCess,
      LightingTax: d.lightingTax,
      DrainageTax: d.drainageTax,
      WaterTax: d.waterTax,
      SportsCess: d.sportsCess,
      FireTax: d.fireTax,
      TotalDemand: d.totalDemand
  }));

  try {
    await googleSheetsService.updateHousehold(household.id, ownerUpdate, propertyUpdate, demandUpdates);
    console.log("Saved to Google Sheets:", household.id);
  } catch (e) {
    console.error("Failed to save to cloud:", e);
  }
};

// --- 7. API INTERFACE ---

export const authenticateUser = (username: string, password: string): User | undefined => {
  return USERS.find(u => u.id === username && u.password === password);
};

export const getUser = (userId: string): User | undefined => {
  return USERS.find(u => u.id === userId);
};

export const updateUserPassword = (userId: string, newPass: string): boolean => {
  const user = USERS.find(u => u.id === userId);
  if (user) {
    user.password = newPass;
    return true;
  }
  return false;
};

export const getDashboardStats = (user?: User) => {
  let relevantHouseholds = HOUSEHOLDS;
  let relevantClusters = CLUSTERS;

  if (user && user.role === 'USER') {
    relevantClusters = CLUSTERS.filter(c => user.clusters.includes(c.id));
    relevantHouseholds = HOUSEHOLDS.filter(h => user.clusters.includes(h.clusterId));
  }

  const totalHouseholds = relevantHouseholds.length;
  const totalDemand = relevantClusters.reduce((sum, c) => sum + c.totalDemand, 0);
  const totalCollection = relevantClusters.reduce((sum, c) => sum + c.totalCollected, 0);
  const pendingAmount = totalDemand - totalCollection;
  const collectionRate = totalDemand > 0 ? ((totalCollection / totalDemand) * 100).toFixed(1) : '0.0';

  return {
    totalHouseholds,
    totalDemand,
    totalCollection,
    pendingAmount,
    collectionRate
  };
};

export const getHouseholdsByCluster = (clusterId: string) => {
  return HOUSEHOLDS.filter(h => h.clusterId === clusterId);
};

export const getClusterById = (id: string) => CLUSTERS.find(c => c.id === id);

export const getHouseholdById = (id: string) => HOUSEHOLDS.find(h => h.id === id);

export const updateHousehold = (updated: Household) => {
  const index = HOUSEHOLDS.findIndex(h => h.id === updated.id);
  if (index !== -1) {
    HOUSEHOLDS[index] = updated; // Optimistic update
    notifyListeners();
    saveHouseholdToCloud(updated); // Sync to Google Sheets
  }
};

export const getClustersForUser = (user?: User) => {
  if (!user || user.role !== 'USER') return CLUSTERS;
  return CLUSTERS.filter(c => user.clusters.includes(c.id));
};

export const searchHouseholds = (query: string, user?: User): Household[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  let results = HOUSEHOLDS.filter(h => 
    h.assessmentNumber.includes(q) || 
    h.ownerName.toLowerCase().includes(q) ||
    h.mobileNumber.includes(q)
  );

  if (user && user.role === 'USER') {
    results = results.filter(h => user.clusters.includes(h.clusterId));
  }

  return results;
};

export const addPayment = (householdId: string, amount: number, mode: string): PaymentRecord | null => {
  const household = HOUSEHOLDS.find(h => h.id === householdId);
  if (!household) return null;

  // Logic to calculate tax component breakdown based on proportion of total demand
  // This assumes the payment pays off the tax components uniformly.
  const totalDemand = household.totalDemand > 0 ? household.totalDemand : 1;
  const ratio = amount / totalDemand;

  const sumField = (field: keyof DemandDetail) => household.demandDetails.reduce((sum, d) => sum + (Number(d[field]) || 0), 0);

  // Calculate components based on the ratio of payment
  const taxComponents = {
    houseTax: Math.round(sumField('propertyTax') * ratio),
    libraryCess: Math.round(sumField('libraryCess') * ratio),
    waterTax: Math.round(sumField('waterTax') * ratio),
    lightingTax: Math.round(sumField('lightingTax') * ratio),
    drainageTax: Math.round(sumField('drainageTax') * ratio),
    sportsCess: Math.round(sumField('sportsCess') * ratio),
    fireTax: Math.round(sumField('fireTax') * ratio),
  };

  // Adjust for rounding errors - add difference to House Tax (Property Tax)
  const calcTotal = Object.values(taxComponents).reduce((a, b) => a + b, 0);
  const diff = amount - calcTotal;
  taxComponents.houseTax += diff;

  // Determine Financial Year
  // Logic: If current month is April (3) or later, start year is current year.
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();
  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const financialYear = `${startYear}-${(startYear + 1).toString().slice(-2)}`;

  // Create Date and Time
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // dd-mm-yyyy
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM

  const newRecord: PaymentRecord = {
      sNo: (household.paymentHistory.length + 1).toString(),
      receiptNo: `TAX${Date.now()}`,
      dateOfPayment: `${dateStr} ${timeStr}`,
      paymentSource: 'Admin Portal',
      paymentMode: mode,
      amount: amount,
      status: 'Success',
      cfmsStatus: 'Pending',
      dueYear: financialYear,
      demandCategory: 'Current',
      guardianName: household.guardianName
  };

  // Mutate object directly
  household.paymentHistory.unshift(newRecord);
  household.totalCollected += amount;

  // Prepare payload for Google Sheets - KEYS MUST MATCH SHEET HEADERS EXACTLY
  const sheetPayload = {
      'S.No.': newRecord.sNo,
      'New Assessment No': household.assessmentNumber,
      'Old Assessment No': household.oldAssessmentNumber,
      'Owner Name': household.ownerName,
      'Guardian Name': household.guardianName,
      'Door No': household.doorNumber,
      'Date of Payment': newRecord.dateOfPayment,
      'Receipt No': newRecord.receiptNo,
      'Payment Source': newRecord.paymentSource,
      'Payment Mode': newRecord.paymentMode,
      'Due Year': newRecord.dueYear,
      'Demand Category': newRecord.demandCategory,
      
      // Breakdown fields
      'House Tax (Rs.)': taxComponents.houseTax,
      'Library Cess (Rs.)': taxComponents.libraryCess,
      'Water Tax (Rs.)': taxComponents.waterTax,
      'Lightning Tax (Rs.)': taxComponents.lightingTax,
      'Drainage Tax (Rs.)': taxComponents.drainageTax,
      'Sports Cess (Rs.)': taxComponents.sportsCess,
      'Fire Tax (Rs.)': taxComponents.fireTax,

      'TOTAL Tax (Rs.)': newRecord.amount,
      'Receipt Status': newRecord.status,
      'Settlement at CFMS': newRecord.cfmsStatus
  };

  notifyListeners();
  googleSheetsService.addPayment(sheetPayload);

  return newRecord;
};

export const getAllPayments = (user?: User) => {
  let allPayments = HOUSEHOLDS.flatMap(h => 
    h.paymentHistory.map(p => ({
      ...p,
      householdId: h.id,
      ownerName: h.ownerName,
      assessmentNumber: h.assessmentNumber,
      clusterId: h.clusterId
    }))
  );

  if (user && user.role === 'USER') {
    allPayments = allPayments.filter(p => user.clusters.includes(p.clusterId));
  }

  return allPayments.sort((a, b) => {
    // Parse complex date strings (DD-MM-YYYY or DD-MM-YYYY HH:MM)
    const [date1, time1] = a.dateOfPayment.split(' ');
    const [d1, m1, y1] = date1.split('-').map(Number);
    const [h1, min1] = time1 ? time1.split(':').map(Number) : [0, 0];
    
    const [date2, time2] = b.dateOfPayment.split(' ');
    const [d2, m2, y2] = date2.split('-').map(Number);
    const [h2, min2] = time2 ? time2.split(':').map(Number) : [0, 0];

    const t1 = new Date(y1, m1 - 1, d1, h1, min1).getTime();
    const t2 = new Date(y2, m2 - 1, d2, h2, min2).getTime();
    
    return t2 - t1;
  });
};
