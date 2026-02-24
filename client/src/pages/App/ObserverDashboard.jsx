import React, { useState } from 'react';

const ObserverDashboard = () => {
  const [network, setNetwork] = useState([
    {
      id: "u1",
      name: "Kamala (Grandmother)",
      status: "Escalated", 
      missed_meds: ["Amoxicillin 500mg"],
      last_updated: "10 mins ago"
    }
  ]);

  // States for the Add Member Form
  const [isAdding, setIsAdding] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (newPhone.length < 10) return alert("Enter a valid 10-digit number.");
    
    // Simulate adding to network
    setNetwork([...network, {
      id: Date.now().toString(),
      name: `User (${newRelation})`,
      status: "Acknowledged",
      missed_meds: [],
      last_updated: "Just now"
    }]);
    
    alert(`Tracking request sent to ${newPhone}!`);
    setIsAdding(false);
    setNewPhone('');
    setNewRelation('');
  };

  const getStatusStyles = (status) => {
    if (status === "Acknowledged") return "bg-green-100 text-green-800 border-green-200";
    if (status === "Pending") return "bg-amber-100 text-amber-800 border-amber-200";
    if (status === "Escalated") return "bg-red-100 text-red-800 border-red-200 shadow-red-200/50";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 md:p-8">
      
      {/* Header & Add Button */}
      <header className="mb-8 max-w-4xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Care Network</h1>
          <p className="text-slate-500 mt-1">Real-time medication monitoring</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors"
        >
          {isAdding ? "Cancel" : "+ Add Member"}
        </button>
      </header>

      {/* Add Member Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddMember} className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md border-2 border-blue-100 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Request to Monitor Relative</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-600 font-bold mb-1 text-sm">Their Phone Number</label>
              <input type="tel" required value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g., 9876543210" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1 text-sm">Relation (e.g., Mother, Uncle)</label>
              <input type="text" required value={newRelation} onChange={e => setNewRelation(e.target.value)} placeholder="e.g., Grandmother" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow hover:bg-slate-800">
            Send Tracking Request
          </button>
        </form>
      )}

      {/* Network Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {network.map((person) => (
          <div key={person.id} className={`bg-white rounded-2xl p-6 border-2 shadow-sm ${getStatusStyles(person.status).split(' ')[2]}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-800">{person.name}</h2>
              <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusStyles(person.status)}`}>
                {person.status}
              </span>
            </div>

            {person.status === "Escalated" && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-700 font-bold flex items-center gap-2">⚠️ URGENT ALERT</p>
                <p className="text-red-600 text-sm mt-1">Did not respond to AI Voice Call or App Push.</p>
                <p className="text-slate-700 font-medium mt-3">Missed:</p>
                <ul className="list-disc list-inside text-slate-600 text-sm mb-4">
                  {person.missed_meds.map((med, i) => <li key={i}>{med}</li>)}
                </ul>
                <div className="flex gap-3">
                  <button className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold shadow hover:bg-red-700">📞 Call</button>
                  <button className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-lg font-bold hover:bg-red-50">Resolve</button>
                </div>
              </div>
            )}

            {person.status === "Acknowledged" && (
              <div className="mt-4 flex items-center gap-3 text-slate-600">
                <span className="text-2xl">✅</span>
                <p>All medications taken on time. No action needed.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObserverDashboard;