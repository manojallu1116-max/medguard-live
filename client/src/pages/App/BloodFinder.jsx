import React, { useState } from 'react';

const BloodFinder = () => {
  const [searchGroup, setSearchGroup] = useState('O+');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);

  // Mock API Call to the Backend
  const handleSearch = () => {
    setIsSearching(true);
    // Simulating the 2dsphere backend query delay
    setTimeout(() => {
      setResults([
        { id: 1, name: "Suresh V.", distance: "4.2 km", cooldown_clear: true },
        { id: 2, name: "Anjali K.", distance: "12.8 km", cooldown_clear: false },
        { id: 3, name: "Rahul M.", distance: "18.1 km", cooldown_clear: true }
      ]);
      setIsSearching(false);
    }, 1500);
  };

  const pingDonor = (name) => {
    alert(`Emergency SMS sent to ${name}. They will contact you shortly.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="bg-red-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>🩸</span> Blood Finder
        </h1>
        <p className="text-red-100 mt-2">Pinging registered donors within 20km radius.</p>
      </header>

      <main className="p-4 mt-4">
        {/* Search Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <label className="block text-slate-700 font-bold mb-2">Required Blood Group</label>
          <div className="flex gap-4">
            <select 
              value={searchGroup}
              onChange={e => setSearchGroup(e.target.value)}
              className="flex-1 p-4 border border-slate-300 rounded-xl text-xl font-bold outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option>
              <option>AB+</option><option>AB-</option>
            </select>
            <button 
              onClick={handleSearch}
              className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95"
            >
              {isSearching ? "Radar Active..." : "Scan 20km"}
            </button>
          </div>
        </div>

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-slate-500 font-bold uppercase tracking-wider text-sm px-2">
              Matches Found ({results.length})
            </h2>
            
            {results.map(donor => (
              <div key={donor.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{donor.name}</h3>
                  <p className="text-slate-500 font-mono text-sm mt-1">📍 {donor.distance} away</p>
                </div>
                
                {donor.cooldown_clear ? (
                  <button 
                    onClick={() => pingDonor(donor.name)}
                    className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-colors"
                  >
                    Ping Alert
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg font-bold text-sm block">
                      Unavailable
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">On Cooldown</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BloodFinder;