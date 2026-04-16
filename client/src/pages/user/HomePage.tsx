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

      <main className="grow mt-16 lg:mt-24">


        {/* 2. Enhanced Hero / Globe Section */}
        <section className="relative py-12 lg:py-20 px-4 md:px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Text Content with Framer Motion */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4 lg:space-y-8"
            >
              <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest mb-2 lg:mb-4">
                Your Adventure Starts Here
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
                The Magic of the <span className="text-indigo-600">Journey</span>
              </h1>
              <p className="text-slate-500 text-base md:text-xl font-medium leading-relaxed max-w-lg">
                We travel not to escape life, but for life not to escape us. Trip Buddy is here to remove the stress.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2 lg:pt-4">
                {[
                  { icon: "📍", title: "Smart Planning", desc: "Detailed stop-by-stop itineraries." },
                  { icon: "👥", title: "Traveler Network", desc: "Connect with like-minded buddies." },
                  { icon: "💰", title: "Expense Log", desc: "Real-time group splitting." },
                  { icon: "🌎", title: "Global Access", desc: "Guides." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="p-3 lg:p-4 bg-white rounded-xl lg:rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-xl md:text-3xl mb-1 lg:mb-3 block group-hover:scale-125 transition-transform">{item.icon}</span>
                    <h4 className="font-bold text-slate-800 text-[10px] md:text-sm mb-0.5 lg:mb-1">{item.title}</h4>
                    <p className="text-[9px] md:text-xs text-slate-500 line-clamp-2">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative w-full aspect-[4/3] lg:aspect-auto h-[300px] sm:h-[450px] lg:h-[600px] bg-indigo-50/30 rounded-2xl lg:rounded-[3rem] shadow-xl shadow-indigo-100/50 overflow-hidden border-2 lg:border-8 border-white group"
            >
              <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-[2000ms] ease-out">
                <img 
                  src={heroImage} 
                  alt="Stunning Destination" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent opacity-60" />
              </div>

              <div className="absolute top-4 lg:top-8 left-4 lg:left-8 z-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                </div>
              </div>

              <div className="absolute bottom-4 lg:bottom-8 left-4 lg:left-8 right-4 lg:right-8 z-10">
                 <div className="bg-white/20 backdrop-blur-md p-4 lg:p-6 rounded-xl lg:rounded-3xl border border-white/30 text-white">
                   <p className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest mb-0.5 lg:mb-1 opacity-80">Explore The World</p>
                   <h3 className="text-base lg:text-2xl font-black leading-none mb-0.5 lg:mb-1">Unforgettable Journeys</h3>
                   <p className="text-[10px] lg:text-xs font-medium opacity-90">Find buddies for your next big adventure.</p>
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