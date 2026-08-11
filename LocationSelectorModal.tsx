import React from 'react';
import { X, MapPin, Check, Truck } from 'lucide-react';
import { BANGLADESH_LOCATIONS, calculateDeliveryFee } from './bangladeshLocations';
interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDivision: string;
  selectedDistrict: string;
  selectedThana: string;
  onSaveLocation: (division: string, district: string, thana: string) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedDivision,
  selectedDistrict,
  selectedThana,
  onSaveLocation
}) => {
  const [division, setDivision] = React.useState(selectedDivision || 'Dhaka');
  const [district, setDistrict] = React.useState(selectedDistrict || 'Dhaka City');
  const [thana, setThana] = React.useState(selectedThana || 'Gulshan');

  if (!isOpen) return null;

  const currentDivObj = BANGLADESH_LOCATIONS.find((d) => d.name === division) || BANGLADESH_LOCATIONS[0];
  const availableDistricts = currentDivObj.districts;
  const currentDistObj = availableDistricts.find((d) => d.name === district) || availableDistricts[0];
  const availableThanas = currentDistObj ? currentDistObj.thanas : [];

  const calc = calculateDeliveryFee(currentDistObj?.id || 'dhaka-city', thana || 'gulshan');

  const handleDivisionChange = (divName: string) => {
    setDivision(divName);
    const dObj = BANGLADESH_LOCATIONS.find((d) => d.name === divName);
    if (dObj && dObj.districts.length > 0) {
      setDistrict(dObj.districts[0].name);
      if (dObj.districts[0].thanas.length > 0) {
        setThana(dObj.districts[0].thanas[0].name);
      }
    }
  };

  const handleDistrictChange = (distName: string) => {
    setDistrict(distName);
    const distObj = availableDistricts.find((d) => d.name === distName);
    if (distObj && distObj.thanas.length > 0) {
      setThana(distObj.thanas[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Select Delivery Address</h3>
              <p className="text-[10px] text-slate-400">Bangladesh Geographic Coverage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Division */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-500">1. Select Division</label>
          <select
            value={division}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
          >
            {BANGLADESH_LOCATIONS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} Division
              </option>
            ))}
          </select>
        </div>

        {/* District & Thana */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">2. District</label>
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
            >
              {availableDistricts.map((dst) => (
                <option key={dst.id} value={dst.name}>
                  {dst.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">3. Thana / Upazila</label>
            <select
              value={thana}
              onChange={(e) => setThana(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
            >
              {availableThanas.map((th) => (
                <option key={th.id} value={th.name}>
                  {th.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculated Charge Box */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center flex-shrink-0">
            ৳{calc.fee}
          </div>
          <div>
            <p className="font-extrabold text-orange-950">Zone: {calc.zone}</p>
            <p className="text-[10px] text-orange-800 font-medium">{calc.desc}</p>
          </div>
        </div>

        <button
          onClick={() => {
            onSaveLocation(division, district, thana);
            onClose();
          }}
          className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <Check className="w-4 h-4" />
          <span>Set Delivery Location</span>
        </button>
      </div>
    </div>
  );
};
