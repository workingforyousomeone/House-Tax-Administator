
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

// --- DATA INITIALIZATION (LOCAL) ---

const rawUsers = loadRawUsers();
const rawOwners = loadRawOwners();
const rawProperties = loadRawProperties();
const rawDemands = loadRawDemands();
const rawCollections = loadRawCollections();
const rawHistory = loadRawHistory();

// --- 1. USER PROCESSING ---

export const USERS: User[] = rawUsers.map((u) => ({
  id: u.UserId,
  name: u.Name,
  password: String(u.Password),
  phone: String(u.Phone),
  role: u.Role as 'SUPER_ADMIN' | 'ADMIN' | 'USER',
  clusters: u.Clusters ? u.Clusters.split('|') : []
}));

// --- 2. DATA MERGING HELPERS ---

const processDemands = (assessmentId: string, allDemands: RawDemand[]): DemandDetail[] => {
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

const processTapDemands = (assessmentId: string, allDemands: RawDemand[]): TapDemandDetail[] => {
  return allDemands
    .filter((d) => String(d.AssessmentNo) === assessmentId)
    .filter(d => d.TapFeeDemand > 0 || (d.TapRemarks && d.TapRemarks !== ''))
    .map(d => ({
      demandYear: d.DemandYear,
      tapFeeDemand: Number(d.TapFeeDemand || 0),
      remarks: d.TapRemarks
    }));
};

const processPaymentHistory = (assessmentId: string, allCollections: RawCollection[]): PaymentRecord[] => {
  return allCollections
    .filter((c) => String(c['New Assessment No']) === assessmentId)
    .map((c, index) => ({
      sNo: String(index + 1),
      receiptNo: c['Receipt No'],
      dateOfPayment: c['Date of Payment'],
      paymentSource: c['Payment Source'],
      paymentMode: c['Payment Mode'],
      amount: Number(c['TOTAL Tax (Rs.)'] || 0),
      status: c['Receipt Status'],
      cfmsStatus: c['Settlement at CFMS'],
      dueYear: c['Due Year'],
      demandCategory: c['Demand Category'],
      guardianName: c['Guardian Name']
    }));
};

const processHistory = (assessmentId: string, allHistory: RawHistory[]): HistoryRecord[] => {
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

const mergeHouseholds = (): Household[] => {
  return rawOwners.map((owner) => {
    const assessmentNo = String(owner.AssessmentNo);
    const property = rawProperties.find((p) => String(p.AssessmentNo) === assessmentNo) || {} as any;
    const demandDetails = processDemands(assessmentNo, rawDemands);
    const tapDemands = processTapDemands(assessmentNo, rawDemands);
    const paymentHistory = processPaymentHistory(assessmentNo, rawCollections);
    const history = processHistory(assessmentNo, rawHistory);
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
export const HOUSEHOLDS: Household[] = mergeHouseholds();

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
export let isCloudConnected = false; // Always false in Offline Mode

// --- 5. RE-RENDER LOGIC ---

// Observers for React Components to subscribe to
const listeners: (() => void)[] = [];

export const subscribeToData = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  // Update Derived Clusters whenever HOUSEHOLDS changes
  const newClusters = deriveClusters();
  // Update the CLUSTERS reference content
  CLUSTERS.splice(0, CLUSTERS.length, ...newClusters);
  
  listeners.forEach(cb => cb());
};

// --- 6. OFFLINE SYNC PLACEHOLDERS ---

export const initializeCloudSync = async () => {
  console.log("App running in Offline Mode (Firebase Removed)");
  isCloudConnected = false;
  notifyListeners();
};

const saveHouseholdToCloud = async (household: Household) => {
    // No-op in offline mode
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
    saveHouseholdToCloud(updated); // No-op
    notifyListeners();
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

  const newRecord: PaymentRecord = {
      sNo: (household.paymentHistory.length + 1).toString(),
      receiptNo: `TAX${Date.now()}`,
      dateOfPayment: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      paymentSource: 'Admin Portal',
      paymentMode: mode,
      amount: amount,
      status: 'Success',
      cfmsStatus: 'Pending',
      dueYear: 'Current',
      demandCategory: 'Current',
      guardianName: household.guardianName
  };

  // Mutate object directly
  household.paymentHistory.unshift(newRecord);
  household.totalCollected += amount;

  // Save to Cloud (No-op)
  saveHouseholdToCloud(household);
  notifyListeners();

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
    const [d1, m1, y1] = a.dateOfPayment.split('-').map(Number);
    const [d2, m2, y2] = b.dateOfPayment.split('-').map(Number);
    const time1 = new Date(y1, m1 - 1, d1).getTime();
    const time2 = new Date(y2, m2 - 1, d2).getTime();
    return time2 - time1;
  });
};
