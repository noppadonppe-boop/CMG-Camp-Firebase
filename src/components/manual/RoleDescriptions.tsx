import { Shield, Crown, Users, Briefcase, Calculator, ClipboardCheck, UserCheck, User } from "lucide-react";

interface RoleCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  permissions: string[];
  restrictions?: string[];
  color: string;
}

function RoleCard({ icon: Icon, title, subtitle, permissions, restrictions, color }: RoleCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className={`rounded-lg ${color} p-2.5`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">✅ สิทธิ์และความสามารถ:</h4>
        <ul className="space-y-1.5">
          {permissions.map((perm, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
              {perm}
            </li>
          ))}
        </ul>
      </div>
      
      {restrictions && restrictions.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700">❌ ข้อจำกัด:</h4>
          <ul className="space-y-1.5">
            {restrictions.map((rest, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {rest}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function RoleDescriptions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-800">บทบาทและสิทธิ์ในระบบ</h2>
        <p className="text-sm text-gray-500">รายละเอียดของแต่ละ Role พร้อมสิทธิ์การเข้าถึงและความสามารถ</p>
      </div>

      <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-purple-900">
          <Crown className="h-5 w-5" />
          ลำดับชั้นของ Role
        </h3>
        <pre className="text-xs text-purple-800">
{`MasterAdmin (ผู้ดูแลระบบสูงสุด)
├── MD (Managing Director)
│   ├── GM (General Manager)
│   │   ├── HrManager (HR Manager)
│   │   └── CampBoss (Camp Boss)
│   │       └── Manager
│   │           ├── Accountant
│   │           ├── Inspector
│   │           ├── Security
│   │           └── Staff`}
        </pre>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <RoleCard
          icon={Crown}
          title="MasterAdmin"
          subtitle="ผู้ดูแลระบบสูงสุด - อำนาจเต็ม"
          color="bg-purple-600"
          permissions={[
            "จัดการได้ทุกอย่างในระบบ - ไม่มีข้อจำกัด",
            "มอบสิทธิ์ MasterAdmin ให้ผู้อื่นได้",
            "ลบผู้ใช้ได้ (เป็น role เดียวที่ลบได้)",
            "เข้าถึงทุกเมนู ทุกฟังก์ชัน",
            "ดู Activity Logs ทั้งหมด",
            "จัดการแคมป์, ห้องพัก, โซน",
            "จัดการคนงาน, ผู้มาติดต่อ",
            "ตรวจสุขอนามัย",
            "จัดการบิล, มิเตอร์, Invoice, ค่าปรับ",
          ]}
        />

        <RoleCard
          icon={Briefcase}
          title="MD (Managing Director)"
          subtitle="กรรมการผู้จัดการ - ผู้บริหารสูงสุด"
          color="bg-indigo-600"
          permissions={[
            "จัดการได้เกือบทุกอย่าง",
            "มอบสิทธิ์ MD, GM, CampBoss ได้",
            "อนุมัติ/ปฏิเสธผู้ใช้ใหม่",
            "แก้ไขสิทธิ์ผู้ใช้",
            "จัดการแคมป์, ห้องพัก, คนงาน",
            "ตรวจสุขอนามัย",
            "จัดการบิลและการเงินทั้งหมด",
            "ดู Activity Logs",
          ]}
          restrictions={[
            "ไม่สามารถมอบสิทธิ์ MasterAdmin",
            "ไม่สามารถลบผู้ใช้",
          ]}
        />

        <RoleCard
          icon={Briefcase}
          title="GM (General Manager)"
          subtitle="ผู้จัดการทั่วไป - บริหารระดับสูง"
          color="bg-blue-600"
          permissions={[
            "มอบสิทธิ์ GM, CampBoss และระดับล่างได้",
            "อนุมัติ/ปฏิเสธผู้ใช้ใหม่",
            "แก้ไขสิทธิ์ผู้ใช้ (ยกเว้น MD, MasterAdmin)",
            "จัดการแคมป์, ห้องพัก, คนงาน",
            "ตรวจสุขอนามัย",
            "จัดการบิลและการเงิน",
            "ดู Activity Logs",
          ]}
          restrictions={[
            "ไม่สามารถมอบสิทธิ์ MasterAdmin, MD",
            "ไม่สามารถลบผู้ใช้",
          ]}
        />

        <RoleCard
          icon={Users}
          title="HrManager"
          subtitle="ผู้จัดการฝ่าย HR - ดูแลบุคลากร"
          color="bg-teal-600"
          permissions={[
            "อนุมัติ/ปฏิเสธผู้ใช้ใหม่",
            "แก้ไขสิทธิ์ผู้ใช้ (ยกเว้นผู้บริหาร)",
            "จัดการข้อมูลคนงาน (ลงทะเบียน, แก้ไข, ลบ)",
            "จัดการผู้มาติดต่อ",
            "ดูประวัติการตรวจสุขอนามัย",
            "ดู Activity Logs",
          ]}
          restrictions={[
            "ไม่สามารถจัดการแคมป์, ห้องพัก",
            "ไม่สามารถตรวจสุขอนามัย",
            "ไม่สามารถดูข้อมูลบิล/การเงิน",
            "ไม่สามารถมอบสิทธิ์ MD, GM",
          ]}
        />

        <RoleCard
          icon={Shield}
          title="CampBoss"
          subtitle="เจ้าของ/ผู้จัดการแคมป์ - ควบคุมแคมป์"
          color="bg-orange-600"
          permissions={[
            "อนุมัติ/ปฏิเสธผู้ใช้ใหม่",
            "จัดการแคมป์, ห้องพัก, โซน",
            "จัดการคนงาน (ลงทะเบียน, แก้ไข, ลบ)",
            "จัดการผู้มาติดต่อ",
            "ตรวจสุขอนามัย",
            "จัดการบิล, มิเตอร์, ค่าปรับ",
            "ดู Activity Logs",
          ]}
          restrictions={[
            "ไม่สามารถมอบสิทธิ์ผู้บริหารระดับสูง",
          ]}
        />

        <RoleCard
          icon={UserCheck}
          title="Manager"
          subtitle="ผู้ช่วยผู้จัดการ - จัดการข้อมูล"
          color="bg-cyan-600"
          permissions={[
            "อนุมัติ/ปฏิเสธผู้ใช้ใหม่",
            "จัดการแคมป์, ห้องพัก",
            "จัดการคนงาน (แก้ไข, ลบ)",
            "จัดการผู้มาติดต่อ",
            "ตรวจสุขอนามัย",
            "ดูข้อมูลบิล (แต่ไม่สามารถแก้ไข)",
            "ดู Activity Logs",
          ]}
          restrictions={[
            "ไม่สามารถแก้ไขสิทธิ์ผู้ใช้",
            "ไม่สามารถแก้ไขบิล/การเงิน",
          ]}
        />

        <RoleCard
          icon={Calculator}
          title="Accountant"
          subtitle="เจ้าหน้าที่การเงิน - จัดการบิล"
          color="bg-green-600"
          permissions={[
            "จัดการบิล, มิเตอร์, ค่าปรับ",
            "สร้างและแก้ไข Invoice",
            "ดูประวัติการตรวจสุขอนามัย (เพื่อคำนวณค่าปรับ)",
            "ดูข้อมูลห้องพักและคนงาน",
          ]}
          restrictions={[
            "ไม่สามารถแก้ไขข้อมูลห้องพักหรือคนงาน",
            "ไม่สามารถตรวจสุขอนามัย",
            "ไม่สามารถจัดการผู้ใช้",
          ]}
        />

        <RoleCard
          icon={ClipboardCheck}
          title="Inspector"
          subtitle="เจ้าหน้าที่ตรวจสุขอนามัย"
          color="bg-emerald-600"
          permissions={[
            "ตรวจสุขอนามัยห้องพัก",
            "ดูประวัติการตรวจสุขอนามัย",
            "ดูข้อมูลห้องพักและคนงาน",
            "ถ่ายภาพหลักฐานและกรอกหมายเหตุ",
          ]}
          restrictions={[
            "ไม่สามารถดูข้อมูลบิล/การเงิน",
            "ไม่สามารถจัดการผู้มาติดต่อ",
            "ไม่สามารถแก้ไขข้อมูลห้องพัก",
          ]}
        />

        <RoleCard
          icon={Shield}
          title="Security"
          subtitle="รปภ. - รักษาความปลอดภัย"
          color="bg-slate-600"
          permissions={[
            "ลงทะเบียนผู้มาติดต่อเข้า-ออก",
            "ดูรายการผู้มาติดต่อ",
            "ดูข้อมูลห้องพักและคนงาน",
            "ตรวจตราและรายงานเหตุการณ์",
          ]}
          restrictions={[
            "ไม่สามารถแก้ไขข้อมูลห้องพักหรือคนงาน",
            "ไม่สามารถตรวจสุขอนามัย",
            "ไม่สามารถดูข้อมูลบิล/การเงิน",
          ]}
        />

        <RoleCard
          icon={User}
          title="Staff"
          subtitle="พนักงานทั่วไป - ดูข้อมูล"
          color="bg-gray-600"
          permissions={[
            "ดูข้อมูลทั่วไป (Dashboard, ห้องพัก, คนงาน)",
            "ลงทะเบียนคนงานใหม่",
            "ดูประวัติการตรวจสุขอนามัย",
            "ดูคู่มือการใช้งาน",
          ]}
          restrictions={[
            "ไม่สามารถแก้ไขหรือลบข้อมูลคนงาน",
            "ไม่สามารถจัดการห้องพักหรือแคมป์",
            "ไม่สามารถดูข้อมูลบิล/การเงิน",
            "ไม่สามารถจัดการผู้ใช้",
          ]}
        />
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-2 text-sm font-bold text-amber-900">⚠️ หมายเหตุสำคัญ</h3>
        <ul className="space-y-1 text-sm text-amber-800">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
            ผู้ใช้แรกในระบบจะได้รับ role <strong>CampBoss</strong> และสถานะ <strong>approved</strong> อัตโนมัติ
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
            ผู้ใช้ใหม่ทุกคนจะได้รับ role <strong>Staff</strong> และสถานะ <strong>pending</strong> (รอการอนุมัติ)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
            การมอบสิทธิ์มีลำดับชั้น: เฉพาะ MasterAdmin มอบสิทธิ์ MasterAdmin ได้, เฉพาะ MD+ มอบสิทธิ์ MD ได้
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
            เฉพาะ MasterAdmin เท่านั้นที่สามารถลบผู้ใช้ได้
          </li>
        </ul>
      </div>
    </div>
  );
}
