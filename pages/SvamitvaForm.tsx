import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, List, PlusCircle, Download, Upload } from 'lucide-react';
import { getSvamitvaRecords, addSvamitvaRecord, downloadSvamitvaData, saveSvamitvaRecords } from '../services/svamitvaStore';

// --- HELPER COMPONENTS (Moved outside to prevent focus loss) ---

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-md font-bold text-slate-800 uppercase tracking-wide border-b border-white/30 pb-1 mb-3 mt-4 first:mt-0">
      {title}
  </h3>
);

const InputGroup: React.FC<{ label: string; name: string; type?: string; value: string; onChange: (e: any) => void; required?: boolean }> = ({ label, name, type = "text", value, onChange, required }) => (
  <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-600">{label} {required && <span className="text-red-500">*</span>}</label>
      <input 
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/50 placeholder-slate-400"
          placeholder={label}
      />
  </div>
);

const SelectGroup: React.FC<{ label: string; name: string; value: string; onChange: (e: any) => void; options: string[] }> = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <select 
          name={name} 
          value={value} 
          onChange={onChange}
          className="bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
      >
          <option value="">Select...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
  </div>
);

const INITIAL_STATE = {
    district: 'Vizianagaram',
    mandal: 'Rajam',
    panchayat: 'Pogiri',
    clusterNo: '',
    assessmentNo: '',
    surveyNo: '',
    lpNo: '',
    gramaKantam: 'Original',
    doorNo: '',
    wardNo: '',
    street: '',
    habitation: '',
    natureOfProperty: '',
    natureOfLandUse: '',
    layout: '',
    extentLand: '',
    extentBuiltUp: '',
    natureBuiltUp: '',
    natureUsage: '',
    natureOwnership: '',
    surname: '',
    ownerName: '',
    guardianName: '',
    plotNo: '',
    aadhar: '',
    modeAcquisition: '',
    taxPaidFrom: '',
    buildingExistingFrom: '',
    noOfSides: '',
    measurements: { a: '', b: '', c: '', d: '', e: '', f: '' },
    boundaries: { north: '', east: '', south: '', west: '' },
    phone: '',
    remarks: ''
};

