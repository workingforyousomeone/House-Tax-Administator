

import { parseCSV } from './utils';
import { ownerCSV, propertyCSV, demandCSV, collectionCSV, userCSV, historyCSV, svamitvaCSV } from './mockData';

// --- Raw Data Interfaces (Directly mapping CSV columns) ---

export interface RawUser {
  UserId: string;
  Name: string;
  Password: string | number;
  Phone: string | number;
  Role: string;
  Clusters: string;
}

export interface RawOwner {
  AssessmentNo: string | number;
  OwnerName: string;
  Mobile: string | number;
  Aadhar: string;
  Gender: string;
  GuardianName: string;
  DoorNo: string;
  Address: string;
  ClusterId: string;
}

export interface RawProperty {
  AssessmentNo: string | number;
  OldAssessmentNo?: string | number;
  SurveyNo?: string | number;
  BuildingAge: string;
  NatureOfProperty: string;
  NatureOfLandUse: string;
  NatureOfUsage: string;
  NatureOfOwnership: string;
  ModeOfAcquisition: string;
  East: string;
  West: string;
  North: string;
  South: string;
  FloorDesc: string;
  ClassDesc: string;
  BldgCat: string;
  OccDesc: string;
  ConstDate: string;
  EffDate: string;
  FloorLen: number;
  FloorBreadth: number;
  TotalFloorArea: number;
  SubtypeDesc: string;
  SiteLen: number;
  SiteBreadth: number;
  SiteCapVal: number;
  SiteRate: number;
  BldgType: string;
  BldgCapVal: number;
  BldgRate: number;
}

export interface RawDemand {
  AssessmentNo: string | number;
  DemandYear: string;
  PropertyTax: number;
  LibraryCess: number;
  LightingTax: number;
  DrainageTax: number;
  SportsCess: number;
  FireTax: number;
  WaterTax: number;
  TotalDemand: number;
  TapFeeDemand: number;
  TapRemarks: string;
}

export interface RawCollection {
  'S.No.': string | number;
  'New Assessment No': string | number;
  'Old Assessment No': string | number;
  'Owner Name': string;
  'Guardian Name': string;
  'Door No': string;
  'Date of Payment': string;
  'Receipt No': string;
  'Payment Source': string;
  'Payment Mode': string;
  'Due Year': string;
  'Demand Category': string;
  'TOTAL Tax (Rs.)': number;
  'Receipt Status': string;
  'Settlement at CFMS': string;
}

export interface RawHistory {
  AssessmentNo: string | number;
  Date: string;
  EventType: 'Construction' | 'Sale' | 'Gift' | 'Demolition' | 'Mutation' | 'Other';
  Description: string;
  FromOwner?: string;
  ToOwner?: string;
}

export interface RawSvamitva {
  ClusterNo: string;
  SlNo: string | number;
  AssessmentNo: string | number;
  SurveyNo: string | number;
  LPNo: string;
  GramaKantam: string;
  DoorNo: string;
  WardNo: string | number;
  Street: string;
  Habitation: string;
  NatureOfProperty: string;
  NatureOfLandUse: string;
  Layout: string;
  ExtentLand: number;
  ExtentBuiltUp: number;
  NatureBuiltUp: string;
  NatureUsage: string;
  NatureOwnership: string;
  Surname: string;
  OwnerName: string;
  GuardianName: string;
  PlotNo: string | number;
  Aadhar: string;
  ModeAcquisition: string;
  TaxPaidFrom: string | number;
  NoOfSides: string | number;
  MeasA: string | number;
  MeasB: string | number;
  MeasC: string | number;
  MeasD: string | number;
  MeasE: string | number;
  MeasF: string | number;
  BoundNorth: string;
  BoundEast: string;
  BoundSouth: string;
  BoundWest: string;
  Phone: string | number;
  Remarks: string;
}

// --- Loading Functions ---

export const loadRawUsers = (): RawUser[] => parseCSV(userCSV);
export const loadRawOwners = (): RawOwner[] => parseCSV(ownerCSV);
export const loadRawProperties = (): RawProperty[] => parseCSV(propertyCSV);
export const loadRawDemands = (): RawDemand[] => parseCSV(demandCSV);
export const loadRawCollections = (): RawCollection[] => parseCSV(collectionCSV);
export const loadRawHistory = (): RawHistory[] => parseCSV(historyCSV);
export const loadRawSvamitva = (): RawSvamitva[] => parseCSV(svamitvaCSV);
