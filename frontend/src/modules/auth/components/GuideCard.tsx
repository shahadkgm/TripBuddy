// src/modules/guides/components/GuideCard.tsx
import React from 'react';
import { Star, CheckCircle, MapPin } from 'lucide-react';

export const GuideCard: React.FC<{ guide: any }> = ({ guide }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex items-start space-x-4">
      <img 
        src={guide.avatarURL ? `${import.meta.env.VITE_API_URL}${guide.avatarURL}` : "https://via.placeholder.com/100"} 
        className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500"
        alt="Guide"
      />
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">{guide.userId?.name}</h3>
          <span className="text-2xl font-bold text-tb-purple">${guide.hourlyRate}<small className="text-sm text-gray-400">/hr</small></span>
        </div>
        
        {/* ADDED SERVICE AREA HERE */}
        <p className="flex items-center gap-1 text-sm font-semibold text-indigo-600 mt-1">
          <MapPin className="w-4 h-4" /> {guide.serviceArea}
        </p>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{guide.bio}</p>
        
        <div className="mt-3 flex gap-2">
          {guide.specialities?.map((s: string) => (
            <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded">#{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
};