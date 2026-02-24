import React, { useState } from 'react';

const HealthVault = () => {
  const [documents, setDocuments] = useState([
    { id: 1, title: "Blood Test Report", date: "Feb 15, 2026", type: "PDF" },
    { id: 2, title: "Dr. Sharma Prescription", date: "Jan 10, 2026", type: "Image" }
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e) => {
    e.preventDefault();
    setIsUploading(true);
    // Simulate upload delay for the hackathon demo
    setTimeout(() => {
      setDocuments([
        { id: Date.now(), title: "New Lab Result", date: "Today", type: "PDF" },
        ...documents
      ]);
      setIsUploading(false);
      alert("File securely uploaded to MedGuard Vault!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-teal-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold">Family Health Vault</h1>
        <p className="text-teal-100 mt-2">Secure storage for all medical records.</p>
      </header>

      <main className="p-4 mt-4 max-w-4xl mx-auto space-y-8">
        {/* Upload Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-dashed border-slate-300 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Upload New Record</h2>
          <p className="text-slate-500 mb-6">Drag and drop PDFs or photos of prescriptions here.</p>
          
          <label className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-md">
            {isUploading ? "Uploading to Cloud..." : "Browse Files"}
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {/* Document Gallery */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Saved Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${doc.type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {doc.type}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{doc.title}</h3>
                    <p className="text-slate-500 text-sm">{doc.date}</p>
                  </div>
                </div>
                <button className="text-teal-600 hover:text-teal-800 font-bold p-2">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthVault;