
export function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;

    // Handle simplistic CSV splitting (does not handle commas inside quotes for this demo)
    const values = currentLine.split(',').map(v => v.trim());
    const obj: any = {};

    headers.forEach((header, index) => {
      let value = values[index];
      // Attempt to convert numeric strings to numbers
      if (value && !isNaN(Number(value)) && value.trim() !== '') {
         // Keep phone numbers and IDs as strings if they start with 0 or are long
         if (header.toLowerCase().includes('mobile') || 
             header.toLowerCase().includes('aadhar') || 
             header.toLowerCase().includes('number') || 
             header.toLowerCase().includes('id')) {
             obj[header] = value;
         } else {
             obj[header] = Number(value);
         }
      } else {
         obj[header] = value;
      }
    });

    result.push(obj);
  }

  return result;
}
