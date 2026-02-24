import { FeatureGrid } from "../../components/home/FeatureGrid";
import { Navbar } from "../../components/home/Navbar";
import { MainFooter } from "../../components/MainFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="grow">


        {/* 2. Why We Travel (Blob Section) */}
        <section className="relative py-16 sm:py-24 bg-[#f0f9ff] my-10 mx-4 lg:mx-auto max-w-7xl rounded-[2rem_0_2rem_0] overflow-hidden">
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/20 rounded-full"></div>

          <div className="relative z-10 px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">The Magic of the Journey</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We travel not to escape life, but for life not to escape us. Trip Buddy is here to remove the stress, so you can focus on the discovery.
              </p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Why Trip Buddy?</h3>
              <ul className="space-y-4">
                {[
                  { icon: "📍", text: "Detailed Trip Planning for every stop." },
                  { icon: "👥", text: "Find and connect with Travelers." },
                  { icon: "💰", text: "Effortless Group Expense Tracking." }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="text-xl">{item.icon}</span> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <FeatureGrid />

      </main>
      <MainFooter />
    </div>
  );
}