export const SvamitvaForm: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'form' | 'list'>('form');
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState(INITIAL_STATE);
  
  // Initialize from storage directly to ensure data is present on first render
  const [records, setRecords] = useState<any[]>(() => getSvamitvaRecords());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent: 'measurements' | 'boundaries', key: string, value: string) => {
      setFormData(prev => ({
          ...prev,
          [parent]: {
              ...prev[parent],
              [key]: value
          }
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Save Record via Service (which persists to localStorage)
      const updatedList = addSvamitvaRecord(formData);
      setRecords(updatedList);

      // Show success
      setSaved(true);
      
      // Reset Form
      setFormData(INITIAL_STATE);

      setTimeout(() => {
          setSaved(false);
      }, 2000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const text = await file.text();
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
              saveSvamitvaRecords(data);
              setRecords(data);
              alert("Data imported successfully! Your register has been restored.");
          } else {
              alert("Invalid JSON file format.");
          }
      } catch (err) {
          console.error(err);
          alert("Failed to read file. Please ensure it is a valid JSON file.");
      }
      e.target.value = ''; // reset input
  };

  return (
    <div className="pb-8 h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-20 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
                 <button 
                    type="button" 
                    onClick={() => navigate('/dashboard')} 
                    className="p-1 hover:bg-white/40 rounded-full transition-colors"
                 >
                    <ArrowLeft className="w-6 h-6 text-slate-800" />
                 </button>
                 <h1 className="text-lg font-bold text-slate-900">Svamitva Register</h1>
             </div>
             
             {/* View Toggle */}
             <div className="flex bg-white/40 p-1 rounded-lg border border-white/30">
                 <button 
                    type="button"
                    onClick={() => setViewMode('form')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'form' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/30'}`}
                 >
                    <PlusCircle className="w-3 h-3" /> Entry
                 </button>
                 <button 
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/30'}`}
                 >
                    <List className="w-3 h-3" /> Register
                 </button>
             </div>
        </div>

        {saved && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-5 h-5" /> Saved Successfully!
            </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">
            {viewMode === 'form' ? (
                <form onSubmit={handleSubmit} className="p-5 max-w-2xl mx-auto space-y-6">
                    
                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40">
                        <div className="text-center mb-4">
                            <h2 className="text-lg font-bold text-slate-900 underline decoration-brand-500/30 decoration-4 underline-offset-4">Property Holding Register</h2>
                            <p className="text-xs text-slate-600 mt-1">Grama Panchayat: Pogiri</p>
                        </div>

                        {/* 2. Basic Identification */}
                        <SectionTitle title="Basic Identification" />
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <InputGroup label="Cluster No" name="clusterNo" value={formData.clusterNo} onChange={handleChange} required />
                            <InputGroup label="Assessment No." name="assessmentNo" value={formData.assessmentNo} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <InputGroup label="Survey No." name="surveyNo" value={formData.surveyNo} onChange={handleChange} />
                            <InputGroup label="LP No." name="lpNo" value={formData.lpNo} onChange={handleChange} />
                        </div>
                        <SelectGroup label="Grama Kantam" name="gramaKantam" value={formData.gramaKantam} onChange={handleChange} options={['Original', 'Extended']} />

                        {/* 3. Location Address */}
                        <SectionTitle title="Location Address" />
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <InputGroup label="House / Door No." name="doorNo" value={formData.doorNo} onChange={handleChange} required />
                            <InputGroup label="Ward Number" name="wardNo" value={formData.wardNo} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Street Lane" name="street" value={formData.street} onChange={handleChange} />
                            <InputGroup label="Habitation" name="habitation" value={formData.habitation} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40">
                        {/* 4. Property Attributes */}
                        <SectionTitle title="Property Attributes" />
                        <div className="space-y-4">
                            {/* Nature of Property & Land Use in same row */}
                            <div className="grid grid-cols-2 gap-4">
                                <SelectGroup 
                                    label="Nature Of Property" 
                                    name="natureOfProperty" 
                                    value={formData.natureOfProperty} 
                                    onChange={handleChange} 
                                    options={["Govt", "Assigned", "Inam", "Endowment", "Wakf", "Private"]} 
                                />
                                <SelectGroup 
                                    label="Nature of Land Use" 
                                    name="natureOfLandUse" 
                                    value={formData.natureOfLandUse} 
                                    onChange={handleChange} 
                                    options={["Vacant Plot", "Stand Alone Building", "Multi Storied Structure", "Apartment"]} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Extent Property (Sq.mts)" name="extentLand" type="number" value={formData.extentLand} onChange={handleChange} />
                                <InputGroup label="Built up Area (Sq.mts)" name="extentBuiltUp" type="number" value={formData.extentBuiltUp} onChange={handleChange} />
                            </div>

                            {/* Nature of Built up Area & Usage in same row */}
                            <div className="grid grid-cols-2 gap-4">
                                <SelectGroup 
                                    label="Nature of Built up Area" 
                                    name="natureBuiltUp" 
                                    value={formData.natureBuiltUp} 
                                    onChange={handleChange} 
                                    options={["RCC", "Non-RCC", "Tiled", "Slab", "Hut"]} 
                                />
                                <SelectGroup 
                                    label="Nature of Usage" 
                                    name="natureUsage" 
                                    value={formData.natureUsage} 
                                    onChange={handleChange} 
                                    options={["Residential", "Commercial", "Mixed use", "Industrial", "Govt"]} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40">
                        {/* 5. Ownership Details */}
                        <SectionTitle title="Ownership Details" />
                        <div className="space-y-4">
                            {/* Ownership & Acquisition in same row */}
                            <div className="grid grid-cols-2 gap-4">
                                <SelectGroup 
                                    label="Nature of Ownership" 
                                    name="natureOwnership" 
                                    value={formData.natureOwnership} 
                                    onChange={handleChange} 
                                    options={["Individual", "Joint"]} 
                                />
                                <SelectGroup 
                                    label="Mode of Acquisition" 
                                    name="modeAcquisition" 
                                    value={formData.modeAcquisition} 
                                    onChange={handleChange} 
                                    options={["Inheritance", "Purchases", "Gift"]} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Surname" name="surname" value={formData.surname} onChange={handleChange} />
                                <InputGroup label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                                <InputGroup label="Phone No." name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Plot No" name="plotNo" value={formData.plotNo} onChange={handleChange} />
                                <InputGroup label="Aadhar No" name="aadhar" value={formData.aadhar} onChange={handleChange} />
                            </div>
                            
                             <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Tax Paid From (Year)" name="taxPaidFrom" value={formData.taxPaidFrom} onChange={handleChange} />
                                <InputGroup label="Building Existing From (Year)" name="buildingExistingFrom" value={formData.buildingExistingFrom} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40">
                        {/* 6. Measurements */}
                        <SectionTitle title="Measurements & Boundaries" />
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <SelectGroup 
                                label="Layout" 
                                name="layout" 
                                value={formData.layout} 
                                onChange={handleChange} 
                                options={["Approved", "Unapproved"]} 
                            />
                            <InputGroup label="No. of sides of Property" name="noOfSides" type="number" value={formData.noOfSides} onChange={handleChange} />
                        </div>
                        
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Measurements (Meters)</label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <input placeholder="a" className="bg-white/50 border border-white/40 rounded p-2 text-sm" value={formData.measurements.a} onChange={(e) => handleNestedChange('measurements', 'a', e.target.value)} />
                            <input placeholder="b" className="bg-white/50 border border-white/40 rounded p-2 text-sm" value={formData.measurements.b} onChange={(e) => handleNestedChange('measurements', 'b', e.target.value)} />
                            <input placeholder="c" className="bg-white/50 border border-white/40 rounded p-2 text-sm" value={formData.measurements.c} onChange={(e) => handleNestedChange('measurements', 'c', e.target.value)} />
                            <input placeholder="d" className="bg-white/50 border border-white/40 rounded p-2 text-sm" value={formData.measurements.d} onChange={(e) => handleNestedChange('measurements', 'd', e.target.value)} />
                            <input placeholder="e" className="bg-white/50 border border-white/40 rounded p-2 text-sm" value={formData.measurements.e} onChange={(e) => handleNestedChange('measurements', 'e', e.target.value)} />
                            <input placeholder="f (if any)" className="bg-white/50 border border-white/40 rounded p-2 text-sm" value={formData.measurements.f} onChange={(e) => handleNestedChange('measurements', 'f', e.target.value)} />
                        </div>

                        <label className="text-xs font-bold text-slate-600 mb-2 block">Adjacent Property Owners (Boundaries)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="North" name="north" value={formData.boundaries.north} onChange={(e) => handleNestedChange('boundaries', 'north', e.target.value)} />
                            <InputGroup label="South" name="south" value={formData.boundaries.south} onChange={(e) => handleNestedChange('boundaries', 'south', e.target.value)} />
                            <InputGroup label="East" name="east" value={formData.boundaries.east} onChange={(e) => handleNestedChange('boundaries', 'east', e.target.value)} />
                            <InputGroup label="West" name="west" value={formData.boundaries.west} onChange={(e) => handleNestedChange('boundaries', 'west', e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40">
                        <SectionTitle title="Remarks" />
                        <textarea 
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            placeholder="Enter any additional remarks..."
                        />
                    </div>

                    <button type="submit" className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-brand-700 active:scale-95 transition-all text-lg flex justify-center items-center gap-2">
                        <Save className="w-6 h-6" /> Submit Details
                    </button>
                </form>
            ) : (
                <div className="p-4 space-y-4">
                    {records.length === 0 ? (
                        <div className="text-center py-10 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                            <p className="text-white font-medium">No records saved in storage.</p>
                            <p className="text-white/60 text-xs mt-2">Try importing a backup if you have one.</p>
                            <div className="flex justify-center gap-3 mt-4">
                                <button type="button" onClick={() => setViewMode('form')} className="text-brand-700 font-bold bg-white/50 px-4 py-2 rounded-lg hover:bg-white/70">
                                    Add New Entry
                                </button>
                                <label className="text-brand-700 font-bold bg-white/50 px-4 py-2 rounded-lg hover:bg-white/70 cursor-pointer flex items-center gap-1">
                                    <Upload className="w-4 h-4" /> Import JSON
                                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end gap-2">
                                <label className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors">
                                    <Upload className="w-4 h-4" /> Import JSON
                                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                                </label>
                                <button 
                                    type="button"
                                    onClick={downloadSvamitvaData}
                                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 flex items-center gap-2 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download JSON
                                </button>
                            </div>
                            <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-white/40 text-slate-800 border-b border-white/30">
                                            <tr>
                                                <th className="px-4 py-3 font-bold whitespace-nowrap">Owner Name</th>
                                                <th className="px-4 py-3 font-bold whitespace-nowrap">Guardian Name</th>
                                                <th className="px-4 py-3 font-bold whitespace-nowrap">Cluster No</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/20">
                                            {records.map((r: any, idx: number) => (
                                                <tr key={r.id || idx} className="hover:bg-white/20">
                                                    <td className="px-4 py-3 font-bold text-slate-800">{r.ownerName}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-700">{r.guardianName || '-'}</td>
                                                    <td className="px-4 py-3 font-medium text-brand-800">{r.clusterNo || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};