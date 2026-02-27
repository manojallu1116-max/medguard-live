import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import OcrScanner from './OcrScanner';

const AddReminder = ({ patientPhone, onSuccess }) => {
  const [medicineName, setMedicineName] = useState('');
  const [timeSlot, setTimeSlot] = useState('Morning');
  const [quantity, setQuantity] = useState('1 Tablet');
  const [totalStock, setTotalStock] = useState('15'); // 🌟 The Inventory State
  const [photoBase64, setPhotoBase64] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert("Camera access denied.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const MAX_WIDTH = 500;
      const scale = MAX_WIDTH / video.videoWidth;
      canvas.width = MAX_WIDTH;
      canvas.height = video.videoHeight * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoBase64(canvas.toDataURL('image/jpeg', 0.7));
      stopCamera();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhotoBase64(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('https://medguard-backend-rwlh.onrender.com/api/sync/add-reminder', {
        phone: patientPhone,
        medicineName,
        timeSlot,
        quantity,
        totalStock, // 🌟 Passing it to the backend
        photo: photoBase64 
      });
      setMedicineName('');
      setPhotoBase64('');
      if (onSuccess) onSuccess(); 
    } catch (error) {
      console.error(error);
      alert("Failed to save medicine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">⏰ Add New Medicine</h2>

      <OcrScanner onScanComplete={(scannedText) => setMedicineName(scannedText)} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
          <label className="block text-sm font-bold text-slate-700 mb-2">📸 Attach Pill/Box Photo</label>
          <canvas ref={canvasRef} className="hidden"></canvas>
          {showCamera ? (
            <div className="flex flex-col items-center animate-pulse-once">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover rounded-lg mb-3 bg-black border-2 border-blue-400"></video>
              <div className="flex gap-2 w-full">
                <button type="button" onClick={takePhoto} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold shadow-md hover:bg-blue-700">📸 Snap</button>
                <button type="button" onClick={stopCamera} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold shadow-md hover:bg-red-600">Cancel</button>
              </div>
            </div>
          ) : photoBase64 ? (
            <div className="flex flex-col items-center">
              <img src={photoBase64} alt="Captured" className="w-full h-48 object-cover rounded-lg mb-2 shadow-md border-2 border-green-400" />
              <button type="button" onClick={() => setPhotoBase64('')} className="text-red-500 font-bold text-sm underline hover:text-red-700">🗑️ Remove Photo</button>
            </div>
          ) : (
            <div className="flex gap-2">
               <button type="button" onClick={startCamera} className="flex-1 bg-blue-100 text-blue-800 py-3 rounded-lg font-bold border border-blue-300 hover:bg-blue-200 transition flex items-center justify-center gap-2">🎥 Live Camera</button>
               <label className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold border border-slate-300 hover:bg-slate-300 transition flex items-center justify-center gap-2 cursor-pointer">
                  📁 Upload File<input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
               </label>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Medicine Name</label>
          <input type="text" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} placeholder="e.g. Paracetamol 500mg" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Dose (Per Time)</label>
            <select value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-3 border border-gray-300 rounded font-bold">
              <option>1 Tablet</option><option>2 Tablets</option><option>1 Spoon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Time Slot</label>
            <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full p-3 border border-gray-300 rounded font-bold">
              <option>Morning</option><option>Afternoon</option><option>Night</option>
            </select>
          </div>
        </div>

        {/* 🌟 ORANGE BOX: TOTAL PILLS IN PACKET */}
        <div>
          <label className="block text-sm font-bold text-orange-600 mb-1">Total Pills in Packet/Box</label>
          <input type="number" value={totalStock} onChange={(e) => setTotalStock(e.target.value)} min="1" className="w-full p-3 border-2 border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold bg-orange-50" required />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-lg mt-4 transition-transform active:scale-95">
          {isSubmitting ? "Saving to Cloud..." : "Save Reminder"}
        </button>
      </form>
    </div>
  );
};

export default AddReminder;