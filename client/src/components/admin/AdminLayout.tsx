import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Map, MessageSquare, 
  Image, Settings, Menu, X, ShieldCheck ,LogOut
} from 'lucide-react';
export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate=useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user")
    navigate("/login",{replace:true})
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Users', path: "/admin/users", icon: <Users size={20} /> },
    { name: 'Manage Guides', path: "/admin/guides", icon: <ShieldCheck size={20} /> },
    { name: 'Manage Trips', path: '/admin/trips', icon: <Map size={20} /> },
    { name: 'Groups & Chat', path: '/admin/chats', icon: <MessageSquare size={20} /> },
    { name: 'Posts', path: '/admin/posts', icon: <Image size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* 📌 SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#111827] text-white p-6 shadow-2xl transition-transform duration-300
        lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#5537ee]">
            Travel <span className="text-white">Admin</span>
          </h2>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition duration-200 ${
                location.pathname === item.path 
                ? 'bg-[#5537ee] text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 📌 MAIN CONTENT */}
      <div className="flex-1 lg:ml-65 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white p-4 lg:p-6 shadow-sm flex justify-between items-center m-5 lg:m-8 rounded-2xl">
          <div className="flex items-center">
            <button className="lg:hidden mr-4 text-gray-700 hover:text-[#5537ee]" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={28} />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-[#1e293b]">Dashboard Overview</h1>
          </div>
          <div className="flex items-center gap-4">
  <div className="hidden sm:block text-sm text-gray-500 bg-[#f0f9ff] py-1.5 px-4 rounded-full">
    Admin: <span className="font-semibold text-[#5537ee]">Shahad</span> | Role: <span className="font-medium">Super Admin</span>
  </div>

  <button
    onClick={handleLogout}
    className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition font-medium"
  >
    <LogOut size={18} />
    Logout
  </button>
</div>

        </header>

        {/* Page Content */}
        <main className="px-5 lg:px-8 pb-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};