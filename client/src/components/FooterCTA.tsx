import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FooterCTA: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center gap-4 border-t pt-8">
            <button
                onClick={() => navigate('/create-trip')}
                className="w-full md:w-auto px-16 py-4 bg-[#10b981] text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95"
            >
                Start Planning Now
            </button>
            <p className="text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
                Make every moment of your journey count
            </p>
        </div>
    );
};
