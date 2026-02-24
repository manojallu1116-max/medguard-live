import React, { useState } from 'react';

const PartnerLocator = () => {
  // Mock data representing the 2dsphere geospatial search from your backend
  const [shops] = useState([
    { id: "MG-001", name: "Apollo MedGuard Partner", distance: "1.2 km", status: "Open Now", address: "Main Road, Block A" },
    { id: "MG-002", name: "City Health Pharmacy", distance: "3.5 km", status: "Open Now", address: "Market Square" },
    { id: "MG-003", name: "CarePlus Chemists", distance: "5.0 km", status: "Closed", address: "West Avenue" }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 flex flex-col">
      <header className="bg-indigo-600 text-white p-6 shadow-lg z-10 relative">
        <h1 className="text-3xl font-bold">Find a Pharmacy</h1>
        <p className="text-indigo-100 mt-2">Get automatic refills at MedGuard integrated shops.</p>
      </header>

      {/* Mock Map UI for Hackathon Demo */}
      <div className="h-64 bg-slate-300 w-full relative flex items-center justify-center overflow-hidden">
        {/* Simulating map background */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-indigo-100 font-bold text-indigo-800 flex items-center gap-2">
          <span>📍</span> Locating integrated partners near you...
        </div>
      </div>

      <main className="flex-1 p-4 -mt-6 relative z-20 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
          {shops.map((shop) => (
            <div key={shop.id} className="p-4 border-b last:border-0 border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  {shop.name} 
                  {shop.status === "Open Now" && <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>}
                </h3>
                <p className="text-slate-500 text-sm mt-1">{shop.address}</p>
                <div className="mt-2 text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block">
                  Partner ID: {shop.id}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700 mb-2">{shop.distance}</p>
                <button className="bg-indigo-100 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold px-4 py-2 rounded-lg transition-colors text-sm">
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PartnerLocator;