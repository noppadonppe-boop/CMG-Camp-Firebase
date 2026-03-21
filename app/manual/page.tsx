"use client";

import { useState } from "react";
import { HardHat, Shield, Crown, FileText, Camera, CreditCard, ScanLine, Users, AlertTriangle, MonitorCheck, Building2, ClipboardList, LayoutDashboard, BedDouble, ChevronDown } from "lucide-react";

/* ─── Tab definitions ──────────────────────────────────────── */

const TABS = [
  {
    id: "workers",
    label: "สำหรับคนงาน",
    sublabel: "Workers",
    icon: HardHat,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    activeBg: "bg-blue-600",
    activeRing: "ring-blue-600",
  },
  {
    id: "security",
    label: "สำหรับ รปภ.",
    sublabel: "Security Guards",
    icon: Shield,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    activeBg: "bg-emerald-600",
    activeRing: "ring-emerald-600",
  },
  {
    id: "admin",
    label: "สำหรับ Camp Boss",
    sublabel: "Admin",
    icon: Crown,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    activeBg: "bg-violet-600",
    activeRing: "ring-violet-600",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─── Shared sub-components ────────────────────────────────── */

function Section({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <h3 className="text-base font-bold text-gray-800 leading-snug sm:text-sm">{title}</h3>
      </div>
      <div className="space-y-2 text-base leading-relaxed text-gray-700 sm:text-sm">{children}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
      <p className="flex-1 leading-relaxed">{children}</p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mt-0.5">{n}</span>
      <p className="flex-1 leading-relaxed">{children}</p>
    </div>
  );
}

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700 sm:text-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500 sm:h-4 sm:w-4" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-base text-blue-700 sm:text-sm">
      <MonitorCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500 sm:h-4 sm:w-4" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

/* ─── Tab Contents ──────────────────────────────────────────── */

function WorkersContent() {
  return (
    <div className="space-y-4 py-5">
      <Section icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-600" title="1. การเตรียมเอกสาร">
        <Bullet>
          เตรียม<strong>เอกสารตัวจริงและสำเนา</strong> ได้แก่ บัตรประชาชน หรือ พาสปอร์ต / Work Permit
        </Bullet>
        <Bullet>นำเอกสารมาติดต่อที่ <strong>สำนักงานแคมป์</strong> เพื่อลงทะเบียน</Bullet>
      </Section>

      <Section icon={Camera} iconBg="bg-blue-100" iconColor="text-blue-600" title="2. การถ่ายรูปและทำประวัติ">
        <Bullet>แจ้งชื่อ <strong>บริษัทผู้รับเหมาช่วง</strong> ที่สังกัดอยู่</Bullet>
        <Bullet>เจ้าหน้าที่จะ<strong>ถ่ายรูปและบันทึกข้อมูล</strong>ลงระบบ</Bullet>
      </Section>

      <Section icon={CreditCard} iconBg="bg-blue-100" iconColor="text-blue-600" title="3. การรับบัตรประจำตัว">
        <Bullet>
          จะได้รับ <strong>&quot;บัตรประจำตัวที่มี QR Code&quot;</strong> และ<strong>หมายเลขห้องพัก</strong>
        </Bullet>
        <Bullet>เก็บบัตรนี้ไว้ให้ดี ห้ามสูญหายหรือให้ผู้อื่นยืม</Bullet>
      </Section>

      <Section icon={ScanLine} iconBg="bg-blue-100" iconColor="text-blue-600" title="4. การสแกนเข้า-ออก">
        <Bullet>
          ทุกครั้งที่ <strong>เข้า-ออกประตูแคมป์</strong> ต้องนำบัตร QR Code มาให้ รปภ. สแกนเสมอ
        </Bullet>
        <AlertBox>
          หากลืมบัตรต้องแจ้ง รปภ. ทันที <strong>ห้ามเดินผ่านโดยพลการ</strong>
        </AlertBox>
      </Section>

      <Section icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" title="5. การรับแขก / ญาติ">
        <Bullet>ญาติมาเยี่ยมต้อง<strong>แลกบัตร ปชช. ที่ป้อม รปภ.</strong> ก่อนเข้าแคมป์</Bullet>
        <Bullet>เยี่ยมได้เฉพาะ<strong>พื้นที่ส่วนกลางตามเวลาที่กำหนด</strong></Bullet>
        <AlertBox>
          <strong>ห้ามพาคนนอกเข้าห้องพักเด็ดขาด</strong>
        </AlertBox>
      </Section>
    </div>
  );
}

function SecurityContent() {
  return (
    <div className="space-y-4 py-5">
      <InfoBox>
        <span><strong>เป้าหมายหลัก:</strong> ตรวจสอบคนเข้า-ออกให้ถูกต้อง 100%</span>
      </InfoBox>

      <Section icon={MonitorCheck} iconBg="bg-emerald-100" iconColor="text-emerald-600" title="1. การเข้าสู่ระบบ">
        <Bullet>ล็อกอินเข้าระบบด้วยบัญชีที่ได้รับ</Bullet>
        <Bullet>
          ตรวจสอบ<strong>มุมขวาบน</strong>ว่าเลือก <strong>&quot;ชื่อแคมป์&quot;</strong> ตรงกับที่ประจำการ
        </Bullet>
      </Section>

      <Section icon={ScanLine} iconBg="bg-emerald-100" iconColor="text-emerald-600" title="2. การสแกนคนงานเข้า-ออก">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">เข้า</span>
            <p>กดปุ่ม <strong>[🟢 สแกนเข้า]</strong> แล้วจ่อกล้องที่ QR Code บนบัตรคนงาน</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">ออก</span>
            <p>กดปุ่ม <strong>[🔴 สแกนออก]</strong> แล้วจ่อกล้องที่ QR Code บนบัตรคนงาน</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
            <p className="text-xs text-emerald-700"><strong>หน้าจอสีเขียว</strong> = ผ่านได้ (เทียบหน้าจริงกับรูปในระบบ)</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-red-500" />
            <p className="text-xs text-red-700"><strong>หน้าจอสีแดง</strong> = ห้ามผ่าน! อ่านสาเหตุและแจ้งหัวหน้า</p>
          </div>
        </div>
      </Section>

      <Section icon={Users} iconBg="bg-emerald-100" iconColor="text-emerald-600" title="3. การจัดการผู้มาติดต่อ">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">ขาเข้า</p>
        <div className="space-y-1.5">
          <Step n={1}>กดปุ่ม <strong>[📝 ลงทะเบียนผู้มาติดต่อ]</strong></Step>
          <Step n={2}>ถ่ายรูปบัตร ปชช. หรือทะเบียนรถ</Step>
          <Step n={3}>เลือก<strong>วัตถุประสงค์การเข้าเยี่ยม</strong></Step>
          <Step n={4}>แจก<strong>ป้าย Visitor</strong> ให้ผู้มาติดต่อ</Step>
          <Step n={5}>กด<strong>บันทึกเข้า</strong>ในระบบ</Step>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">ขาออก</p>
        <div className="space-y-1.5">
          <Step n={1}>ค้นหาชื่อในรายการผู้มาติดต่อที่ยังค้างอยู่</Step>
          <Step n={2}>กดปุ่ม <strong>[🚪 สแกนออก]</strong> ในแถวนั้น</Step>
          <Step n={3}><strong>เก็บป้าย Visitor คืน</strong></Step>
        </div>
        <div className="mt-3">
          <AlertBox>
            หากกรอบชื่อผู้มาติดต่อเป็น <strong>&quot;สีแดงกะพริบ&quot;</strong> แปลว่าอยู่เกินเวลา — แจ้ง Camp Boss ตรวจสอบทันที
          </AlertBox>
        </div>
      </Section>
    </div>
  );
}

function AdminContent() {
  return (
    <div className="space-y-4 py-5">
      <Section icon={Building2} iconBg="bg-violet-100" iconColor="text-violet-600" title="1. การสลับแคมป์">
        <Bullet>
          ใช้ <strong>Dropdown ด้านบนสุด</strong> (มุมขวาของ Navbar) เพื่อเลือกแคมป์ที่ต้องการจัดการ
        </Bullet>
        <Bullet>
          ข้อมูล<strong>ทั้งหน้าจอจะเปลี่ยนตามแคมป์</strong>ที่เลือกทันที
        </Bullet>
      </Section>

      <Section icon={ClipboardList} iconBg="bg-violet-100" iconColor="text-violet-600" title="2. การลงทะเบียนคนงานใหม่">
        <Bullet>ไปที่เมนู <strong>&quot;ลงทะเบียน&quot;</strong> ในแถบเมนูซ้าย</Bullet>
        <Bullet>กรอกข้อมูลให้ครบทุกช่อง ได้แก่</Bullet>
        <div className="ml-4 space-y-1">
          <Bullet>อัปโหลดรูปถ่ายหน้าตรง</Bullet>
          <Bullet>ข้อมูลส่วนตัว (ชื่อ สัญชาติ เบอร์โทร)</Bullet>
          <Bullet>สังกัดผู้รับเหมาช่วงและตำแหน่งงาน</Bullet>
          <Bullet>เลือกโซนและห้องว่างที่ต้องการ</Bullet>
        </div>
        <Bullet>กดปุ่ม <strong>&quot;บันทึก &amp; สร้าง QR Code&quot;</strong> เพื่อออก QR Code ให้คนงาน</Bullet>
      </Section>

      <Section icon={BedDouble} iconBg="bg-violet-100" iconColor="text-violet-600" title="3. การจัดผังห้องพัก">
        <Bullet>ไปที่เมนู <strong>&quot;จัดการห้องพัก&quot;</strong> เพื่อดูภาพรวมทุกห้องในแคมป์</Bullet>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { color: "bg-emerald-500", label: "เขียว", desc: "ว่าง" },
            { color: "bg-yellow-400", label: "เหลือง", desc: "มีเตียงว่าง" },
            { color: "bg-red-500", label: "แดง", desc: "เต็ม" },
            { color: "bg-gray-400", label: "เทา", desc: "ชำรุด" },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2">
              <span className={`h-3 w-3 shrink-0 rounded-sm ${color}`} />
              <span className="text-xs text-gray-700"><strong>{label}</strong> = {desc}</span>
            </div>
          ))}
        </div>
        <Bullet>คลิกที่การ์ดห้องเพื่อ<strong>ดูรายละเอียด เพิ่มคน หรือย้ายออก</strong></Bullet>
      </Section>

      <Section icon={Building2} iconBg="bg-violet-100" iconColor="text-violet-600" title="4. การจัดการแคมป์">
        <Bullet>ไปที่เมนู <strong>&quot;จัดการแคมป์&quot;</strong></Bullet>
        <Bullet>กดปุ่ม <strong>&quot;+ เพิ่มแคมป์ใหม่&quot;</strong> แล้วระบุ ชื่อ ที่ตั้ง และความจุสูงสุด</Bullet>
        <Bullet>กดปุ่ม <strong>ลบ</strong> เพื่อลบแคมป์ที่ปิดโครงการไปแล้วออกจากระบบ</Bullet>
      </Section>

      <Section icon={LayoutDashboard} iconBg="bg-violet-100" iconColor="text-violet-600" title="5. การดูรายงาน">
        <Bullet>ไปที่หน้า <strong>Dashboard</strong> เพื่อดูภาพรวมแบบ Real-time</Bullet>
        <div className="mt-2 space-y-1.5">
          <Bullet>ยอดคนงานทั้งหมดที่ลงทะเบียนในแคมป์</Bullet>
          <Bullet>ยอดคนที่อยู่ในแคมป์ขณะนั้น (Present)</Bullet>
          <Bullet>สถานะห้องพักว่างและห้องที่ใช้งานอยู่</Bullet>
          <Bullet>การแจ้งเตือนที่ต้องดำเนินการ (Active Alerts)</Bullet>
        </div>
      </Section>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

export default function ManualPage() {
  const [activeTab, setActiveTab] = useState<TabId>("workers");

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-snug text-gray-800 sm:text-3xl">
          คู่มือการใช้งานระบบ
          <span className="ml-2 text-xl font-normal text-gray-400 sm:text-2xl">
            (User Manual)
          </span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          เลือกหมวดหมู่ที่ตรงกับบทบาทของคุณเพื่ออ่านคำแนะนำการใช้งานระบบ
          <br className="hidden sm:block" />
          <span className="text-gray-400">
            Select the category that matches your role to read the usage guide.
          </span>
        </p>
      </div>

      {/* Tab Bar — dropdown on xs, button row on sm+ */}
      <div className="mb-6">
        {/* Mobile dropdown (hidden on sm+) */}
        <div className="relative sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabId)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-4 pr-10 text-base font-semibold text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TABS.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label} — {tab.sublabel}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Desktop button row (hidden on xs) */}
        <div className="hidden gap-2 sm:flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tab.activeRing} ${
                  isActive
                    ? `${tab.activeBg} border-transparent text-white shadow-md`
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive ? "bg-white/20" : tab.iconBg
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : tab.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-gray-800"}`}>
                    {tab.label}
                  </p>
                  <p className={`truncate text-xs ${isActive ? "text-white/70" : "text-gray-400"}`}>
                    {tab.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Card */}
      <div className="min-h-96 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${currentTab.iconBg}`}>
            <currentTab.icon className={`h-5 w-5 ${currentTab.iconColor}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 sm:text-sm">{currentTab.label}</h2>
            <p className="text-sm text-gray-400 sm:text-xs">{currentTab.sublabel}</p>
          </div>
        </div>

        {/* Content area */}
        <div className="px-4 py-2 sm:px-6">
          {activeTab === "workers" && <WorkersContent />}
          {activeTab === "security" && <SecurityContent />}
          {activeTab === "admin" && <AdminContent />}
        </div>
      </div>
    </div>
  );
}
