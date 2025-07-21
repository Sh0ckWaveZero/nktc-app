/**
 * Mock services สำหรับการทดสอบ
 */

/**
 * สร้าง mock สำหรับ Prisma model
 */
export const createMockPrismaModel = () => ({
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  upsert: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
  createMany: jest.fn(),
  updateMany: jest.fn(),
  deleteMany: jest.fn(),
});

export const mockPrismaService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  // Generic mock สำหรับ Prisma model operations
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  upsert: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
  // Prisma models
  user: createMockPrismaModel(),
  student: createMockPrismaModel(),
  teacher: createMockPrismaModel(),
  classroom: createMockPrismaModel(),
  department: createMockPrismaModel(),
  program: createMockPrismaModel(),
  level: createMockPrismaModel(),
  auditLog: createMockPrismaModel(),
  reportCheckIn: createMockPrismaModel(),
  goodnessIndividual: createMockPrismaModel(),
  badnessIndividual: createMockPrismaModel(),
  account: createMockPrismaModel(),
};

export const mockPrismaMongoDbService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  // Generic mock สำหรับ Prisma MongoDB operations
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  upsert: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
  // MongoDB specific models
  appbar: createMockPrismaModel(),
};

export const mockMinioClientService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getFileUrl: jest.fn(),
  listFiles: jest.fn(),
  copyFile: jest.fn(),
  moveFile: jest.fn(),
};

export const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
};

export const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

/**
 * สร้าง mock Prisma service ที่มี method ทั้งหมดสำหรับ model ต่างๆ
 */
export const createMockPrismaService = () => {
  const models = [
    'user',
    'student',
    'teacher',
    'classroom',
    'program',
    'department',
    'level',
    'auditLog',
    'appbar',
    'account',
    'goodness',
    'badness',
    'reportCheckIn',
    'visit',
  ];

  const mockService: any = {
    ...mockPrismaService,
  };

  // สร้าง mock สำหรับแต่ละ model
  models.forEach((model) => {
    mockService[model] = {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    };
  });

  return mockService;
};
