import { useState } from "react";
import { Plus, Edit2, Trash2, Megaphone, Users, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { useAnnouncements } from "@/lib/db/useAnnouncements";
import { useAuth } from "@/context/AuthContext";
import type { Announcement } from "@/types/announcement";
import { USER_ROLES } from "@/types/auth";
import type { UserRole } from "@/types/auth";
import { useUsers } from "@/lib/db/useUsers";

export default function AnnouncementsAdminPage() {
  const { announcements, loading, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { userProfile } = useAuth();
  const { users } = useUsers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingAckFor, setViewingAckFor] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    targetRoles: UserRole[];
    status: "draft" | "published";
  }>({
    title: "",
    content: "",
    targetRoles: [],
    status: "draft",
  });

  const canManage = userProfile?.roles.some(r => ["MasterAdmin", "CampBoss", "Manager", "MD", "GM"].includes(r));

  if (!canManage) {
    return <div className="p-8 text-center text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", content: "", targetRoles: [], status: "draft" });
    setIsModalOpen(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({
      title: a.title,
      content: a.content,
      targetRoles: a.targetRoles,
      status: a.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("กรุณากรอกหัวข้อและเนื้อหา");

    try {
      if (editingId) {
        await updateAnnouncement(editingId, formData);
      } else {
        await addAnnouncement(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("แน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) {
      try {
        await deleteAnnouncement(id);
      } catch (err) {
        alert("ลบไม่สำเร็จ");
      }
    }
  };

  const toggleRole = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            จัดการประกาศ (What's new)
          </h1>
          <p className="text-gray-500 mt-1">สร้างและจัดการประกาศที่จะแสดงให้ผู้ใช้งานเห็น</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          สร้างประกาศใหม่
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">ยังไม่มีประกาศ</h3>
          <p className="text-gray-500 mt-1">คลิกปุ่ม "สร้างประกาศใหม่" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{a.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {a.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-line line-clamp-2 mb-3">{a.content}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    เป้าหมาย: {a.targetRoles.length > 0 ? a.targetRoles.join(", ") : "ทุกคน (All Roles)"}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    รับทราบแล้ว: {a.acknowledgedBy?.length || 0} คน
                    {a.acknowledgedBy && a.acknowledgedBy.length > 0 && (
                      <button 
                        onClick={() => setViewingAckFor(a)}
                        className="ml-1 text-blue-600 hover:underline cursor-pointer"
                      >
                        (ดูรายชื่อ)
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(a)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="แก้ไข"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อประกาศ *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="เช่น อัพเดทระบบใหม่ v1.2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหา *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="รายละเอียดการอัพเดท..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">กลุ่มเป้าหมาย (Roles)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {USER_ROLES.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          formData.targetRoles.includes(role)
                            ? 'bg-blue-100 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                    ถ้าไม่เลือกเลย (ว่างเปล่า) จะแปลว่า <span className="font-semibold text-blue-600">ทุกคนจะเห็นประกาศนี้</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as "draft" | "published"})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">ร่าง (Draft) - ยังไม่แสดงให้ผู้ใช้เห็น</option>
                    <option value="published">เผยแพร่ (Published) - แสดงให้ผู้ใช้เห็นทันที</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Acknowledged By Modal */}
      {viewingAckFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                ผู้ที่รับทราบประกาศนี้แล้ว
              </h2>
              <button onClick={() => setViewingAckFor(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {viewingAckFor.acknowledgedBy.map(uid => {
                  const user = users.find(u => u.uid === uid);
                  return (
                    <div key={uid} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.firstName} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {user ? user.firstName.charAt(0) : '?'}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {user ? `${user.firstName} ${user.lastName}` : 'ผู้ใช้ไม่ทราบชื่อ'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user ? user.roles.join(', ') : uid}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
