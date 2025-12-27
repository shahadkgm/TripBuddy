import React from 'react';

const FEATURES = [
  { 
    title: "Messaging", 
    desc: "Chat in real-time with your travel buddies to finalize plans.", 
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100"
  },
  { 
    title: "Group Trips", 
    desc: "Coordinate with multiple travelers and share a collective itinerary.", 
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100"
  },
  { 
    title: "Weather Forecast", 
    desc: "Stay prepared with live weather updates for your destination.", 
    icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-100"
  },
  { 
    title: "Find a Guide", 
    desc: "Connect with local experts to discover hidden gems.", 
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    borderColor: "border-rose-100"
  },
  { 
    title: "Join as Guide", 
    desc: "Share your local knowledge and earn by leading trips.", 
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100"
  },
  { 
    title: "Expense Split", 
    desc: "Track shared costs and settle bills fairly with your group.", 
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-100"
  },
];

export const FeatureGrid = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need for the perfect trip</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore our wide range of features designed to make your travel planning seamless and enjoyable.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map((f, i) => (
          <div 
            key={i} 
            className={`p-8 rounded-3xl border ${f.borderColor} ${f.color} transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 transition-transform group-hover:rotate-6`}>
              <svg 
                className={`w-7 h-7 ${f.iconColor}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon} />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h4>
            <p className="text-gray-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);