// import React from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   MapPin,
//   Calendar,
//   IndianRupee,
//   Plane,
//   Hotel,
//   User,
//   FileText,
//   ArrowLeft
// } from "lucide-react";

// const TripDetailsPage = () => {
//   const navigate = useNavigate();

//   // 🔥 Dummy Trip Data
//   const trip = {
//     title: "Summer Escape 2026",
//     destination: "Goa, India",
//     startDate: "2026-05-10",
//     endDate: "2026-05-15",
//     budget: 25000,
//     description: "Beach relaxation, water sports and amazing seafood.",
//     preferences: {
//       travelers: 4,
//       accommodation: "Hotel",
//       transport: "Flight",
//       interests: ["Beaches", "Adventure Sports", "Food & Dining"]
//     }
//   };

//   // 🔥 Dummy Members
//   const members = [
//     { name: "Shahad", role: "Trip Organizer" },
//     { name: "Ameen", role: "Member" },
//     { name: "Fathima", role: "Member" },
//     { name: "Rahul", role: "Member" }
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50 py-10 px-6">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

//         {/* LEFT SIDE - Trip Details */}
//         <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8 border border-slate-100">

//           <button
//             onClick={() => navigate("/dashboard")}
//             className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600"
//           >
//             <ArrowLeft size={18} /> Back
//           </button>

//           <h1 className="text-4xl font-bold text-indigo-700 mb-6">
//             {trip.title}
//           </h1>

//           {/* Destination */}
//           <div className="flex items-center gap-3 text-slate-600 mb-4">
//             <MapPin className="text-indigo-500" />
//             <span className="text-lg font-semibold">{trip.destination}</span>
//           </div>

//           {/* Dates */}
//           <div className="flex items-center gap-3 text-slate-600 mb-4">
//             <Calendar className="text-indigo-500" />
//             <span>
//               {trip.startDate} → {trip.endDate}
//             </span>
//           </div>

//           {/* Budget */}
//           <div className="flex items-center gap-3 text-slate-600 mb-4">
//             <IndianRupee className="text-indigo-500" />
//             <span>₹ {trip.budget}</span>
//           </div>

//           {/* Preferences Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

//             <div className="bg-slate-50 p-6 rounded-2xl">
//               <div className="flex items-center gap-2 mb-2">
//                 <User className="text-indigo-500" />
//                 <span className="font-semibold">Travelers</span>
//               </div>
//               <p>{trip.preferences.travelers}</p>
//             </div>

//             <div className="bg-slate-50 p-6 rounded-2xl">
//               <div className="flex items-center gap-2 mb-2">
//                 <Plane className="text-indigo-500" />
//                 <span className="font-semibold">Transport</span>
//               </div>
//               <p>{trip.preferences.transport}</p>
//             </div>

//             <div className="bg-slate-50 p-6 rounded-2xl">
//               <div className="flex items-center gap-2 mb-2">
//                 <Hotel className="text-indigo-500" />
//                 <span className="font-semibold">Accommodation</span>
//               </div>
//               <p>{trip.preferences.accommodation}</p>
//             </div>

//           </div>

//           {/* Interests */}
//           <div className="mt-8">
//             <h3 className="text-xl font-bold mb-4">Interests</h3>
//             <div className="flex flex-wrap gap-3">
//               {trip.preferences.interests.map((interest) => (
//                 <span
//                   key={interest}
//                   className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
//                 >
//                   {interest}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="mt-8">
//             <div className="flex items-center gap-2 mb-3">
//               <FileText className="text-indigo-500" />
//               <h3 className="text-xl font-bold">Notes</h3>
//             </div>
//             <p className="text-slate-600">{trip.description}</p>
//           </div>
//         </div>

//         {/* RIGHT SIDE - Trip Members Column */}
//         <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
//           <h2 className="text-2xl font-bold text-indigo-700 mb-6">
//             Trip Members
//           </h2>

//           <div className="space-y-4">
//             {members.map((member, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"
//               >
//                 <div>
//                   <p className="font-semibold text-slate-800">
//                     {member.name}
//                   </p>
//                   <p className="text-sm text-slate-500">
//                     {member.role}
//                   </p>
//                 </div>

//                 <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
//                   {member.name.charAt(0)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default TripDetailsPage;