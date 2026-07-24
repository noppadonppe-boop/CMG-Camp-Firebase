import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";
import { useAnnouncements } from "@/lib/db/useAnnouncements";
import { useAuth } from "@/context/AuthContext";
import type { Announcement } from "@/types/announcement";

export default function AnnouncementPopup() {
  const { announcements, loading, acknowledgeAnnouncement } = useAnnouncements();
  const { userProfile } = useAuth();
  
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  
  useEffect(() => {
    if (loading || !userProfile || !announcements) return;

    // Find the first announcement that:
    // 1. is published
    // 2. targets one of the user's roles (or targetRoles is empty)
    // 3. hasn't been acknowledged by this user
    // 4. hasn't been hidden for today

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const pending = announcements.find(a => {
      if (a.status !== "published") return false;
      
      const roleMatch = a.targetRoles.length === 0 || a.targetRoles.some(r => userProfile.roles.includes(r));
      if (!roleMatch) return false;

      const acknowledged = a.acknowledgedBy?.includes(userProfile.uid);
      if (acknowledged) return false;

      const hiddenDate = localStorage.getItem(`hide_announcement_${a.id}`);
      if (hiddenDate === today) return false;

      return true;
    });

    setActiveAnnouncement(pending || null);
  }, [announcements, loading, userProfile]);

  if (!activeAnnouncement || !userProfile) return null;

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAnnouncement(activeAnnouncement.id, userProfile.uid);
      setActiveAnnouncement(null);
    } catch (err) {
      console.error("Failed to acknowledge", err);
    }
  };

  const handleHideForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`hide_announcement_${activeAnnouncement.id}`, today);
    setActiveAnnouncement(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-full">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">ประกาศระบบ</h2>
          </div>
          <button 
            onClick={handleHideForToday}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-lg transition"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{activeAnnouncement.title}</h3>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line mb-8 leading-relaxed">
            {activeAnnouncement.content}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
            <button
              onClick={handleHideForToday}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium text-sm"
            >
              ไม่แสดงอีกวันนี้
            </button>
            <button
              onClick={handleAcknowledge}
              className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 rounded-xl transition font-medium text-sm"
            >
              รับทราบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
