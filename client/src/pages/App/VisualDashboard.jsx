import React, { useState } from 'react';

const VisualDashboard = () => {
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      time_slot: "Morning",
      target_time: "08:00 AM",
      status: "pending", 
      medications: [
        { name: "Amoxicillin 500mg", qty: 1, image_url: "https://images.unsplash.com/photo-1584308666744-24d5e479956f?w=400&h=400&fit=crop" },
        { name: "Vitamin C", qty: 2, image_url: "https://images.unsplash.com/photo-1550572017-edb329d45118?w=400&h=400&fit=crop" }
      ]
    }
  ]);

  const handleTakeMedicine = (id) => {
    const updated = schedule.map(slot => 
      slot.id === id ? { ...slot, status: 'taken' } : slot
    );
    setSchedule(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-blue-600 text-white p-6 md:p-10 rounded-b-3xl shadow-lg">
        <h1 className="text-4xl font-bold">Good Morning!</h1>
        <p className="text-blue-100 mt-2 text-xl">Here is your schedule for today.</p>
      </header>

      <main className="p-4 mt-6 max-w-2xl mx-auto space-y-8">
        {schedule.map((slot) => (
          <div key={slot.id} className={`bg-white rounded-3xl shadow-xl overflow-hidden border-l-[12px] ${slot.status === 'taken' ? 'border-green-500' : 'border-amber-400'}`}>
            
            {/* Header */}
            <div className="p-6 bg-slate-50 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                {slot.time_slot === "Morning" ? "☀️" : "🌙"} {slot.time_slot}
              </h2>
              <span className="text-slate-600 font-bold text-xl">{slot.target_time}</span>
            </div>

            {/* GIANT Photo Section */}
            <div className="p-6 space-y-8">
              {slot.medications.map((med, idx) => (
                <div key={idx} className="flex flex-row items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {/* The photo is now 128x128px on mobile, and 160x160px on larger screens */}
                  <img src={med.image_url} alt={med.name} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-md border-2 border-white shrink-0" />
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{med.name}</h3>
                    <div className="mt-3 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-xl">
                      Take {med.qty} Pill{med.qty > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="p-6 bg-white border-t border-slate-50">
              {slot.status === 'taken' ? (
                <div className="w-full py-6 text-center rounded-2xl bg-green-100 text-green-700 font-bold text-2xl">
                  ✅ Medicine Taken
                </div>
              ) : (
                <button 
                  onClick={() => handleTakeMedicine(slot.id)}
                  className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-3xl shadow-[0_8px_30px_rgb(37,99,235,0.3)] transition-transform active:scale-95 flex justify-center items-center gap-3"
                >
                  💊 I Took It
                </button>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default VisualDashboard;