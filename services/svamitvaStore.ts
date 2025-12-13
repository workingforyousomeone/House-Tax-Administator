

import { loadRawSvamitva } from './loaders';

const STORAGE_KEY = 'house_tax_svamitva_data_v1';

export interface SvamitvaRecord {
  id: string;
  clusterNo: string;
  ownerName: string;
  guardianName: string;
  [key: string]: any;
}

export const getSvamitvaRecords = (): SvamitvaRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // If storage is empty, seed it with mock data
    const rawData = loadRawSvamitva();
    const seededData: SvamitvaRecord[] = rawData.map((r, index) => ({
      id: `seed-${index}-${Date.now()}`,
      district: 'Vizianagaram',
      mandal: 'Rajam',
      panchayat: 'Pogiri',
      
      // Mapped fields from 36-column CSV
      clusterNo: r.ClusterNo,
      assessmentNo: String(r.AssessmentNo),
      surveyNo: String(r.SurveyNo),
      lpNo: r.LPNo,
      gramaKantam: r.GramaKantam,
      doorNo: r.DoorNo,
      wardNo: String(r.WardNo),
      street: r.Street,
      habitation: r.Habitation,
      natureOfProperty: r.NatureOfProperty,
      natureOfLandUse: r.NatureOfLandUse,
      layout: r.Layout,
      extentLand: String(r.ExtentLand),
      extentBuiltUp: String(r.ExtentBuiltUp),
      natureBuiltUp: r.NatureBuiltUp,
      natureUsage: r.NatureUsage,
      natureOwnership: r.NatureOwnership,
      surname: r.Surname,
      ownerName: r.OwnerName,
      guardianName: r.GuardianName,
      plotNo: String(r.PlotNo),
      aadhar: r.Aadhar,
      modeAcquisition: r.ModeAcquisition,
      taxPaidFrom: String(r.TaxPaidFrom),
      noOfSides: String(r.NoOfSides),
      
      measurements: {
        a: String(r.MeasA),
        b: String(r.MeasB),
        c: String(r.MeasC),
        d: String(r.MeasD),
        e: String(r.MeasE),
        f: String(r.MeasF)
      },
      
      boundaries: {
        north: r.BoundNorth,
        east: r.BoundEast,
        south: r.BoundSouth,
        west: r.BoundWest
      },
      
      phone: String(r.Phone),
      remarks: r.Remarks,
      
      // Default / Missing fields not in CSV but in form state
      buildingExistingFrom: '', // Not in CSV explicitly
    }));

    if (seededData.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seededData));
    }
    return seededData;

  } catch (error) {
    console.error("Failed to load svamitva records", error);
    return [];
  }
};

export const saveSvamitvaRecords = (records: SvamitvaRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to save svamitva records", error);
  }
};

export const addSvamitvaRecord = (record: Omit<SvamitvaRecord, 'id'>): SvamitvaRecord[] => {
  const records = getSvamitvaRecords();
  const newRecord: SvamitvaRecord = { ...record, id: Date.now().toString() } as SvamitvaRecord;
  const updatedRecords = [newRecord, ...records];
  saveSvamitvaRecords(updatedRecords);
  return updatedRecords;
};

export const downloadSvamitvaData = () => {
  const records = getSvamitvaRecords();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "svamitva_register.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
