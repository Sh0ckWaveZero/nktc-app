export const programData = () => {
  const startDate = new Date();
  const admin = {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };
  const level001 = {
    ...admin,
    level: {
      connect: {
        levelId: "L001"
      }
    }
  }
  const level002 = {
    ...admin,
    level: {
      connect: {
        levelId: "L002"
      }
    }
  }
  return [
    {
      programId: "P001",
      name: "เทคนิคยานยนต์",
      description: "เทคนิคยานยนต์ ปวส.",
      ...level002,
    },
    {
      programId: "P002",
      name: "เทคนิคเครื่องกลอุตสาหกรรม",
      description: "เทคนิคเครื่องกลอุตสาหกรรม ปวส.",
      ...level002,
    },
    {
      programId: "P003",
      name: "เทคนิคยานยนต์ (ทวิภาคี)",
      description: "เทคนิคยานยนต์ (ทวิภาคี) ปวส.",
      ...level002,
    },
    {
      programId: "P004",
      name: "เทคนิคยานยนต์ (ม.6)",
      description: "เทคนิคยานยนต์ (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P005",
      name: "เทคนิคเครื่องกลอุตสาหกรรม (ม.6)",
      description: "เทคนิคเครื่องกลอุตสาหกรรม (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P006",
      name: "เครื่องมือกล",
      description: "เครื่องมือกล ปวส.",
      ...level002,
    },
    {
      programId: "P007",
      name: "เครื่องมือกล (ทวิภาคี)",
      description: "เครื่องมือกล (ทวิภาคี) ปวส.",
      ...level002,
    },
    {
      programId: "P008",
      name: "แม่พิมพ์โลหะ (ทวิภาคี)",
      description: "แม่พิมพ์โลหะ (ทวิภาคี) ปวส.",
      ...level002,
    },
    {
      programId: "P009",
      name: "เครื่องมือกล (ม.6)",
      description: "เครื่องมือกล (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P010",
      name: "แม่พิมพ์โลหะ (ม.6)",
      description: "แม่พิมพ์โลหะ (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P011",
      name: "เทคโนโลยีงานเชื่อมฯ",
      description: "เทคโนโลยีงานเชื่อมฯ ปวส.",
      ...level002,
    },
    {
      programId: "P012",
      name: "เทคโนโลยีงานเชื่อมฯ (ม.6)",
      description: "เทคโนโลยีงานเชื่อมฯ (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P013",
      name: "ไฟฟ้ากำลัง",
      description: "ไฟฟ้ากำลัง ปวส.",
      ...level002,
    },
    {
      programId: "P014",
      name: "ไฟฟ้ากำลัง (ทวิภาคี)",
      description: "ไฟฟ้ากำลัง (ทวิภาคี) ปวส.",
      ...level002,
    },
    {
      programId: "P015",
      name: "ไฟฟ้ากำลัง (ม.6)",
      description: "ไฟฟ้ากำลัง (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P016",
      name: "อิเล็กทรอนิกส์",
      description: "อิเล็กทรอนิกส์ ปวส.",
      ...level002,
    },
    {
      programId: "P017",
      name: "อิเล็กทรอนิกส์ (ทวิภาคี)",
      description: "อิเล็กทรอนิกส์ (ทวิภาคี) ปวส.",
      ...level002,
    },
    {
      programId: "P018",
      name: "อิเล็กทรอนิกส์ (ม.6)",
      description: "อิเล็กทรอนิกส์ (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P019",
      name: "ก่อสร้าง",
      description: "ก่อสร้าง ปวส.",
      ...level002,
    },
    {
      programId: "P020",
      name: "ก่อสร้าง (ม.6)",
      description: "ก่อสร้าง (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P021",
      name: "สถาปัตยกรรม",
      description: "สถาปัตยกรรม ปวส.",
      ...level002,
    },
    {
      programId: "P022",
      name: "สถาปัตยกรรม (ม.6)",
      description: "สถาปัตยกรรม (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P023",
      name: "โยธา",
      description: "โยธา ปวส.",
      ...level002,
    },
    {
      programId: "P024",
      name: "โยธา (ม.6)",
      description: "โยธา (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P025",
      name: "เมคคาทรอนิกส์และหุ่นยนต์",
      description: "เมคคาทรอนิกส์และหุ่นยนต์ ปวส.",
      ...level002,
    },
    {
      programId: "P026",
      name: "เมคคาทรอนิกส์และหุ่นยนต์ (ม.6)",
      description: "เมคคาทรอนิกส์และหุ่นยนต์ (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P027",
      name: "เทคโนโลยีคอมพิวเตอร์",
      description: "เทคโนโลยีคอมพิวเตอร์ ปวส.",
      ...level002,
    },
    {
      programId: "P028",
      name: "เทคโนโลยีคอมพิวเตอร์ (ม.6)",
      description: "เทคโนโลยีคอมพิวเตอร์ (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P029",
      name: "การจัดการโลจิสติกส์ฯ (ทวิภาคี)",
      description: "การจัดการโลจิสติกส์ฯ (ทวิภาคี) ปวส.",
      ...level002,
    },
    {
      programId: "P030",
      name: "เทคโนโลยีสารสนเทศ",
      description: "เทคโนโลยีสารสนเทศ ปวส.",
      ...level002,
    },
    {
      programId: "P031",
      name: "เทคโนโลยีสารสนเทศ (ม.6)",
      description: "เทคโนโลยีสารสนเทศ (ม.6) ปวส.",
      ...level002,
    },
    {
      programId: "P032",
      name: "ช่างยนต์",
      description: "ช่างยนต์ ปวช.",
      ...level001,
    },
    {
      programId: "P033",
      name: "ช่างกลโรงงาน",
      description: "ช่างกลโรงงาน ปวช.",
      ...level001,
    },
    {
      programId: "P034",
      name: "ช่างเชื่อมโลหะ",
      description: "ช่างเชื่อมโลหะ ปวช.",
      ...level001,
    },
    {
      programId: "P035",
      name: "ช่างไฟฟ้ากำลัง",
      description: "ช่างไฟฟ้ากำลัง ปวช.",
      ...level001,
    },
    {
      programId: "P036",
      name: "ช่างอิเล็กทรอนิกส์",
      description: "ช่างอิเล็กทรอนิกส์ ปวช.",
      ...level001,
    },
    {
      programId: "P037",
      name: "ก่อสร้าง",
      description: "ก่อสร้าง ปวช.",
      ...level001,
    },
    {
      programId: "P038",
      name: "สถาปัตยกรรม",
      description: "สถาปัตยกรรม ปวช.",
      ...level001,
    },
    {
      programId: "P039",
      name: "โยธา",
      description: "โยธา ปวช.",
      ...level001,
    },
    {
      programId: "P040",
      name: "เมคคาทรอนิกส์",
      description: "เมคคาทรอนิกส์ ปวช.",
      ...level001,
    },
    {
      programId: "P041",
      name: "เทคนิคคอมพิวเตอร์",
      description: "เทคนิคคอมพิวเตอร์ ปวช.",
      ...level001,
    },
    {
      programId: "P042",
      name: "โลจิสติกส์",
      description: "โลจิสติกส์ ปวช.",
      ...level001,
    },
    {
      programId: "P043",
      name: "เทคโนโลยีสารสนเทศ",
      description: "เทคโนโลยีสารสนเทศ ปวช.",
      ...level001,
    },
    {
      programId: "P044",
      name: "คอมพิวเตอร์ธุรกิจ",
      description: "คอมพิวเตอร์ธุรกิจ ปวช.",
      ...level001,
    }
  ]
}