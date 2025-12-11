

export interface PaymentRecord {
  sNo: string;
  receiptNo: string;
  dateOfPayment: string;
  paymentSource: string;
  paymentMode: string;
  amount: number;
  status: string;
  cfmsStatus: string;
  // New fields for Receipt Breakdown
  dueYear: string;
  demandCategory: string;
  guardianName?: string;
}

export interface DemandDetail {
  demandYear: string;
  propertyTax: number;
  libraryCess: number;
  lightingTax: number;
  drainageTax: number;
  sportsCess: number;
  fireTax: number;
  waterTax: number;
  totalDemand: number;
}

export interface TapDemandDetail {
  demandYear: string;
  tapFeeDemand: number;
  remarks: string;
}

export interface HistoryRecord {
  date: string;
  eventType: 'Construction' | 'Sale' | 'Gift' | 'Demolition' | 'Mutation' | 'Other';
  description: string;
  fromOwner?: string;
  toOwner?: string;
}

export interface AuditLog {
  timestamp: string;
  userId: string;
  userName: string;
  section: string;
  changes: string[]; // e.g. "Mobile: 123 -> 456"
}

export interface Household {
  id: string;
  clusterId: string;

  // Owner Details
  assessmentNumber: string;
  oldAssessmentNumber: string;
  ownerName: string;
  mobileNumber: string;
  aadharNumber: string;
  gender: string;
  relationType: string; // Father, Mother, Husband, Others
  guardianName: string;
  surveyNumber: string;
  doorNumber: string;
  address: string;

  // Property Details
  buildingAge: string; // From "Age of the Building" or derived
  natureOfProperty: string;
  natureOfLandUse: string;
  natureOfUsage: string;
  natureOfOwnership: string;
  modeOfAcquisition: string;

  // Neighbouring Property Details
  boundaries: {
    east: string;
    west: string;
    north: string;
    south: string;
  };

  // Floor Details
  floorDescription: string;
  classificationDescription: string;
  buildingCategoryDescription: string;
  occupancyDescription: string;
  constructionDate: string;
  effectiveFromDate: string;
  buildingAgeDate: string; // "Building Age" column in floor section
  floorLength: number;
  floorBreadth: number;
  totalFloorArea: number;
  subtypeConstructionDescription: string;

  // Site/Building Details
  siteLength: number;
  siteBreadth: number;
  siteCapitalValue: number;
  siteRatePerSqYard: number;
  buildingTypeDescription: string;
  buildingCapitalValue: number;
  buildingRatePerSqFeet: number;

  // Demand Details
  demandDetails: DemandDetail[];
  totalDemand: number; // Aggregate of all demand years

  // Tap Demand Details
  tapDemands: TapDemandDetail[];

  // Financial Summary
  totalCollected: number;
  paymentHistory: PaymentRecord[];
  
  // Property Lifecycle History
  history: HistoryRecord[];
  
  // Modification Logs (Admin Only)
  auditLogs: AuditLog[];
}

export interface Cluster {
  id: string;
  code: string;
  name: string;
  totalHouseholds: number;
  totalDemand: number;
  totalCollected: number;
}

export interface User {
  id: string;
  name: string;
  password: string; // In a real app, this would be hashed
  phone: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  clusters: string[]; // List of Cluster IDs assigned to this user
}