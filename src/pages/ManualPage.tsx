import { useState } from "react";
import { Users, Shield, Crown } from "lucide-react";

const TABS = [
  { id: "workers",  label: "คนงาน",    icon: Users  },
  { id: "security", label: "รปภ.",      icon: Shield },
  { id: "admin",    label: "Camp Boss", icon: Crown  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-base font-semibold text-gray-800">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <p className="flex items-start gap-2 text-sm text-gray-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{children}</p>;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{n}</span>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  );
}

function AlertBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{children}</div>;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{children}</div>;
}

function WorkersContent() {
  return (
    <div>
      <Section title="กฎระเบียบห้องพักและแคมป์">
        <Bullet>รักษาความสะอาดในห้องพักและพื้นที่ส่วนกลางเสมอ</Bullet>
        <Bullet>ห้ามนำอาหารหรือเครื่องดื่มมาบริโภคในห้องพัก</Bullet>
        <Bullet>ห้ามนำบุคคลภายนอกเข้าพักโดยไม่ได้รับอนุญาต</Bullet>
        <Bullet>ปิดไฟและอุปกรณ์ไฟฟ้าทุกครั้งเมื่อออกจากห้อง</Bullet>
        <Bullet>ห้ามต่อสายไฟหรือใช้อุปกรณ์ไฟฟ้าที่ไม่ได้รับอนุญาต</Bullet>
        <Bullet>ห้ามประกอบอาหารในห้องพัก</Bullet>
      </Section>
      <Section title="ขั้นตอนการเข้า-ออกแคมป์">
        <Step n={1}>แสดงบัตรประจำตัวหรือบัตรแคมป์ทุกครั้งที่ผ่านประตูรักษาความปลอดภัย</Step>
        <Step n={2}>บันทึกเวลาเข้า-ออกในระบบ หรือแจ้งต่อเจ้าหน้าที่ รปภ.</Step>
        <Step n={3}>หากมีผู้มาเยี่ยม ต้องแจ้ง รปภ. ก่อนอนุญาตให้เข้า</Step>
        <Step n={4}>ห้ามนำสิ่งของต้องห้ามเข้าแคมป์ (ยาเสพติด อาวุธ แอลกอฮอล์)</Step>
      </Section>
      <Section title="สิ่งของต้องห้ามในแคมป์">
        <AlertBox>🚫 ห้ามนำเข้าแคมป์โดยเด็ดขาด: ยาเสพติด อาวุธทุกชนิด เครื่องดื่มแอลกอฮอล์ สัตว์เลี้ยง</AlertBox>
      </Section>
      <Section title="ขั้นตอนการตรวจสุขอนามัย">
        <Bullet>การตรวจสุขอนามัยจะดำเนินการทุกสัปดาห์โดยเจ้าหน้าที่</Bullet>
        <Bullet>คนงานต้องทำความสะอาดห้องพักก่อนวันตรวจ</Bullet>
        <Bullet>หากห้องพักไม่ผ่านการตรวจ อาจมีค่าปรับตามระเบียบแคมป์</Bullet>
      </Section>
    </div>
  );
}

function SecurityContent() {
  return (
    <div>
      <Section title="ขั้นตอนการลงทะเบียนผู้เยี่ยม">
        <Step n={1}>ขอดูบัตรประชาชนหรือเอกสารยืนยันตัวตนของผู้เยี่ยม</Step>
        <Step n={2}>เปิดแอปพลิเคชัน → เมนู "ผู้มาติดต่อ" → กดปุ่ม "ลงทะเบียนเข้า"</Step>
        <Step n={3}>กรอกข้อมูล: ชื่อ-นามสกุล, เบอร์โทร, วัตถุประสงค์, คนงานที่มาเยี่ยม, ห้อง</Step>
        <Step n={4}>กด "ยืนยันเข้า" และให้ผู้เยี่ยมรอรับบัตรหรือสติ๊กเกอร์</Step>
        <Step n={5}>เมื่อผู้เยี่ยมออก ให้กด "ลงทะเบียนออก" ในรายการของผู้นั้น</Step>
      </Section>
      <Section title="สัญญาณเตือนและการแจ้งเหตุ">
        <AlertBox>⚠️ หากพบผู้มาติดต่อที่อยู่เกิน 4 ชั่วโมง ระบบจะแสดงสัญญาณเตือนสีแดง กรุณาตรวจสอบทันที</AlertBox>
        <Bullet>แจ้ง Camp Boss ทันทีหากพบสถานการณ์ผิดปกติ</Bullet>
        <Bullet>บันทึกเหตุการณ์ทุกครั้งในสมุดรายงาน รปภ.</Bullet>
      </Section>
      <Section title="การตรวจตราแคมป์">
        <Bullet>ตรวจตราพื้นที่ส่วนกลางทุก 2 ชั่วโมง</Bullet>
        <Bullet>ตรวจสอบกล้องวงจรปิดทุกกะ</Bullet>
        <Bullet>รายงานกล้องที่ผิดปกติต่อ Camp Boss ทันที</Bullet>
      </Section>
    </div>
  );
}

function AdminContent() {
  return (
    <div>
      <Section title="การจัดการข้อมูลแคมป์">
        <InfoBox>📊 Dashboard แสดงภาพรวมแคมป์แบบ real-time รวมถึงสถิติคนงาน, ห้องพัก, และการแจ้งเตือน</InfoBox>
        <Bullet>เพิ่ม/แก้ไขข้อมูลแคมป์ได้ที่เมนู "จัดการแคมป์"</Bullet>
        <Bullet>เพิ่ม/แก้ไขโซนและห้องพักได้ที่เมนู "ห้องพัก"</Bullet>
        <Bullet>ดูและจัดการข้อมูลแรงงานได้ที่เมนู "ลงทะเบียน"</Bullet>
      </Section>
      <Section title="การตรวจสุขอนามัย">
        <Step n={1}>ไปที่เมนู "สุขอนามัย" → "ตรวจสอบ"</Step>
        <Step n={2}>เลือกห้องพักที่ต้องการตรวจ</Step>
        <Step n={3}>กรอก Checklist สุขอนามัยทีละรายการ (ผ่าน / ไม่ผ่าน / ไม่เกี่ยวข้อง)</Step>
        <Step n={4}>หากรายการไม่ผ่าน สามารถถ่ายภาพหลักฐานและกรอกหมายเหตุได้</Step>
        <Step n={5}>กด "บันทึกผลการตรวจ" — ระบบจะสร้าง Penalty โดยอัตโนมัติหากไม่ผ่านตั้งแต่ 2 รายการ</Step>
      </Section>
      <Section title="การจัดการฐานข้อมูล (Development)">
        <AlertBox>⚠️ เมนู "Seed DB" ใช้สำหรับ development เท่านั้น การรัน Seed จะเขียนทับข้อมูลเดิมทั้งหมด</AlertBox>
      </Section>
    </div>
  );
}

export default function ManualPage() {
  const [activeTab, setActiveTab] = useState("workers");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">คู่มือการใช้งาน <span className="text-lg font-normal text-gray-400">User Manual</span></h1>
        <p className="mt-1 text-sm text-gray-500">คู่มือสำหรับผู้ใช้งานแต่ละบทบาทในระบบ CMG Camp Manager</p>
      </div>
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === id ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {activeTab === "workers"  && <WorkersContent />}
        {activeTab === "security" && <SecurityContent />}
        {activeTab === "admin"    && <AdminContent />}
      </div>
    </div>
  );
}
