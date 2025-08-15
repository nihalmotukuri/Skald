import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { TbLayoutDashboard } from "react-icons/tb";
import { VscTasklist } from "react-icons/vsc";
import { SlNotebook } from "react-icons/sl";
import { BsLightningChargeFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "@/types/user.ts";

const features = [
  { name: "Dashboard", icon: <TbLayoutDashboard />, path: "/app/dashboard" },
  { name: "To-do List", icon: <VscTasklist />, path: "/app/tasks" },
  { name: "Notes", icon: <SlNotebook />, path: "/app/notes" },
  { name: "Assistant", icon: <BsLightningChargeFill />, path: "/app/assistant" },
];

const Sidebar = ({ user }: {user: User}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const open = useSelector((store: RootState) => store.sidebarStore.value);
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const isActive = (path: string) => location.pathname === path;

  const openSidebar = () => (
    <motion.div
      className={`min-w-[260px] rounded-[18px] p-[8px] flex flex-col justify-between max-h-full ${isDark ? "bg-white/5 border-white/10" : "bg-white text-[#2d3748]"} backdrop-blur-md border rounded-2xl shadow-2xl`}
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
              className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer text-[18px] my-[8px] border border-transparent ${isDark ? "hover:bg-[#0f111a5f" : "hover:bg-[#eae5f7]" } ${isActive(f.path) && isDark ? "bg-[#0f111a80]" : ""} ${isActive(f.path) && !isDark ? "bg-neutral-100 border" : ""}`}
            >
              <span className="text-[24px]">{f.icon}</span>
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center hover:bg-[#0f111a5f] p-[8px] rounded-[12px] cursor-pointer">
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
      </div>
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
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer text-[18px] my-[10px] ${isDark ? "hover:bg-[#0f111a5f]" : "hover:bg-[#eae5f7]" } ${isActive(f.path) && isDark ? "bg-[#0f111a80]" : ""} ${isActive(f.path) && !isDark ? "bg-[#eae5f7]" : ""}`}
            >
              <span className="text-[18px]">{f.icon}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center hover:bg-[#0f111a5f] p-[6px] m-[6px] rounded-[12px] cursor-pointer">
        <img
          className="size-[36px] rounded-[10px]"
          src={user.photoURL || "https://i.pinimg.com/736x/3b/73/48/3b73483fa5af06e3ba35f4f71e541e7a.jpg"}
          onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/6596/6596121.png")}
          alt="profile-pic"
        />
      </div>
    </motion.div>
  );

  return open ? openSidebar() : closeSidebar();
};

export default Sidebar;
