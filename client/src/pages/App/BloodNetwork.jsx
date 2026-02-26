import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BloodNetwork = () => {
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [radius, setRadius] = useState('10'); 
  const [donors, setDonors] = useState([]);
  
  // 🌟 NEW: Manual Location States
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 NEW: The Free Geocoder (Turns text into GPS)
  const getCoordinatesFromText = async (address) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding failed", error);
      return null;
    }
  };

  const executeSearch = async (lat, lng) => {
    try {
      const encodedGroup = encodeURIComponent(bloodGroup);
      const response = await axios.get(`http://localhost:5000/api/network/blood/${encodedGroup}?lat=${lat}&lng=${lng}&radius=${radius}`);
      setDonors(response.data);
      setHasSearched(true);
    } catch (error) {
      console.error("Failed to fetch donors", error);
      alert("Error searching the network.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // PATH 1: User typed a city/pincode
    if (useManualLocation) {
      if (!searchLocation.trim()) {
        alert("Please enter a city, area, or pincode!");
        setIsLoading(false);
        return;
      }
      
      const coords = await getCoordinatesFromText(searchLocation);
      if (!coords) {
        alert("Could not find that location. Please try a different city or pincode.");
        setIsLoading(false);
        return;
      }
      
      executeSearch(coords.latitude, coords.longitude);
    } 
    // PATH 2: User relies on Phone GPS
    else {
      if (!navigator.geolocation) {
        alert("Your device doesn't support GPS. Please type your location manually.");
        setUseManualLocation(true);
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => executeSearch(position.coords.latitude, position.coords.longitude),
        (error) => {
          console.error("GPS Error:", error);
          alert("GPS access denied! Please switch to manual search.");
          setUseManualLocation(true);
          setIsLoading(false);
        },
        { timeout: 10000 } // Give up if GPS takes longer than 10 seconds
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <header className="bg-red-600 text-white p-6 md:p-8 rounded-b-3xl shadow-lg relative">
        <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 bg-red-700/50 hover:bg-red-800 p-2 rounded-xl transition-colors font-bold">← Back</button>
        <h1 className="text-4xl font-bold mt-10 pr-4">Emergency Blood Network</h1>
        <p className="text-red-100 mt-2 text-xl">Find nearby MedGuard community donors.</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
          <form onSubmit={handleSearchClick} className="flex flex-col gap-5">
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-slate-700 font-bold mb-2">Blood Group</label>
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-xl font-bold text-slate-800 outline-none">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-slate-700 font-bold mb-2">Radius</label>
                <select value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-xl font-bold text-slate-800 outline-none">
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>
            </div>

            {/* 🌟 NEW: The GPS vs Manual Toggle UI */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-slate-700 font-bold">Search Location</label>
                <button type="button" onClick={() => setUseManualLocation(!useManualLocation)} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                  {useManualLocation ? "Use Auto GPS 📍" : "Type Manually ⌨️"}
                </button>
              </div>
              
              {useManualLocation ? (
                <input 
                  type="text" 
                  placeholder="Enter City, Area, or Pincode..." 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              ) : (
                <div className="w-full p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl font-medium flex items-center gap-2">
                  <span className="animate-pulse">📍</span> Using Live Device GPS
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
              {isLoading ? "🛰️ Scanning Area..." : "📍 Scan Nearby Donors"}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="mt-8 space-y-4">
          {hasSearched && donors.length === 0 && (
            <div className="text-center p-8 bg-slate-200 rounded-3xl text-slate-600">
              <span className="text-4xl mb-2 block">😔</span>
              <h3 className="text-xl font-bold">No nearby donors found.</h3>
              <p>Try expanding your search radius or changing the city.</p>
            </div>
          )}

          {donors.map((donor, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-md border-l-8 border-red-500 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{donor.name}</h3>
                <p className="text-slate-500 font-mono mt-1">MedGuard Verified Donor</p>
                <span className="inline-block mt-2 bg-red-100 text-red-800 px-3 py-1 rounded-lg font-bold">Blood: {donor.bloodGroup}</span>
              </div>
              <a href={`tel:${donor.phone}`} className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center gap-1">
                <span className="text-2xl">📞</span>
                <span className="text-xs font-bold uppercase tracking-wider">Call Now</span>
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BloodNetwork;