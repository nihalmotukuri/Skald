import { useSelector } from "react-redux";
import { TbLayoutDashboard } from "react-icons/tb";
import { VscTasklist } from "react-icons/vsc";
import { SlNotebook } from "react-icons/sl";
import { BsLightningChargeFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const features = [
  { name: "Dashboard", icon: <TbLayoutDashboard />, path: "/app/dashboard" },
  { name: "To-do List", icon: <VscTasklist />, path: "/app/tasks" },
  { name: "Notes", icon: <SlNotebook />, path: "/app/notes" },
  { name: "Assistant", icon: <BsLightningChargeFill />, path: "/app/assistant" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  interface RootState {
    sidebarStore: {
      value: boolean;
    };
  }

  const open = useSelector((store: RootState) => store.sidebarStore.value);

  const isActive = (path: string) => location.pathname === path;

  const openSidebar = () => (
    <motion.div
      className="min-w-[260px] rounded-[18px] p-[8px] flex flex-col justify-between max-h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}  
      
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div>
        <div className="w-[150px] flex justify-center items-center mt-[10px]">
          <img
            src="/images/logo.png"
            className="size-[36px] m-auto logo-animation"
          />
          <h1
            className="text-xl"
            style={{ fontFamily: '"Stint Ultra Expanded", serif' }}
          >
            SKALD
          </h1>
        </div>

        <ul className="px-[12px] mt-[18px]">
          {features.map((f) => (
            <li
              key={f.name}
              onClick={() => navigate(f.path)}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer text-[18px] my-[8px] hover:bg-[#0f111a5f] ${isActive(f.path) ? "bg-[#0f111a80]" : ""
                }`}
            >
              <span className="text-[24px]">{f.icon}</span>
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center hover:bg-[#0f111a5f] p-[8px] rounded-[12px] cursor-pointer">
        <img
          className="size-[40px] rounded-[10px] mr-[8px]"
          src="https://i.pinimg.com/736x/3b/73/48/3b73483fa5af06e3ba35f4f71e541e7a.jpg"
          alt="profile-pic"
        />
        <div>
          <h6 className="text-[18px]">sourish</h6>
          <p className="mt-[-4px] text-[14px]">sourish@example.com</p>
        </div>
      </div>
    </motion.div>
  );

  const closeSidebar = () => (
    <motion.div
      className="rounded-[12px] flex flex-col justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center mt-[10px]">
          <img
            src="/images/logo.png"
            className="size-[28px] m-auto logo-animation mx-[16px] mt-[8px]"
          />
        </div>

        <ul className="mt-[18px]">
          {features.map((f) => (
            <li
              key={f.name}
              onClick={() => navigate(f.path)}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer text-[18px] my-[10px] hover:bg-[#0f111a5f] ${isActive(f.path) ? "bg-[#0f111a80]" : ""
                }`}
            >
              <span className="text-[18px]">{f.icon}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center hover:bg-[#0f111a5f] p-[6px] m-[6px] rounded-[12px] cursor-pointer">
        <img
          className="size-[28px] rounded-[6px]"
          src="https://i.pinimg.com/736x/3b/73/48/3b73483fa5af06e3ba35f4f71e541e7a.jpg"
          alt="profile-pic"
        />
      </div>
    </motion.div>
  );

  return open ? openSidebar() : closeSidebar();
};

export default Sidebar;
