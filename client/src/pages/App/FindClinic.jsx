import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FindClinic = () => {
  const navigate = useNavigate();
  const [radius, setRadius] = useState('10'); 
  const [clinics, setClinics] = useState([]);
  
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getCoordinatesFromText = async (address) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      if (response.data && response.data.length > 0) {
        return { latitude: parseFloat(response.data[0].lat), longitude: parseFloat(response.data[0].lon) };
      }
      return null;
    } catch (error) { return null; }
  };

  const executeSearch = async (lat, lng) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/network/clinics?lat=${lat}&lng=${lng}&radius=${radius}`);
      setClinics(response.data);
      setHasSearched(true);
    } catch (error) {
      alert("Error searching for clinics.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (useManualLocation) {
      if (!searchLocation.trim()) { alert("Please enter a city or pincode!"); setIsLoading(false); return; }
      const coords = await getCoordinatesFromText(searchLocation);
      if (!coords) { alert("Location not found."); setIsLoading(false); return; }
      executeSearch(coords.latitude, coords.longitude);
    } else {
      if (!navigator.geolocation) {
        alert("GPS not supported. Please type your location.");
        setUseManualLocation(true); setIsLoading(false); return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => executeSearch(pos.coords.latitude, pos.coords.longitude),
        () => {
          alert("GPS denied! Switching to manual search.");
          setUseManualLocation(true); setIsLoading(false);
        },
        { timeout: 10000 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <header className="bg-emerald-600 text-white p-6 md:p-8 rounded-b-3xl shadow-lg relative">
        <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 bg-emerald-700/50 hover:bg-emerald-800 p-2 rounded-xl transition-colors font-bold">← Back</button>
        <h1 className="text-4xl font-bold mt-10 pr-4">Find a Clinic</h1>
        <p className="text-emerald-100 mt-2 text-xl">Locate MedGuard partner pharmacies nearby.</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
          <form onSubmit={handleSearchClick} className="flex flex-col gap-5">
            
            <div>
              <label className="block text-slate-700 font-bold mb-2">Search Radius</label>
              <select value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-xl font-bold text-slate-800 outline-none">
                <option value="5">Within 5 km</option><option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option><option value="50">Within 50 km</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-slate-700 font-bold">Search Location</label>
                <button type="button" onClick={() => setUseManualLocation(!useManualLocation)} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                  {useManualLocation ? "Use Auto GPS 📍" : "Type Manually ⌨️"}
                </button>
              </div>
              
              {useManualLocation ? (
                <input type="text" placeholder="Enter City, Area, or Pincode..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
              ) : (
                <div className="w-full p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl font-medium flex items-center gap-2"><span className="animate-pulse">📍</span> Using Live Device GPS</div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
              {isLoading ? "🛰️ Scanning Area..." : "🏥 Find Pharmacies"}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="mt-8 space-y-4">
          {hasSearched && clinics.length === 0 && (
            <div className="text-center p-8 bg-slate-200 rounded-3xl text-slate-600">
              <span className="text-4xl mb-2 block">🏪</span>
              <h3 className="text-xl font-bold">No partner clinics found nearby.</h3>
              <p>Try expanding your search radius.</p>
            </div>
          )}

          {clinics.map((clinic, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-md border-l-8 border-emerald-500 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{clinic.name}</h3>
                <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg font-bold font-mono">ID: {clinic.shopId}</span>
              </div>
              <a href={`tel:${clinic.phone}`} className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center gap-1">
                <span className="text-2xl">📞</span>
                <span className="text-xs font-bold uppercase tracking-wider">Call</span>
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FindClinic;