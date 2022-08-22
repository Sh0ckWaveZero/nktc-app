export const departmentData = () => {
  const startDate = new Date();
  const admin = {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };

  return [
    {
      departmentId: "D001",
      name: "ช่างกลโรงงาน",
      description: "แผนก ช่างกลโรงงาน",
      ...admin,
    },
    {
      departmentId: "D002",
      name: "ช่างเชื่อมโลหะ",
      description: "แผนก ช่างเชื่อมโลหะ",
      ...admin,
    },
    {
      departmentId: "D003",
      name: "ช่างไฟฟ้ากำลัง",
      description: "แผนก ช่างไฟฟ้ากำลัง",
      ...admin,
    },
    {
      departmentId: "D004",
      name: "ช่างอิเล็กทรอนิกส์",
      description: "แผนก ช่างอิเล็กทรอนิกส์",
      ...admin,
    },
    {
      departmentId: "D005",
      name: "โยธา",
      description: "แผนก โยธา",
      ...admin,
    },
    {
      departmentId: "D006",
      name: "เมคคาทรอนิกส์",
      description: "แผนก เมคคาทรอนิกส์",
      ...admin,
    },
    {
      departmentId: "D007",
      name: "คอมพิวเตอร์ธุรกิจ",
      description: "แผนก คอมพิวเตอร์ธุรกิจ",
      ...admin,
    },
    {
      departmentId: "D008",
      name: "เทคโนโลยีคอมพิวเตอร์",
      description: "แผนก เทคโนโลยีคอมพิวเตอร์",
      ...admin,
    },
    {
      departmentId: "D009",
      name: "ภาษาต่างประเทศธุรกิจ",
      description: "แผนก ภาษาต่างประเทศธุรกิจ",
      ...admin,
    },
    {
      departmentId: "D010",
      name: "เทคโนโลยีสารสนเทศ",
      description: "แผนก เทคโนโลยีสารสนเทศ",
      ...admin,
    },
    {
      departmentId: "D011",
      name: "การจัดการโลจิสติกส์และซัพพลายเชน",
      description: "แผนก การจัดการโลจิสติกส์และซัพพลายเชน",
      ...admin,
    },
    {
      departmentId: "D012",
      name: "ช่างยนต์",
      description: "แผนก ช่างยนต์",
      ...admin,
    },
  ]
}