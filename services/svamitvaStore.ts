

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
    return stored ? JSON.parse(stored) : [];
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