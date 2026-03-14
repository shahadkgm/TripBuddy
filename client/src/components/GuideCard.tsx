// src/modules/guides/components/GuideCard.tsx
import React from 'react';
import { MapPin } from 'lucide-react';
import type { IGuide } from '../interface/IGuide';

export const GuideCard: React.FC<{ guide: IGuide }> = ({ guide }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex items-start space-x-4">
      <img
        src={guide.avatarURL ? (guide.avatarURL.startsWith('http') ? guide.avatarURL : `${import.meta.env.VITE_API_URL}${guide.avatarURL}`) : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (guide.userId?.name || 'guide')}
        className="w-20 h-20 rounded-full object-cover border-4 border-tb-purple/20"
        alt="Guide"
      />
      <div className="grow">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">{guide.userId?.name || guide.name}</h3>
          <span className="text-2xl font-bold text-tb-purple">₹{guide.hourlyRate}<small className="text-sm text-gray-400 font-normal ml-0.5">/hr</small></span>
        </div>

        <p className="flex items-center gap-1 text-sm font-semibold text-indigo-600 mt-1">
          <MapPin className="w-4 h-4" /> {guide.serviceArea}
        </p>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed break-all">{guide.bio}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {guide.specialties?.map((s: string) => (
            <span key={s} className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};