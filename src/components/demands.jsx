import React, { useState } from 'react';

const AccessPortalForm = ({ onComplete }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form validated. Redirecting to Auth...");
    // This tells App.js to switch to the Auth component
    onComplete(); 
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Mohan(Lucky) demands</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Checkbox */}
        <div className="flex items-center space-x-4">
          <input 
            id="terms"
            type="checkbox" 
            checked={isAccepted}
            onChange={(e) => setIsAccepted(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="terms" className="text-gray-700 font-medium cursor-pointer">
            I Accept all ur demands by checking this and accept that ur my Lucky
          </label>
        </div>

        {/* Dropdown */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-500 uppercase">I am coming and agreed to all the things and ulta odiyella nan yella matu kelthini nin mele promise?</label>
          <select 
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Select Option...</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={!isAccepted || !confirmation}
          className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all 
            ${(!isAccepted || !confirmation) 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
        >
          Submit & Continue
        </button>
      </form>

      <div className="p-3 bg-gray-900 rounded-md font-mono text-[10px] text-green-400">
        <p>Other option</p>
        <p>Kidnap: {isAccepted && confirmation ? "Neen accept madilla andre pakka madthidde" : "TRUE Pakkaaa"}</p>
      </div>
    </div>
  );
};

export default AccessPortalForm;