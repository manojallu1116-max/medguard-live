import React, { useState } from 'react';
import axios from 'axios';

const PosDashboard = () => {
  const [patientPhone, setPatientPhone] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', qty: '', price: '', morning: 0, afternoon: 0, night: 0 }
  ]);
  const [isSyncing, setIsSyncing] = useState(false); // Added a loading state!

  const dosagePresets = ["1-0-1", "1-1-1", "1-0-0", "0-0-1", "0-1-0"];

  const handleAddRow = () => {
    setMedicines([...medicines, { name: '', qty: '', price: '', morning: 0, afternoon: 0, night: 0 }]);
  };

  const handleRemoveRow = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    if (updated.length === 0) {
      setMedicines([{ name: '', qty: '', price: '', morning: 0, afternoon: 0, night: 0 }]);
    } else {
      setMedicines(updated);
    }
  };

  const handleUpdateRow = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const applyPreset = (index, preset) => {
    const [m, a, n] = preset.split('-');
    const updatedMedicines = [...medicines];
    updatedMedicines[index].morning = parseInt(m);
    updatedMedicines[index].afternoon = parseInt(a);
    updatedMedicines[index].night = parseInt(n);
    setMedicines(updatedMedicines);
  };

  const handlePrintBill = async () => {
    if (!patientPhone || patientPhone.length < 10) {
      alert("Please enter a valid 10-digit patient phone number.");
      return;
    }

    const payloadMedicines = medicines
      .filter(med => med.name !== '') 
      .map(med => {
        const dosage_routine = [];
        if (med.morning > 0) dosage_routine.push({ time_slot: "Morning", target_time: "08:00", qty: parseInt(med.morning) });
        if (med.afternoon > 0) dosage_routine.push({ time_slot: "Afternoon", target_time: "14:00", qty: parseInt(med.afternoon) });
        if (med.night > 0) dosage_routine.push({ time_slot: "Night", target_time: "20:00", qty: parseInt(med.night) });

        return {
          name: med.name,
          total_quantity: parseInt(med.qty) || 0,
          dosage_routine: dosage_routine
        };
      });

    if (payloadMedicines.length === 0) {
      alert("Please add at least one medicine to print the bill.");
      return;
    }

    const syncPayload = {
      patient_phone: patientPhone,
      shop_id: "MG-001",
      medicines: payloadMedicines
    };

    setIsSyncing(true);

    try {
      // THE MAGIC CONNECTION: Send data to Node.js backend
      const response = await axios.post('http://localhost:5000/api/sync/print-bill', syncPayload);
      
      console.log("BACKEND RESPONSE:", response.data);
      alert("✅ Success! Bill Printed and securely synced to the Patient's App in the cloud.");
      
      // Reset form on success
      setPatientPhone('');
      setMedicines([{ name: '', qty: '', price: '', morning: 0, afternoon: 0, night: 0 }]);
    } catch (error) {
      console.error("Sync Error:", error);
      alert("❌ Failed to sync to cloud. Is your Node.js server running on port 5000?");
    } finally {
      setIsSyncing(false);
    }
  };

  const totalBill = medicines.reduce((sum, med) => sum + (parseFloat(med.price) || 0), 0);
  const totalItems = medicines.filter(med => med.name !== '').length;

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900 text-white shadow-md flex justify-between items-center px-6 py-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-xl shadow-inner">Mg</div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">MedGuard POS System</h1>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Terminal #01 • Partner ID: MG-001</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1">
          <span className="px-3 text-slate-400 font-medium text-sm">Customer Ph:</span>
          <input type="tel" placeholder="9876543210" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="bg-slate-900 text-green-400 px-4 py-2 rounded font-mono text-lg outline-none focus:ring-2 focus:ring-blue-500 w-48 placeholder-slate-600" />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold w-12 text-center">#</th>
                  <th className="p-4 font-semibold w-1/4">Medicine Name</th>
                  <th className="p-4 font-semibold w-24">Qty</th>
                  <th className="p-4 font-semibold w-32">Price (₹)</th>
                  <th className="p-4 font-semibold text-center bg-blue-50/50">Presets</th>
                  <th className="p-4 font-semibold w-24 text-center bg-amber-50/50 text-amber-700">☀️ Morn</th>
                  <th className="p-4 font-semibold w-24 text-center bg-orange-50/50 text-orange-700">🌇 Aft</th>
                  <th className="p-4 font-semibold w-24 text-center bg-indigo-50/50 text-indigo-700">🌙 Night</th>
                  <th className="p-4 font-semibold w-16 text-center">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-3 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="p-3"><input type="text" value={med.name} onChange={(e) => handleUpdateRow(index, 'name', e.target.value)} className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type or scan item..." /></td>
                    <td className="p-3"><input type="number" min="1" value={med.qty} onChange={(e) => handleUpdateRow(index, 'qty', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-center focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="0" /></td>
                    <td className="p-3"><input type="number" min="0" value={med.price} onChange={(e) => handleUpdateRow(index, 'price', e.target.value)} className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-right" placeholder="0.00" /></td>
                    <td className="p-3 bg-blue-50/30">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {dosagePresets.map(preset => (
                          <button key={preset} onClick={() => applyPreset(index, preset)} className="text-[11px] font-bold px-2 py-1 rounded bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors shadow-sm">{preset}</button>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 bg-amber-50/30"><input type="number" min="0" value={med.morning} onChange={(e) => handleUpdateRow(index, 'morning', e.target.value)} className="w-full p-2 border border-amber-200 rounded text-center focus:ring-2 focus:ring-amber-500 outline-none font-mono bg-white" /></td>
                    <td className="p-3 bg-orange-50/30"><input type="number" min="0" value={med.afternoon} onChange={(e) => handleUpdateRow(index, 'afternoon', e.target.value)} className="w-full p-2 border border-orange-200 rounded text-center focus:ring-2 focus:ring-orange-500 outline-none font-mono bg-white" /></td>
                    <td className="p-3 bg-indigo-50/30"><input type="number" min="0" value={med.night} onChange={(e) => handleUpdateRow(index, 'night', e.target.value)} className="w-full p-2 border border-indigo-200 rounded text-center focus:ring-2 focus:ring-indigo-500 outline-none font-mono bg-white" /></td>
                    <td className="p-3 text-center"><button onClick={() => handleRemoveRow(index)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">✖</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button onClick={handleAddRow} className="text-blue-600 font-bold hover:text-blue-800 text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 transition-colors">➕ Add Blank Row</button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t-4 border-blue-600 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 flex justify-between items-end">
        <div>
          <p className="text-slate-500 text-sm mb-1">Receipt Summary</p>
          <div className="flex gap-6">
            <p className="text-slate-700 font-semibold">Total Items: <span className="text-xl text-slate-900">{totalItems}</span></p>
            <p className="text-slate-700 font-semibold">Taxes: <span className="text-slate-500 text-sm">Included</span></p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Grand Total</p>
            <p className="text-5xl font-mono font-bold text-emerald-600">₹{totalBill.toFixed(2)}</p>
          </div>
          <button 
            onClick={handlePrintBill} 
            disabled={isSyncing}
            className={`text-white px-10 py-5 rounded-xl font-bold text-xl shadow-xl transition transform flex items-center gap-3 ${isSyncing ? 'bg-slate-400 cursor-not-allowed opacity-80' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 shadow-blue-600/30'}`}
          >
            <span className="text-2xl">{isSyncing ? "⏳" : "🖨️"}</span> {isSyncing ? "Syncing to Cloud..." : "Print & Sync App"}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PosDashboard;