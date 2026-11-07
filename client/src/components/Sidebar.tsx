import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/appStore";
import { TbLayoutDashboard } from "react-icons/tb";
import { LuListTodo } from "react-icons/lu"
import { PiNotebookLight } from "react-icons/pi"
import { BsLightningChargeFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "@/types/user.ts";
import { IoIosLogOut } from "react-icons/io"

const features = [
  { name: "Dashboard", icon: <TbLayoutDashboard />, path: "/app/dashboard" },
  { name: "To-do List", icon: <LuListTodo />, path: "/app/tasks" },
  { name: "Notes", icon: <PiNotebookLight />, path: "/app/notes" },
  { name: "Assistant", icon: <BsLightningChargeFill />, path: "/app/assistant" },
];

const Sidebar = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const open = useAppStore((state) => state.sidebarOpen)
  const isDark = useAppStore((state) => state.isDark)

  const isActive = (path: string) => location.pathname === path;

  const userLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out failed:", error)
      setLogoutError("Unable to sign out. Please try again.")
      return
    }
    useAppStore.getState().setUser(null)
    navigate("/signin", { replace: true })
  }

  const openSidebar = () => (
    <motion.div
      className={`min-w-[260px] rounded-[18px] p-[8px] flex flex-col justify-between max-h-full ${isDark ? "bg-white/5 border-white/10" : "bg-white text-[#2d3748]"} backdrop-blur-md border rounded-2xl shadow-lg`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div>
        <div className="w-[150px] flex justify-center items-center mt-[10px]">
          <img
            src={isDark ? "/images/logo.png" : "/images/logo-dark.png"}
            className="size-[36px] m-auto logo-animation"
          />
          <h1 className="text-xl" style={{ fontFamily: '"Stint Ultra Expanded", serif' }}>
            SKALD
          </h1>
        </div>

        <ul className="px-[12px] mt-[18px]">
          {features.map((f) => (
            <li
              key={f.name}
              onClick={() => navigate(f.path)}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer text-[18px] my-[8px] border border-transparent ${isDark ? "hover:bg-[#0f111a5f" : "hover:bg-[#eae5f7]"} ${isActive(f.path) && isDark ? "bg-[#0f111a80]" : ""} ${isActive(f.path) && !isDark ? "bg-[#eae5f7] !border-black/30" : ""}`}
            >
              <span className="text-[24px]">{f.icon}</span>
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="group relative flex items-center rounded-[12px] p-[8px]"
      >
        <img
          className="size-[40px] rounded-[10px] mr-[12px]"
          src={user.photoURL || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
          onError={(e) => (e.currentTarget.src = "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png")}
          alt="profile-pic"
        />

        <div>
          <h6 className="text-[18px]">{user.displayName}</h6>
          <p className="mt-[-4px] text-[14px]">{user.email}</p>
        </div>

        <button
          type="button"
          aria-label="Sign out"
          onClick={userLogout}
          className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-[10px] border text-2xl opacity-0 backdrop-blur-md transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-indigo-300 ${isDark ? "border-white/20 bg-[#0f111acc] text-white/90" : "border-black/30 bg-white/90 text-black/80"}`}
        >
          <span className="pr-2 text-[18px]">Sign out</span>
          <IoIosLogOut aria-hidden="true" />
        </button>
      </div>
      {logoutError && <p role="alert" className="px-2 pb-2 text-xs text-red-300">{logoutError}</p>}
    </motion.div>
  );

  const closeSidebar = () => (
    <motion.div
      className={`rounded-[12px] flex flex-col justify-between backdrop-blur-md border shadow-xl ${isDark ? "bg-white/5 border-white/10" : "bg-white text-[#2d3748]"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center mt-[10px]">
          <img
            src={isDark ? "/images/logo.png" : "/images/logo-dark.png"}
            className="size-[28px] m-auto logo-animation mx-[16px] mt-[8px]"
          />
        </div>

        <ul className="mt-[18px]">
          {features.map((f) => (
            <li
              key={f.name}
              onClick={() => navigate(f.path)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer text-[18px] my-[10px] border border-transparent ${isDark ? "hover:bg-[#0f111a5f]" : "hover:bg-[#eae5f7]"} ${isActive(f.path) && isDark ? "bg-[#0f111a80]" : ""} ${isActive(f.path) && !isDark ? "bg-[#eae5f7] !border-black/30" : ""}`}
            >
              <span className="text-[18px]">{f.icon}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="group relative m-[6px] flex justify-center rounded-[12px] p-[6px]"
      >
        <img
          className="size-[36px] rounded-[10px]"
          src={user.photoURL || "https://i.pinimg.com/736x/3b/73/48/3b73483fa5af06e3ba35f4f71e541e7a.jpg"}
          onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/6596/6596121.png")}
          alt="profile-pic"
        />

        <button
          type="button"
          aria-label="Sign out"
          onClick={userLogout}
          className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-[10px] border text-2xl opacity-0 backdrop-blur-md transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-indigo-300 ${isDark ? "border-white/20 bg-[#0f111acc] text-white/90" : "border-black/30 bg-white/90 text-black/80"}`}
        >
          <IoIosLogOut aria-hidden="true" />
        </button>
      </div>
      {logoutError && <p role="alert" className="px-2 pb-2 text-xs text-red-300">{logoutError}</p>}
    </motion.div>
  );

  return open ? openSidebar() : closeSidebar();
};

export default Sidebar;
