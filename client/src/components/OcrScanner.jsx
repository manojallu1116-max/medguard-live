import React, { useState } from 'react';

const OcrScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🌟 THE SMART FILTER: Extracts only the medicine name!
  const extractMedicineName = (rawText) => {
    // 1. Split the giant block of text into individual lines
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 3);

    const medKeywords = ['TABLET', 'TABLETS', 'CAPSULE', 'CAPSULES', 'SYRUP', 'MG', 'ML', 'IP', 'USP', 'DOLO', 'PARACETAMOL'];
    const garbageKeywords = ['STORE', 'DOSAGE', 'MANUFACTURED', 'PVT', 'LTD', 'CHILDREN', 'WARNING', 'DIRECTED', 'PHYSICIAN', 'COOL', 'DRY', 'PLACE', '@', '.com', '.in', 'HTTP', 'TEMPERATURE'];

    for (let line of lines) {
      const upperLine = line.toUpperCase();

      // Skip obvious garbage lines (like URLs, dates, or instructions)
      if (garbageKeywords.some(kw => upperLine.includes(kw))) continue;
      // Skip lines with too many numbers (like timestamps 12:27)
      if ((line.match(/\d/g) || []).length > 5) continue;

      // If it has a medicine keyword, it's highly likely the name!
      if (medKeywords.some(kw => upperLine.includes(kw))) {
         // Clean out weird OCR symbols like ©, ®, and return
         return line.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
      }
    }

    // Fallback: If no keywords are found, just grab the first clean-looking text
    for (let line of lines) {
      const upperLine = line.toUpperCase();
      if (!garbageKeywords.some(kw => upperLine.includes(kw)) && /[A-Za-z]/.test(line)) {
          return line.replace(/[^a-zA-Z0-9\s-]/g, '').trim().substring(0, 25);
      }
    }

    return ""; // If it fails completely, leave it blank for user to type
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setProgress(0);

    // Using the global Tesseract from your index.html
    window.Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      }
    ).then(({ data: { text } }) => {
      setIsScanning(false);
      
      // 🌟 Pass the raw text through our Smart Filter!
      const smartText = extractMedicineName(text);
      
      if (smartText) {
        onScanComplete(smartText);
      } else {
        alert("Couldn't find a clear medicine name. Please type it manually.");
      }
      
    }).catch(err => {
      console.error("OCR Error:", err);
      setIsScanning(false);
      alert("Scanning failed. Please try typing it manually.");
    });
  };

  return (
    <div className="p-4 border-2 border-dashed border-blue-400 rounded-lg text-center bg-blue-50 mb-4">
      <h3 className="font-bold text-blue-800 mb-2">🤖 AI Text Scanner</h3>
      
      {!isScanning ? (
        <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          <span>Scan Medicine Text</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleImageUpload} 
            className="hidden" 
          />
        </label>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full bg-gray-300 rounded-full h-4 mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}>
            </div>
          </div>
          <p className="text-sm text-blue-800 mt-2 font-bold animate-pulse">
            Extracting Medicine Name... {progress}%
          </p>
        </div>
      )}
    </div>
  );
};

export default OcrScanner;