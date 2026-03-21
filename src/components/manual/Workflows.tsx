import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

interface StepProps {
  n: number;
  children: React.ReactNode;
  role?: string;
}

function Step({ n, children, role }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
        {n}
      </span>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{children}</p>
        {role && (
          <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            👤 {role}
          </span>
        )}
      </div>
    </div>
  );
}

interface WorkflowCardProps {
  title: string;
  description: string;
  difficulty: "ง่าย" | "ปานกลาง" | "ยาก";
  estimatedTime: string;
  children: React.ReactNode;
}

function WorkflowCard({ title, description, difficulty, estimatedTime, children }: WorkflowCardProps) {
  const difficultyColors = {
    "ง่าย": "bg-green-100 text-green-700",
    "ปานกลาง": "bg-yellow-100 text-yellow-700",
    "ยาก": "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <div className="mt-3 flex gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
            ⏱️ {estimatedTime}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-5">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">{title}</h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

interface TipBoxProps {
  children: React.ReactNode;
}

function TipBox({ children }: TipBoxProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

interface WarningBoxProps {
  children: React.ReactNode;
}

function WarningBox({ children }: WarningBoxProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export default function Workflows() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-800">Workflows - ขั้นตอนการทำงาน</h2>
        <p className="text-sm text-gray-500">ขั้นตอนการทำงานทั่วไปที่ใช้บ่อยในระบบ CMG Camp Manager</p>
      </div>

      <div className="space-y-5">
        {/* Workflow 1: เริ่มต้นใช้งานระบบ */}
        <WorkflowCard
          title="🚀 เริ่มต้นใช้งานระบบครั้งแรก"
          description="สำหรับผู้ดูแลระบบที่ต้องการตั้งค่าระบบใหม่"
          difficulty="ปานกลาง"
          estimatedTime="30-45 นาที"
        >
          <Section title="ขั้นตอน">
            <Step n={1} role="ผู้ดูแลระบบ">
              ลงทะเบียนผู้ใช้แรก (จะได้ role CampBoss อัตโนมัติ)
            </Step>
            <Step n={2} role="CampBoss">
              เข้าสู่ระบบด้วยบัญชีที่ลงทะเบียน
            </Step>
            <Step n={3} role="CampBoss">
              ไปที่เมนู "จัดการแคมป์" → สร้างแคมป์แรก (กรอก: ชื่อ, ที่อยู่, จำนวนห้อง, ราคา)
            </Step>
            <Step n={4} role="CampBoss">
              ไปที่เมนู "ห้องพัก" → สร้างโซนต่างๆ (เช่น โซน A, B, C)
            </Step>
            <Step n={5} role="CampBoss">
              สร้างห้องพักในแต่ละโซน (กรอก: เลขห้อง, โซน, ความจุ)
            </Step>
            <Step n={6} role="CampBoss">
              ไปที่เมนู "จัดการผู้ใช้" → เชิญเพื่อนร่วมงานให้ลงทะเบียน
            </Step>
            <Step n={7} role="CampBoss">
              อนุมัติผู้ใช้ใหม่และมอบสิทธิ์ตาม role ที่เหมาะสม
            </Step>
            <Step n={8} role="CampBoss">
              เริ่มลงทะเบียนคนงานเข้าพักในห้องต่างๆ
            </Step>
          </Section>

          <TipBox>
            <strong>💡 เคล็ดลับ:</strong> ควรสร้างโครงสร้างแคมป์ (แคมป์, โซน, ห้องพัก) ให้เรียบร้อยก่อน
            แล้วค่อยเชิญผู้ใช้อื่นเข้ามาช่วยงาน
          </TipBox>
        </WorkflowCard>

        {/* Workflow 2: รับคนงานเข้าพักใหม่ */}
        <WorkflowCard
          title="👷 รับคนงานเข้าพักใหม่"
          description="ขั้นตอนการลงทะเบียนคนงานใหม่และจัดห้องพัก"
          difficulty="ง่าย"
          estimatedTime="5-10 นาที"
        >
          <Section title="ขั้นตอน">
            <Step n={1} role="Staff / Manager">
              รับข้อมูลจากคนงาน: บัตรประชาชน, เบอร์โทร, ข้อมูลบริษัท
            </Step>
            <Step n={2} role="Staff / Manager">
              ไปที่เมนู "ลงทะเบียน" → คลิก "+ ลงทะเบียนคนงาน"
            </Step>
            <Step n={3} role="Staff / Manager">
              กรอกข้อมูลส่วนตัว: ชื่อ-นามสกุล, เลขบัตร, เบอร์โทร
            </Step>
            <Step n={4} role="Staff / Manager">
              กรอกข้อมูลการทำงาน: บริษัท, ตำแหน่ง, เงินเดือน
            </Step>
            <Step n={5} role="Manager">
              ตรวจสอบห้องว่างที่เมนู "ห้องพัก"
            </Step>
            <Step n={6} role="Manager">
              กลับมาที่หน้าลงทะเบียน → เลือกห้องพักที่เหมาะสม
            </Step>
            <Step n={7} role="Manager">
              คลิก "บันทึก" → ระบบจะอัพเดทสถานะห้องอัตโนมัติ
            </Step>
            <Step n={8} role="Manager">
              แจ้งเลขห้องและกฎระเบียบให้คนงานทราบ
            </Step>
          </Section>

          <TipBox>
            <strong>✅ ตรวจสอบ:</strong> ห้องที่เลือกต้องไม่เต็ม (จำนวนคนพัก &lt; ความจุ) 
            และสถานะเป็น "ว่าง" หรือ "มีคนพัก"
          </TipBox>

          <WarningBox>
            <strong>⚠️ ข้อควรระวัง:</strong> ห้ามให้คนงานพักเกินความจุที่กำหนด เพื่อความปลอดภัย
          </WarningBox>
        </WorkflowCard>

        {/* Workflow 3: ตรวจสุขอนามัยรายสัปดาห์ */}
        <WorkflowCard
          title="🧹 ตรวจสุขอนามัยรายสัปดาห์"
          description="ขั้นตอนการตรวจสุขอนามัยห้องพักอย่างเป็นระบบ"
          difficulty="ปานกลาง"
          estimatedTime="15-20 นาที/ห้อง"
        >
          <Section title="การเตรียมตัว">
            <Step n={1} role="Inspector">
              เตรียมอุปกรณ์: มือถือ (ถ่ายภาพ), สมุดบันทึก, ปากกา
            </Step>
            <Step n={2} role="Inspector">
              ตรวจสอบรายการห้องที่ต้องตรวจในสัปดาห์นี้
            </Step>
            <Step n={3} role="Inspector">
              แจ้งคนงานล่วงหน้า 1 วันเพื่อให้เตรียมห้อง
            </Step>
          </Section>

          <Section title="ขั้นตอนการตรวจ">
            <Step n={4} role="Inspector">
              เปิดแอป → เมนู "สุขอนามัย" → "ตรวจสอบ"
            </Step>
            <Step n={5} role="Inspector">
              เลือกแคมป์และห้องที่ต้องการตรวจ
            </Step>
            <Step n={6} role="Inspector">
              เดินตรวจห้องพักตาม Checklist:
              <div className="ml-6 mt-2 space-y-1 text-xs text-gray-600">
                • พื้นห้อง ผนัง เพดาน<br />
                • ห้องน้ำ ห้องส้วม<br />
                • เตียง ที่นอน ผ้าปู<br />
                • ถังขยะ ความสะอาดทั่วไป<br />
                • อุปกรณ์ไฟฟ้า ความปลอดภัย
              </div>
            </Step>
            <Step n={7} role="Inspector">
              สำหรับรายการที่ไม่ผ่าน: ถ่ายภาพหลักฐาน + กรอกหมายเหตุ
            </Step>
            <Step n={8} role="Inspector">
              กรอกหมายเหตุทั่วไป (ถ้ามี)
            </Step>
            <Step n={9} role="Inspector">
              ตรวจสอบความครบถ้วน (Progress Bar = 100%)
            </Step>
            <Step n={10} role="Inspector">
              คลิก "บันทึกผลการตรวจ"
            </Step>
          </Section>

          <Section title="หลังการตรวจ">
            <Step n={11} role="Inspector">
              ถ้าห้องไม่ผ่าน: แจ้งคนงานให้แก้ไขภายใน 3 วัน
            </Step>
            <Step n={12} role="Inspector">
              ถ้าไม่ผ่าน 2 รายการขึ้นไป: ระบบจะสร้างค่าปรับอัตโนมัติ
            </Step>
            <Step n={13} role="Accountant">
              เจ้าหน้าที่การเงินจะดูค่าปรับที่เมนู "การเงิน" → "ค่าปรับ"
            </Step>
            <Step n={14} role="Inspector">
              ตรวจซ้ำหลัง 3 วัน เพื่อยืนยันว่าแก้ไขแล้ว
            </Step>
          </Section>

          <TipBox>
            <strong>📸 การถ่ายภาพ:</strong> ถ่ายภาพให้เห็นปัญหาชัดเจน ใช้เป็นหลักฐานและแจ้งคนงาน
          </TipBox>

          <WarningBox>
            <strong>⚠️ สำคัญ:</strong> ต้องกรอก Checklist ให้ครบ 100% ก่อนบันทึก ไม่เช่นนั้นระบบจะไม่ให้บันทึก
          </WarningBox>
        </WorkflowCard>

        {/* Workflow 4: จัดการผู้มาติดต่อ */}
        <WorkflowCard
          title="👥 จัดการผู้มาติดต่อ (รปภ.)"
          description="ขั้นตอนการลงทะเบียนและติดตามผู้มาเยี่ยม"
          difficulty="ง่าย"
          estimatedTime="3-5 นาที/คน"
        >
          <Section title="เมื่อผู้เยี่ยมมาถึง">
            <Step n={1} role="Security">
              ทักทายและขอดูบัตรประชาชน
            </Step>
            <Step n={2} role="Security">
              เปิดแอป → เมนู "ผู้มาติดต่อ" → "+ ลงทะเบียนเข้า"
            </Step>
            <Step n={3} role="Security">
              กรอกข้อมูลจากบัตรประชาชน: ชื่อ-นามสกุล, เลขบัตร
            </Step>
            <Step n={4} role="Security">
              ถามและกรอก: เบอร์โทร, วัตถุประสงค์
            </Step>
            <Step n={5} role="Security">
              ถามว่ามาเยี่ยมคนงานคนไหน → เลือกจากรายการ
            </Step>
            <Step n={6} role="Security">
              คลิก "ยืนยันเข้า" → ระบบบันทึกเวลาเข้าอัตโนมัติ
            </Step>
            <Step n={7} role="Security">
              ให้บัตรผู้เยี่ยมหรือสติ๊กเกอร์ (ถ้ามี)
            </Step>
          </Section>

          <Section title="การติดตามผู้เยี่ยม">
            <Step n={8} role="Security">
              ตรวจสอบรายการ "กำลังอยู่ในแคมป์" เป็นระยะ
            </Step>
            <Step n={9} role="Security">
              สังเกตการ์ดสีแดง = อยู่เกิน 4 ชั่วโมง
            </Step>
            <Step n={10} role="Security">
              ถ้าเกิน 4 ชม.: โทรติดต่อคนงานที่เกี่ยวข้อง
            </Step>
            <Step n={11} role="Security">
              ถ้าไม่สามารถติดต่อได้: รายงาน CampBoss
            </Step>
          </Section>

          <Section title="เมื่อผู้เยี่ยมออก">
            <Step n={12} role="Security">
              เก็บบัตรผู้เยี่ยมคืน (ถ้ามี)
            </Step>
            <Step n={13} role="Security">
              เปิดแอป → เมนู "ผู้มาติดต่อ"
            </Step>
            <Step n={14} role="Security">
              หารายการผู้เยี่ยมจาก "กำลังอยู่ในแคมป์"
            </Step>
            <Step n={15} role="Security">
              คลิก "ลงทะเบียนออก" → ระบบบันทึกเวลาออกอัตโนมัติ
            </Step>
          </Section>

          <TipBox>
            <strong>⏰ การแจ้งเตือน:</strong> ระบบจะแสดงสีแดงเมื่อผู้เยี่ยมอยู่เกิน 4 ชั่วโมง 
            ให้ติดตามทันที
          </TipBox>

          <WarningBox>
            <strong>🚫 ห้ามปล่อย:</strong> ผู้เยี่ยมที่ไม่มีคนงานรับรอง หรือมีพฤติกรรมน่าสงสัย
          </WarningBox>
        </WorkflowCard>

        {/* Workflow 5: ออก Invoice รายเดือน */}
        <WorkflowCard
          title="💰 ออก Invoice รายเดือน"
          description="ขั้นตอนการออกบิลรายเดือนให้คนงาน"
          difficulty="ปานกลาง"
          estimatedTime="10-15 นาที/ห้อง"
        >
          <Section title="การเตรียมข้อมูล (ต้นเดือน)">
            <Step n={1} role="Accountant">
              บันทึกค่ามิเตอร์ไฟ-น้ำของทุกห้อง (วันที่ 1 ของเดือน)
            </Step>
            <Step n={2} role="Accountant">
              ตรวจสอบค่าปรับจากการตรวจสุขอนามัย (ถ้ามี)
            </Step>
            <Step n={3} role="Accountant">
              ตรวจสอบค่าห้องพักรายเดือน (ตามที่กำหนดในแคมป์)
            </Step>
          </Section>

          <Section title="การออก Invoice">
            <Step n={4} role="Accountant">
              เปิดแอป → เมนู "การเงิน" → "Invoice"
            </Step>
            <Step n={5} role="Accountant">
              คลิก "+ สร้าง Invoice"
            </Step>
            <Step n={6} role="Accountant">
              เลือกห้องพักและเดือนที่ต้องการออก Invoice
            </Step>
            <Step n={7} role="Accountant">
              ระบบจะรวมรายการอัตโนมัติ:
              <div className="ml-6 mt-2 space-y-1 text-xs text-gray-600">
                • ค่าห้องพัก (ราคาคงที่)<br />
                • ค่าไฟฟ้า (จากค่ามิเตอร์)<br />
                • ค่าน้ำ (จากค่ามิเตอร์)<br />
                • ค่าปรับ (ถ้ามี)
              </div>
            </Step>
            <Step n={8} role="Accountant">
              ตรวจสอบความถูกต้องของรายการและยอดรวม
            </Step>
            <Step n={9} role="Accountant">
              คลิก "สร้าง Invoice"
            </Step>
            <Step n={10} role="Accountant">
              พิมพ์หรือส่ง PDF ให้คนงาน
            </Step>
          </Section>

          <Section title="การติดตามการชำระเงิน">
            <Step n={11} role="Accountant">
              บันทึกวันครบกำหนดชำระ (ปกติ 7-15 วันหลังออก Invoice)
            </Step>
            <Step n={12} role="Accountant">
              เมื่อคนงานชำระเงิน: อัพเดทสถานะเป็น "ชำระแล้ว"
            </Step>
            <Step n={13} role="Accountant">
              ถ้าเกินกำหนด: ติดต่อคนงานเพื่อเตือน
            </Step>
            <Step n={14} role="Accountant">
              รายงานสรุปการชำระเงินให้ CampBoss/MD ทุกสิ้นเดือน
            </Step>
          </Section>

          <TipBox>
            <strong>📊 การคำนวณ:</strong> ระบบจะคำนวณค่าไฟ-น้ำอัตโนมัติจากค่ามิเตอร์ 
            ตามอัตราที่กำหนดในแคมป์
          </TipBox>

          <WarningBox>
            <strong>⚠️ ตรวจสอบ:</strong> ค่ามิเตอร์ต้องถูกต้อง ไม่เช่นนั้น Invoice จะผิดพลาด
          </WarningBox>
        </WorkflowCard>

        {/* Workflow 6: อนุมัติและมอบสิทธิ์ผู้ใช้ใหม่ */}
        <WorkflowCard
          title="👤 อนุมัติและมอบสิทธิ์ผู้ใช้ใหม่"
          description="ขั้นตอนการอนุมัติผู้ใช้และกำหนดสิทธิ์ที่เหมาะสม"
          difficulty="ง่าย"
          estimatedTime="3-5 นาที/คน"
        >
          <Section title="การตรวจสอบผู้ใช้ใหม่">
            <Step n={1} role="Manager / CampBoss">
              เปิดแอป → เมนู "จัดการผู้ใช้"
            </Step>
            <Step n={2} role="Manager / CampBoss">
              คลิกแท็บ "รอการอนุมัติ" (จะมีจำนวนแจ้งเตือน)
            </Step>
            <Step n={3} role="Manager / CampBoss">
              ตรวจสอบข้อมูล: ชื่อ, อีเมล, ตำแหน่ง
            </Step>
            <Step n={4} role="Manager / CampBoss">
              ยืนยันตัวตน (โทรศัพท์หรือพบตัว)
            </Step>
          </Section>

          <Section title="การอนุมัติและมอบสิทธิ์">
            <Step n={5} role="Manager / CampBoss">
              ถ้าข้อมูลถูกต้อง: คลิกปุ่ม "อนุมัติ"
            </Step>
            <Step n={6} role="Manager / CampBoss">
              ผู้ใช้จะได้ role "Staff" เป็นค่าเริ่มต้น
            </Step>
            <Step n={7} role="Manager / CampBoss">
              ถ้าต้องการเปลี่ยน role: คลิก "แก้ไข" ที่รายการผู้ใช้
            </Step>
            <Step n={8} role="Manager / CampBoss">
              เลือก role ที่เหมาะสมตามหน้าที่:
              <div className="ml-6 mt-2 space-y-1 text-xs text-gray-600">
                • <strong>Security:</strong> รปภ. ลงทะเบียนผู้เยี่ยม<br />
                • <strong>Inspector:</strong> ตรวจสุขอนามัย<br />
                • <strong>Accountant:</strong> จัดการบิล/การเงิน<br />
                • <strong>Manager:</strong> ช่วยจัดการทั่วไป<br />
                • <strong>HrManager:</strong> จัดการคนงาน/บุคลากร
              </div>
            </Step>
            <Step n={9} role="Manager / CampBoss">
              คลิก "บันทึก"
            </Step>
            <Step n={10} role="Manager / CampBoss">
              แจ้งผู้ใช้ว่าได้รับการอนุมัติแล้ว
            </Step>
          </Section>

          <Section title="การปฏิเสธผู้ใช้">
            <Step n={11} role="Manager / CampBoss">
              ถ้าข้อมูลไม่ถูกต้องหรือไม่ผ่านการยืนยัน: คลิก "ปฏิเสธ"
            </Step>
            <Step n={12} role="Manager / CampBoss">
              แจ้งผู้ใช้ถึงสาเหตุที่ปฏิเสธ
            </Step>
          </Section>

          <TipBox>
            <strong>🔐 ลำดับชั้น:</strong> ตรวจสอบว่าคุณมีสิทธิ์มอบ role นั้นๆ ได้หรือไม่ 
            (เช่น เฉพาะ MD+ มอบสิทธิ์ MD ได้)
          </TipBox>

          <WarningBox>
            <strong>⚠️ ความปลอดภัย:</strong> อย่ามอบสิทธิ์สูงให้คนที่ไม่รู้จักหรือไม่ไว้ใจ
          </WarningBox>
        </WorkflowCard>

        {/* Workflow 7: จัดการเมื่อคนงานย้ายออก */}
        <WorkflowCard
          title="📤 จัดการเมื่อคนงานย้ายออก"
          description="ขั้นตอนการจัดการข้อมูลเมื่อคนงานออกจากแคมป์"
          difficulty="ง่าย"
          estimatedTime="5-10 นาที"
        >
          <Section title="ขั้นตอน">
            <Step n={1} role="Manager">
              ตรวจสอบว่าคนงานชำระค่าใช้จ่ายครบถ้วนแล้ว
            </Step>
            <Step n={2} role="Accountant">
              ออก Invoice สุดท้าย (ค่าห้อง, ค่าไฟ-น้ำ, ค่าปรับ ถ้ามี)
            </Step>
            <Step n={3} role="Inspector">
              ตรวจสุขอนามัยห้องพักครั้งสุดท้าย
            </Step>
            <Step n={4} role="Accountant">
              รอคนงานชำระเงินครบถ้วน
            </Step>
            <Step n={5} role="Manager">
              เปิดแอป → เมนู "ลงทะเบียน" → ค้นหาคนงาน
            </Step>
            <Step n={6} role="Manager">
              คลิก "แก้ไข" → เปลี่ยนสถานะเป็น "ออกแล้ว"
            </Step>
            <Step n={7} role="Manager">
              บันทึกวันที่ออก
            </Step>
            <Step n={8} role="Manager">
              ระบบจะอัพเดทสถานะห้องพักอัตโนมัติ (ลดจำนวนคนพัก)
            </Step>
            <Step n={9} role="Manager">
              ตรวจสอบห้องพัก: ถ้าห้องว่าง ให้เปลี่ยนสถานะเป็น "ว่าง"
            </Step>
            <Step n={10} role="Manager">
              เก็บข้อมูลคนงานไว้ในระบบ (ไม่ลบ) เพื่อเป็นประวัติ
            </Step>
          </Section>

          <TipBox>
            <strong>📝 ประวัติ:</strong> ควรเก็บข้อมูลคนงานไว้เป็นประวัติ อาจมีประโยชน์ในอนาคต
          </TipBox>

          <WarningBox>
            <strong>⚠️ ตรวจสอบ:</strong> ต้องแน่ใจว่าคนงานชำระเงินครบก่อนออก
          </WarningBox>
        </WorkflowCard>

        {/* Workflow 8: รายงานประจำเดือน */}
        <WorkflowCard
          title="📊 จัดทำรายงานประจำเดือน"
          description="สรุปข้อมูลและรายงานให้ผู้บริหาร"
          difficulty="ปานกลาง"
          estimatedTime="30-45 นาที"
        >
          <Section title="ข้อมูลที่ต้องรวบรวม">
            <Step n={1} role="Manager">
              สถิติคนงาน: จำนวนเข้า-ออก, จำนวนรวม, อัตราการเข้าพัก
            </Step>
            <Step n={2} role="Manager">
              สถิติห้องพัก: ห้องว่าง, ห้องเต็ม, อัตราการใช้งาน
            </Step>
            <Step n={3} role="Inspector">
              สรุปการตรวจสุขอนามัย: จำนวนครั้ง, ห้องที่ผ่าน/ไม่ผ่าน
            </Step>
            <Step n={4} role="Accountant">
              สรุปรายได้: ค่าห้อง, ค่าไฟ-น้ำ, ค่าปรับ
            </Step>
            <Step n={5} role="Accountant">
              สรุปค่าใช้จ่าย: ค่าซ่อมบำรุง, ค่าสาธารณูปโภค
            </Step>
            <Step n={6} role="Security">
              สรุปผู้มาติดต่อ: จำนวนรวม, เหตุการณ์พิเศษ (ถ้ามี)
            </Step>
          </Section>

          <Section title="การจัดทำรายงาน">
            <Step n={7} role="Manager">
              รวบรวมข้อมูลจากทุกแผนก
            </Step>
            <Step n={8} role="Manager">
              สร้างเอกสารรายงาน (Word/Excel/PDF)
            </Step>
            <Step n={9} role="Manager">
              ใส่กราฟและตารางสรุป
            </Step>
            <Step n={10} role="Manager">
              เขียนสรุปผลและข้อเสนอแนะ
            </Step>
            <Step n={11} role="Manager">
              ส่งรายงานให้ CampBoss/MD ภายในวันที่ 5 ของเดือน
            </Step>
            <Step n={12} role="CampBoss / MD">
              ตรวจสอบรายงานและให้ข้อเสนอแนะ
            </Step>
          </Section>

          <TipBox>
            <strong>📈 กราฟ:</strong> ใช้กราฟแท่ง/เส้นเพื่อแสดงแนวโน้มรายเดือน ทำให้เห็นภาพชัดเจน
          </TipBox>
        </WorkflowCard>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-900">
          <CheckCircle2 className="h-5 w-5" />
          เคล็ดลับการใช้งานอย่างมีประสิทธิภาพ
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            <strong>ใช้ระบบอย่างสม่ำเสมอ:</strong> บันทึกข้อมูลทุกวันเพื่อความถูกต้อง
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            <strong>ตรวจสอบข้อมูล:</strong> ตรวจสอบความถูกต้องก่อนบันทึกทุกครั้ง
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            <strong>สำรองข้อมูล:</strong> ระบบจะสำรองอัตโนมัติ แต่ควรตรวจสอบเป็นระยะ
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            <strong>แจ้งปัญหา:</strong> พบปัญหาหรือข้อผิดพลาด แจ้ง CampBoss/IT ทันที
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            <strong>อบรมพนักงาน:</strong> อบรมพนักงานใหม่ให้รู้จักระบบก่อนใช้งานจริง
          </li>
        </ul>
      </div>
    </div>
  );
}
