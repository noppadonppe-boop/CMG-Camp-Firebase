import { useState } from "react";
import { UserCog, BookOpen, Workflow } from "lucide-react";
import RoleDescriptions from "@/components/manual/RoleDescriptions";
import MenuGuides from "@/components/manual/MenuGuides";
import Workflows from "@/components/manual/Workflows";

const TABS = [
  { id: "roles",     label: "บทบาทและสิทธิ์", icon: UserCog  },
  { id: "menus",     label: "คู่มือเมนู",      icon: BookOpen },
  { id: "workflows", label: "Workflows",      icon: Workflow },
];


export default function ManualPage() {
  const [activeTab, setActiveTab] = useState("roles");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">คู่มือการใช้งาน <span className="text-lg font-normal text-gray-400">User Manual</span></h1>
        <p className="mt-1 text-sm text-gray-500">คู่มือครบวงจรสำหรับผู้ใช้งานทุกบทบาทในระบบ CMG Camp Manager</p>
      </div>
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button 
            key={id} 
            onClick={() => setActiveTab(id)} 
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === id 
                ? "bg-white text-gray-800 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {activeTab === "roles" && <RoleDescriptions />}
        {activeTab === "menus" && <MenuGuides />}
        {activeTab === "workflows" && <Workflows />}
      </div>
    </div>
  );
}
