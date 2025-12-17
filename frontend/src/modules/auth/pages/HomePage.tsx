import { Navbar } from "../components/home/Navbar";
import { Hero } from "../components/home/Hero";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="grow">
        <Hero />

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

        {/* 3. CTA Section */}
        <section className="bg-[#5537ee] py-16 text-center text-white mt-10">
          <h3 className="text-3xl font-bold mb-4">Ready for Your Next Adventure?</h3>
          <button className="px-10 py-4 bg-white text-[#5537ee] font-bold rounded-xl hover:bg-gray-100 transition shadow-xl">
            Plan Your First Trip Now
          </button>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-8 text-center">
        <p>&copy; 2025 Trip Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
}