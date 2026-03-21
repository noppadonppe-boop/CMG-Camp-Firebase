import { Home, Building2, UserPlus, DoorOpen, Users, ShieldCheck, CreditCard, UserCog, BookOpen } from "lucide-react";

interface StepProps {
  n: number;
  children: React.ReactNode;
}

function Step({ n, children }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
        {n}
      </span>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  );
}

interface BulletProps {
  children: React.ReactNode;
}

function Bullet({ children }: BulletProps) {
  return (
    <p className="flex items-start gap-2 text-sm text-gray-600">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      {children}
    </p>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-base font-semibold text-gray-800">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

interface InfoBoxProps {
  children: React.ReactNode;
}

function InfoBox({ children }: InfoBoxProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      {children}
    </div>
  );
}

interface AlertBoxProps {
  children: React.ReactNode;
}

function AlertBox({ children }: AlertBoxProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {children}
    </div>
  );
}

interface SuccessBoxProps {
  children: React.ReactNode;
}

function SuccessBox({ children }: SuccessBoxProps) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      {children}
    </div>
  );
}

interface MenuCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  requiredRoles: string;
  children: React.ReactNode;
}

function MenuCard({ icon: Icon, title, description, requiredRoles, children }: MenuCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-blue-600 p-2.5">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
          <p className="mt-1 text-xs text-gray-400">
            <strong>สิทธิ์การเข้าถึง:</strong> {requiredRoles}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function MenuGuides() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-800">คู่มือการใช้งานแต่ละเมนู</h2>
        <p className="text-sm text-gray-500">ขั้นตอนการใช้งานแต่ละเมนูใน Sidebar อย่างละเอียด</p>
      </div>

      <div className="space-y-5">
        {/* Dashboard */}
        <MenuCard
          icon={Home}
          title="📊 Dashboard (หน้าหลัก)"
          description="ภาพรวมของแคมป์แบบ Real-time"
          requiredRoles="ทุก Role"
        >
          <Section title="ข้อมูลที่แสดง">
            <Bullet><strong>สถิติคนงาน:</strong> จำนวนคนงานทั้งหมด, คนงานที่พักอยู่</Bullet>
            <Bullet><strong>สถิติห้องพัก:</strong> ห้องว่าง, ห้องที่มีคนพัก, อัตราการเข้าพัก</Bullet>
            <Bullet><strong>การแจ้งเตือน:</strong> ห้องที่ไม่ผ่านการตรวจสุขอนามัย, ค่าปรับค้างชำระ</Bullet>
            <Bullet><strong>ผู้มาติดต่อ:</strong> รายการผู้มาติดต่อที่อยู่ในแคมป์ปัจจุบัน</Bullet>
          </Section>

          <Section title="วิธีใช้งาน">
            <Step n={1}>เมื่อเข้าสู่ระบบ จะเห็นหน้า Dashboard ทันที</Step>
            <Step n={2}>ดูสถิติภาพรวมจากการ์ดด้านบน (คนงาน, ห้องพัก, การแจ้งเตือน)</Step>
            <Step n={3}>ตรวจสอบการแจ้งเตือนสำคัญ (ถ้ามี) ในส่วน Alerts</Step>
            <Step n={4}>ดูรายการผู้มาติดต่อที่อยู่ในแคมป์ปัจจุบัน</Step>
          </Section>

          <InfoBox>
            💡 <strong>เคล็ดลับ:</strong> Dashboard จะอัพเดทแบบ Real-time เมื่อมีการเปลี่ยนแปลงข้อมูล
          </InfoBox>
        </MenuCard>

        {/* จัดการแคมป์ */}
        <MenuCard
          icon={Building2}
          title="🏕️ จัดการแคมป์"
          description="เพิ่ม แก้ไข ลบข้อมูลแคมป์"
          requiredRoles="MasterAdmin, MD, GM, CampBoss, Manager"
        >
          <Section title="การเพิ่มแคมป์ใหม่">
            <Step n={1}>คลิกเมนู "จัดการแคมป์" ที่ Sidebar</Step>
            <Step n={2}>คลิกปุ่ม "+ เพิ่มแคมป์" ด้านบน</Step>
            <Step n={3}>กรอกข้อมูล: ชื่อแคมป์, ที่อยู่, จำนวนห้องพัก, ราคาห้องต่อเดือน</Step>
            <Step n={4}>คลิก "บันทึก" เพื่อสร้างแคมป์ใหม่</Step>
          </Section>

          <Section title="การแก้ไขข้อมูลแคมป์">
            <Step n={1}>คลิกที่การ์ดแคมป์ที่ต้องการแก้ไข</Step>
            <Step n={2}>คลิกปุ่ม "แก้ไข" (ไอคอนดินสอ)</Step>
            <Step n={3}>แก้ไขข้อมูลที่ต้องการ</Step>
            <Step n={4}>คลิก "บันทึก" เพื่อยืนยันการแก้ไข</Step>
          </Section>

          <Section title="การลบแคมป์">
            <Step n={1}>คลิกที่การ์ดแคมป์ที่ต้องการลบ</Step>
            <Step n={2}>คลิกปุ่ม "ลบ" (ไอคอนถังขยะ)</Step>
            <Step n={3}>ยืนยันการลบ (ข้อมูลจะถูกลบถาวร)</Step>
          </Section>

          <AlertBox>
            ⚠️ <strong>คำเตือน:</strong> การลบแคมป์จะลบข้อมูลห้องพัก โซน และข้อมูลที่เกี่ยวข้องทั้งหมด
          </AlertBox>
        </MenuCard>

        {/* ลงทะเบียนคนงาน */}
        <MenuCard
          icon={UserPlus}
          title="👷 ลงทะเบียนคนงาน"
          description="จัดการข้อมูลคนงานที่เข้าพักในแคมป์"
          requiredRoles="ทุก Role (แต่สิทธิ์แตกต่างกัน)"
        >
          <Section title="การลงทะเบียนคนงานใหม่">
            <Step n={1}>คลิกเมนู "ลงทะเบียน" ที่ Sidebar</Step>
            <Step n={2}>คลิกปุ่ม "+ ลงทะเบียนคนงาน"</Step>
            <Step n={3}>กรอกข้อมูลส่วนตัว: ชื่อ-นามสกุล, เลขบัตรประชาชน, เบอร์โทร</Step>
            <Step n={4}>กรอกข้อมูลการทำงาน: บริษัท, ตำแหน่ง, เงินเดือน</Step>
            <Step n={5}>เลือกห้องพักที่จะเข้าพัก (ถ้ามี)</Step>
            <Step n={6}>คลิก "บันทึก" เพื่อลงทะเบียน</Step>
          </Section>

          <Section title="การแก้ไขข้อมูลคนงาน">
            <Step n={1}>ค้นหาคนงานจากรายการ (ใช้ช่องค้นหา)</Step>
            <Step n={2}>คลิกที่รายการคนงานที่ต้องการแก้ไข</Step>
            <Step n={3}>คลิกปุ่ม "แก้ไข"</Step>
            <Step n={4}>แก้ไขข้อมูลที่ต้องการ</Step>
            <Step n={5}>คลิก "บันทึก"</Step>
          </Section>

          <Section title="การย้ายห้องพัก">
            <Step n={1}>เปิดข้อมูลคนงานที่ต้องการย้ายห้อง</Step>
            <Step n={2}>คลิก "แก้ไข"</Step>
            <Step n={3}>เลือกห้องพักใหม่จาก dropdown</Step>
            <Step n={4}>คลิก "บันทึก" (ระบบจะอัพเดทข้อมูลห้องเดิมและห้องใหม่อัตโนมัติ)</Step>
          </Section>

          <Section title="การลบข้อมูลคนงาน">
            <InfoBox>
              <strong>สิทธิ์:</strong> MasterAdmin, MD, GM, HrManager, CampBoss, Manager เท่านั้น
            </InfoBox>
            <Step n={1}>เปิดข้อมูลคนงานที่ต้องการลบ</Step>
            <Step n={2}>คลิกปุ่ม "ลบ"</Step>
            <Step n={3}>ยืนยันการลบ</Step>
          </Section>

          <SuccessBox>
            ✅ <strong>ข้อมูลที่บันทึก:</strong> ข้อมูลส่วนตัว, ข้อมูลการทำงาน, ห้องพัก, วันที่เข้า-ออก
          </SuccessBox>
        </MenuCard>

        {/* ห้องพัก */}
        <MenuCard
          icon={DoorOpen}
          title="🚪 ห้องพัก"
          description="จัดการห้องพัก โซน และข้อมูลที่เกี่ยวข้อง"
          requiredRoles="MasterAdmin, MD, GM, CampBoss, Manager"
        >
          <Section title="การเพิ่มโซนใหม่">
            <Step n={1}>คลิกเมนู "ห้องพัก" ที่ Sidebar</Step>
            <Step n={2}>คลิกแท็บ "โซน"</Step>
            <Step n={3}>คลิกปุ่ม "+ เพิ่มโซน"</Step>
            <Step n={4}>กรอกข้อมูล: ชื่อโซน, คำอธิบาย</Step>
            <Step n={5}>คลิก "บันทึก"</Step>
          </Section>

          <Section title="การเพิ่มห้องพักใหม่">
            <Step n={1}>คลิกแท็บ "ห้องพัก"</Step>
            <Step n={2}>คลิกปุ่ม "+ เพิ่มห้องพัก"</Step>
            <Step n={3}>กรอกข้อมูล: เลขห้อง, โซน, ความจุ (จำนวนคนสูงสุด)</Step>
            <Step n={4}>เลือกสถานะห้อง: ว่าง / มีคนพัก / ปิดปรับปรุง</Step>
            <Step n={5}>คลิก "บันทึก"</Step>
          </Section>

          <Section title="การดูรายละเอียดห้องพัก">
            <Step n={1}>คลิกที่การ์ดห้องพักที่ต้องการดู</Step>
            <Step n={2}>ดูข้อมูล: เลขห้อง, โซน, ความจุ, จำนวนคนพักปัจจุบัน</Step>
            <Step n={3}>ดูรายชื่อคนงานที่พักในห้องนี้</Step>
            <Step n={4}>ดูประวัติการตรวจสุขอนามัย (ถ้ามี)</Step>
          </Section>

          <Section title="การแก้ไขห้องพัก">
            <Step n={1}>คลิกที่ห้องพักที่ต้องการแก้ไข</Step>
            <Step n={2}>คลิกปุ่ม "แก้ไข"</Step>
            <Step n={3}>แก้ไขข้อมูลที่ต้องการ (เลขห้อง, โซน, ความจุ, สถานะ)</Step>
            <Step n={4}>คลิก "บันทึก"</Step>
          </Section>

          <InfoBox>
            💡 <strong>สีของการ์ดห้องพัก:</strong><br />
            • เขียว = ห้องว่าง<br />
            • น้ำเงิน = มีคนพัก<br />
            • เทา = ปิดปรับปรุง<br />
            • แดง = เต็ม (เกินความจุ)
          </InfoBox>
        </MenuCard>

        {/* ผู้มาติดต่อ */}
        <MenuCard
          icon={Users}
          title="👥 ผู้มาติดต่อ"
          description="ลงทะเบียนและติดตามผู้มาเยี่ยมแคมป์"
          requiredRoles="MasterAdmin, MD, GM, HrManager, CampBoss, Manager, Security"
        >
          <Section title="การลงทะเบียนผู้เยี่ยมเข้า">
            <Step n={1}>คลิกเมนู "ผู้มาติดต่อ" ที่ Sidebar</Step>
            <Step n={2}>คลิกปุ่ม "+ ลงทะเบียนเข้า"</Step>
            <Step n={3}>ขอดูบัตรประชาชนของผู้เยี่ยม</Step>
            <Step n={4}>กรอกข้อมูล: ชื่อ-นามสกุล, เลขบัตรประชาชน, เบอร์โทร</Step>
            <Step n={5}>กรอกวัตถุประสงค์การเยี่ยม</Step>
            <Step n={6}>เลือกคนงานที่มาเยี่ยม และห้องพัก</Step>
            <Step n={7}>คลิก "ยืนยันเข้า" (ระบบจะบันทึกเวลาเข้าอัตโนมัติ)</Step>
          </Section>

          <Section title="การลงทะเบียนผู้เยี่ยมออก">
            <Step n={1}>ค้นหาผู้เยี่ยมจากรายการ "กำลังอยู่ในแคมป์"</Step>
            <Step n={2}>คลิกที่รายการผู้เยี่ยมที่ต้องการลงทะเบียนออก</Step>
            <Step n={3}>คลิกปุ่ม "ลงทะเบียนออก"</Step>
            <Step n={4}>ระบบจะบันทึกเวลาออกและคำนวณระยะเวลาที่อยู่อัตโนมัติ</Step>
          </Section>

          <Section title="การตรวจสอบผู้เยี่ยมที่อยู่นาน">
            <AlertBox>
              ⚠️ <strong>สัญญาณเตือน:</strong> ผู้เยี่ยมที่อยู่เกิน 4 ชั่วโมงจะแสดงสีแดง กรุณาตรวจสอบทันที
            </AlertBox>
            <Step n={1}>ดูรายการ "กำลังอยู่ในแคมป์"</Step>
            <Step n={2}>สังเกตการ์ดที่มีสีแดง (อยู่เกิน 4 ชม.)</Step>
            <Step n={3}>ติดต่อคนงานที่เกี่ยวข้องเพื่อยืนยัน</Step>
            <Step n={4}>ลงทะเบียนออกหรือรายงานต่อ CampBoss</Step>
          </Section>

          <Section title="การดูประวัติผู้เยี่ยม">
            <Step n={1}>คลิกแท็บ "ประวัติทั้งหมด"</Step>
            <Step n={2}>ใช้ช่องค้นหาเพื่อค้นหาผู้เยี่ยม</Step>
            <Step n={3}>ดูข้อมูล: วันที่เข้า-ออก, ระยะเวลา, คนงานที่มาเยี่ยม</Step>
          </Section>

          <SuccessBox>
            ✅ <strong>ข้อมูลที่บันทึก:</strong> ข้อมูลผู้เยี่ยม, เวลาเข้า-ออก, ระยะเวลา, วัตถุประสงค์, คนงานที่เยี่ยม
          </SuccessBox>
        </MenuCard>

        {/* สุขอนามัย */}
        <MenuCard
          icon={ShieldCheck}
          title="🧹 สุขอนามัย"
          description="ตรวจสอบความสะอาดห้องพักและบันทึกผล"
          requiredRoles="MasterAdmin, MD, GM, CampBoss, Manager, Inspector"
        >
          <Section title="การตรวจสุขอนามัย">
            <Step n={1}>คลิกเมนู "สุขอนามัย" → "ตรวจสอบ"</Step>
            <Step n={2}>เลือกแคมป์ที่ต้องการตรวจ</Step>
            <Step n={3}>เลือกห้องพักที่ต้องการตรวจ</Step>
            <Step n={4}>กรอก Checklist ทีละรายการ:</Step>
            <div className="ml-8 space-y-1">
              <Bullet><strong>ผ่าน (Pass):</strong> รายการนี้ผ่านเกณฑ์</Bullet>
              <Bullet><strong>ไม่ผ่าน (Fail):</strong> รายการนี้ไม่ผ่าน (ต้องถ่ายภาพหลักฐาน)</Bullet>
              <Bullet><strong>ไม่เกี่ยวข้อง (N/A):</strong> รายการนี้ไม่มีในห้องนี้</Bullet>
            </div>
            <Step n={5}>หากรายการไม่ผ่าน: ถ่ายภาพหลักฐาน และกรอกหมายเหตุ</Step>
            <Step n={6}>กรอกหมายเหตุทั่วไป (ถ้ามี)</Step>
            <Step n={7}>ตรวจสอบความครบถ้วน (Progress Bar จะแสดง 100%)</Step>
            <Step n={8}>คลิก "บันทึกผลการตรวจ"</Step>
          </Section>

          <Section title="ระบบคำนวณผลอัตโนมัติ">
            <InfoBox>
              📊 <strong>เกณฑ์การประเมิน:</strong><br />
              • <strong>ผ่าน:</strong> ไม่ผ่าน 0-1 รายการ<br />
              • <strong>เฝ้าระวัง:</strong> ไม่ผ่าน 2-3 รายการ<br />
              • <strong>ไม่ผ่าน:</strong> ไม่ผ่าน 4 รายการขึ้นไป
            </InfoBox>
          </Section>

          <Section title="ค่าปรับอัตโนมัติ">
            <AlertBox>
              💰 <strong>ระบบค่าปรับ:</strong> หากห้องไม่ผ่านการตรวจ (ไม่ผ่าน 2 รายการขึ้นไป) 
              ระบบจะสร้างค่าปรับอัตโนมัติในเมนู "การเงิน" → "ค่าปรับ"
            </AlertBox>
          </Section>

          <Section title="การดูประวัติการตรวจ">
            <Step n={1}>คลิกเมนู "สุขอนามัย" → "ประวัติ"</Step>
            <Step n={2}>เลือกแคมป์ที่ต้องการดู</Step>
            <Step n={3}>ใช้ Filter เพื่อกรองตามสถานะ: ทั้งหมด / ผ่าน / เฝ้าระวัง / ไม่ผ่าน</Step>
            <Step n={4}>คลิกที่รายการเพื่อดูรายละเอียดและภาพถ่าย</Step>
          </Section>

          <SuccessBox>
            ✅ <strong>ข้อมูลที่บันทึก:</strong> ผลการตรวจแต่ละรายการ, ภาพถ่ายหลักฐาน, หมายเหตุ, 
            ผลรวม, วันที่ตรวจ, ผู้ตรวจ
          </SuccessBox>
        </MenuCard>

        {/* การเงิน */}
        <MenuCard
          icon={CreditCard}
          title="💰 การเงิน"
          description="จัดการบิล มิเตอร์ Invoice และค่าปรับ"
          requiredRoles="MasterAdmin, MD, GM, CampBoss, Manager, Accountant"
        >
          <Section title="การจัดการบิล (Billing)">
            <Step n={1}>คลิกเมนู "การเงิน"</Step>
            <Step n={2}>ดูรายการบิลทั้งหมด (ค่าห้อง, ค่าน้ำ, ค่าไฟ)</Step>
            <Step n={3}>คลิก "+ สร้างบิล" เพื่อสร้างบิลใหม่</Step>
            <Step n={4}>เลือกห้องพัก, ประเภทบิล, จำนวนเงิน, วันครบกำหนด</Step>
            <Step n={5}>คลิก "บันทึก"</Step>
          </Section>

          <Section title="การบันทึกค่ามิเตอร์">
            <Step n={1}>คลิกเมนู "การเงิน" → "มิเตอร์"</Step>
            <Step n={2}>คลิก "+ บันทึกค่ามิเตอร์"</Step>
            <Step n={3}>เลือกห้องพัก</Step>
            <Step n={4}>กรอกค่ามิเตอร์ไฟฟ้า (หน่วย)</Step>
            <Step n={5}>กรอกค่ามิเตอร์น้ำ (ลูกบาศก์เมตร)</Step>
            <Step n={6}>ระบบจะคำนวณค่าใช้จ่ายอัตโนมัติตามอัตราที่กำหนด</Step>
            <Step n={7}>คลิก "บันทึก"</Step>
          </Section>

          <Section title="การสร้าง Invoice">
            <Step n={1}>คลิกเมนู "การเงิน" → "Invoice"</Step>
            <Step n={2}>คลิก "+ สร้าง Invoice"</Step>
            <Step n={3}>เลือกห้องพัก และเดือนที่ต้องการออก Invoice</Step>
            <Step n={4}>ระบบจะรวมรายการอัตโนมัติ:</Step>
            <div className="ml-8 space-y-1">
              <Bullet>ค่าห้องพัก (รายเดือน)</Bullet>
              <Bullet>ค่าไฟฟ้า (จากค่ามิเตอร์)</Bullet>
              <Bullet>ค่าน้ำ (จากค่ามิเตอร์)</Bullet>
              <Bullet>ค่าปรับ (ถ้ามี)</Bullet>
            </div>
            <Step n={5}>ตรวจสอบรายการและยอดรวม</Step>
            <Step n={6}>คลิก "สร้าง Invoice"</Step>
            <Step n={7}>พิมพ์หรือส่ง Invoice ให้คนงาน</Step>
          </Section>

          <Section title="การจัดการค่าปรับ">
            <InfoBox>
              💡 <strong>ค่าปรับอัตโนมัติ:</strong> เมื่อห้องไม่ผ่านการตรวจสุขอนามัย 
              ระบบจะสร้างค่าปรับอัตโนมัติ
            </InfoBox>
            <Step n={1}>คลิกเมนู "การเงิน" → "ค่าปรับ"</Step>
            <Step n={2}>ดูรายการค่าปรับทั้งหมด</Step>
            <Step n={3}>คลิกที่รายการเพื่อดูรายละเอียด (สาเหตุ, ภาพถ่าย)</Step>
            <Step n={4}>เปลี่ยนสถานะ: รอชำระ / ชำระแล้ว / ยกเลิก</Step>
          </Section>

          <AlertBox>
            ⚠️ <strong>สิทธิ์การแก้ไข:</strong> เฉพาะ MasterAdmin, MD, GM, CampBoss, Accountant 
            เท่านั้นที่แก้ไขข้อมูลการเงินได้
          </AlertBox>
        </MenuCard>

        {/* จัดการผู้ใช้ */}
        <MenuCard
          icon={UserCog}
          title="👤 จัดการผู้ใช้"
          description="อนุมัติผู้ใช้ใหม่และจัดการสิทธิ์"
          requiredRoles="MasterAdmin, MD, GM, HrManager, CampBoss, Manager"
        >
          <Section title="การอนุมัติผู้ใช้ใหม่">
            <Step n={1}>คลิกเมนู "จัดการผู้ใช้" (ไอคอน User ที่ Sidebar)</Step>
            <Step n={2}>คลิกแท็บ "รอการอนุมัติ" เพื่อดูผู้ใช้ที่รออนุมัติ</Step>
            <Step n={3}>ตรวจสอบข้อมูลผู้ใช้: ชื่อ, อีเมล, ตำแหน่ง</Step>
            <Step n={4}>คลิกปุ่ม "อนุมัติ" เพื่ออนุมัติ หรือ "ปฏิเสธ" เพื่อปฏิเสธ</Step>
            <Step n={5}>ผู้ใช้ที่อนุมัติจะสามารถเข้าสู่ระบบได้ทันที</Step>
          </Section>

          <Section title="การแก้ไขสิทธิ์ผู้ใช้">
            <Step n={1}>คลิกแท็บ "ผู้ใช้ที่อนุมัติแล้ว"</Step>
            <Step n={2}>ค้นหาผู้ใช้ที่ต้องการแก้ไขสิทธิ์</Step>
            <Step n={3}>คลิกปุ่ม "แก้ไข" ที่รายการผู้ใช้</Step>
            <Step n={4}>เลือก Role ที่ต้องการให้ผู้ใช้ (สามารถเลือกได้หลาย Role)</Step>
            <Step n={5}>คลิก "บันทึก"</Step>
          </Section>

          <Section title="ลำดับชั้นการมอบสิทธิ์">
            <AlertBox>
              🔐 <strong>กฎการมอบสิทธิ์:</strong><br />
              • เฉพาะ <strong>MasterAdmin</strong> มอบสิทธิ์ MasterAdmin ได้<br />
              • เฉพาะ <strong>MD ขึ้นไป</strong> มอบสิทธิ์ MD ได้<br />
              • เฉพาะ <strong>GM ขึ้นไป</strong> มอบสิทธิ์ GM ได้<br />
              • เฉพาะ <strong>CampBoss ขึ้นไป</strong> มอบสิทธิ์ CampBoss ได้
            </AlertBox>
          </Section>

          <Section title="การลบผู้ใช้">
            <InfoBox>
              <strong>สิทธิ์:</strong> เฉพาะ MasterAdmin เท่านั้นที่สามารถลบผู้ใช้ได้
            </InfoBox>
            <Step n={1}>เปิดรายการผู้ใช้ที่ต้องการลบ</Step>
            <Step n={2}>คลิกปุ่ม "ลบ"</Step>
            <Step n={3}>ยืนยันการลบ (ข้อมูลจะถูกลบถาวร)</Step>
          </Section>

          <AlertBox>
            ⚠️ <strong>ข้อจำกัด:</strong> ไม่สามารถลบผู้ใช้แรก (First User) ได้ เพื่อป้องกันการสูญเสียการเข้าถึงระบบ
          </AlertBox>
        </MenuCard>

        {/* คู่มือ */}
        <MenuCard
          icon={BookOpen}
          title="📖 คู่มือการใช้งาน"
          description="คู่มือและเอกสารประกอบ"
          requiredRoles="ทุก Role"
        >
          <Section title="เนื้อหาในคู่มือ">
            <Bullet><strong>บทบาทและสิทธิ์:</strong> รายละเอียดของแต่ละ Role</Bullet>
            <Bullet><strong>คู่มือการใช้งาน:</strong> ขั้นตอนการใช้งานแต่ละเมนู</Bullet>
            <Bullet><strong>Workflows:</strong> ขั้นตอนการทำงานทั่วไป</Bullet>
            <Bullet><strong>คำถามที่พบบ่อย (FAQ):</strong> คำตอบสำหรับคำถามทั่วไป</Bullet>
          </Section>

          <Section title="วิธีใช้คู่มือ">
            <Step n={1}>คลิกเมนู "คู่มือ" ที่ Sidebar</Step>
            <Step n={2}>เลือกหัวข้อที่ต้องการจากแท็บด้านบน</Step>
            <Step n={3}>อ่านรายละเอียดและทำตามขั้นตอน</Step>
            <Step n={4}>ใช้ช่องค้นหา (ถ้ามี) เพื่อค้นหาหัวข้อที่ต้องการ</Step>
          </Section>

          <SuccessBox>
            💡 <strong>เคล็ดลับ:</strong> บุ๊กมาร์กหน้าคู่มือไว้เพื่อเข้าถึงได้ง่ายเมื่อต้องการความช่วยเหลือ
          </SuccessBox>
        </MenuCard>
      </div>
    </div>
  );
}
