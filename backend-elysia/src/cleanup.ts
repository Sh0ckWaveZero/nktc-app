import { prisma } from "./libs/prisma";

async function main() {
  console.log("🧹 เริ่มต้นการทำความสะอาดข้อมูลขยะ...");
  
  // ดึงความสัมพันธ์ทั้งหมด
  const relations = await prisma.teacherOnClassroom.findMany();
  
  // ดึงอาจารย์ทั้งหมดที่มีอยู่ในระบบจริง
  const teachers = await prisma.teacher.findMany({ select: { id: true } });
  const validTeacherIds = new Set(teachers.map(t => t.id));
  
  // ดึงห้องเรียนทั้งหมดที่มีอยู่ในระบบจริง
  const classrooms = await prisma.classroom.findMany({ select: { id: true } });
  const validClassroomIds = new Set(classrooms.map(c => c.id));
  
  let deletedCount = 0;
  
  for (const rel of relations) {
    const isTeacherValid = validTeacherIds.has(rel.teacherId);
    const isClassroomValid = validClassroomIds.has(rel.classroomId);
    
    // หากอาจารย์ หรือ ห้องเรียน ไม่มีอยู่จริง ให้ลบความสัมพันธ์ทิ้ง
    if (!isTeacherValid || !isClassroomValid) {
      console.log(`❌ ลบความสัมพันธ์ขยะ: teacherId "${rel.teacherId}", classroomId "${rel.classroomId}" (ข้อมูลขัดแย้งกับระบบ)`);
      
      await prisma.teacherOnClassroom.deleteMany({
        where: {
          teacherId: rel.teacherId,
          classroomId: rel.classroomId
        }
      });
      deletedCount++;
    }
  }
  
  console.log(`\n✨ ทำความสะอาดข้อมูลเสร็จสิ้น! ลบข้อมูลขยะไปทั้งสิ้น ${deletedCount} แถว`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
