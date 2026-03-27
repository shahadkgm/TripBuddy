import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/c.authService";
import { FeatureGrid } from "../../components/home/FeatureGrid";
import { Navbar } from "../../components/home/Navbar";
import { MainFooter } from "../../components/MainFooter";
import Background from "../../components/home/Background";
import { motion } from "framer-motion";
import heroImage from "../../assets/hero-landscape.png";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "guide") {
        navigate("/guide-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [navigate]);
  return (
    <div className="min-h-screen flex flex-col relative">
      <Background />
      <Navbar />

      <main className="grow">


        {/* 2. Enhanced Hero / Globe Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text Content with Framer Motion */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black uppercase tracking-widest mb-4">
                
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
                The Magic of the <span className="text-indigo-600">Journey</span>
              </h1>
              <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-lg">
                We travel not to escape life, but for life not to escape us. Trip Buddy is here to remove the stress, so you can focus on the discovery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: "📍", title: "Smart Planning", desc: "Detailed stop-by-stop itineraries." },
                  { icon: "👥", title: "Traveler Network", desc: "Connect with like-minded buddies." },
                  { icon: "💰", title: "Expense Log", desc: "Real-time group splitting." },
                  { icon: "🌎", title: "Global Access", desc: "Guides." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-3xl mb-3 block group-hover:scale-125 transition-transform">{item.icon}</span>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* <div className="pt-8 flex gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                >
                  Start Planning Now
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Sign In
                </button>
              </div> */}
            </motion.div>

            {/* 3D Globe Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square lg:aspect-auto h-[600px] bg-indigo-50/30 rounded-[3rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border-8 border-white group"
            >
              <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-[2000ms] ease-out">
                <img 
                  src={heroImage} 
                  alt="Stunning Destination" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent opacity-60" />
              </div>

              <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  {/* <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> */}
                  {/* <span className="text-[10px] font-bold text-white uppercase tracking-widest">Global Network</span> */}
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-10">
                 <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 text-white">
                   <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Explore The World</p>
                   <h3 className="text-2xl font-black leading-none mb-1">Unforgettable Journeys</h3>
                   <p className="text-xs font-medium opacity-90">Find buddies for your next big adventure.</p>
                 </div>
              </div>
            </motion.div>

          </div>
        </section>
        <FeatureGrid />

      </main>
      <MainFooter />
    </div>
  );
}