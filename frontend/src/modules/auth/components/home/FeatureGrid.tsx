// src/components/home/FeatureGrid.tsx
const FEATURES = [
  { title: "Create a Trip Plan", desc: "Build day-by-day itineraries easily.", icon: "M9 5H7a2 2 0 00-2 2v12..." },
  // ... add all your features here
];

export const FeatureGrid = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      {FEATURES.map((f, i) => (
        <div key={i} className="p-6 bg-sky-50 rounded-xl border border-sky-100 hover:shadow-lg transition-all">
          <h4 className="text-xl font-bold mb-2">{f.title}</h4>
          <p className="text-gray-600">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);