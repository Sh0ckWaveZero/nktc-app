const fs = require('fs');
const path = require('path');

// รายการ test files ที่ต้องแก้ไข และ dependencies ที่ต้องการ
const testFiles = [
  {
    path: 'src/apis/goodness-individual/goodness-individual.controller.spec.ts',
    servicePath: 'src/apis/goodness-individual/goodness-individual.service.ts',
    controllerPath: 'src/apis/goodness-individual/goodness-individual.controller.ts',
  },
  {
    path: 'src/apis/goodness-individual/goodness-individual.service.spec.ts',
    servicePath: 'src/apis/goodness-individual/goodness-individual.service.ts',
  },
  {
    path: 'src/apis/badness-individual/badness-individual.controller.spec.ts',
    servicePath: 'src/apis/badness-individual/badness-individual.service.ts',
    controllerPath: 'src/apis/badness-individual/badness-individual.controller.ts',
  },
  {
    path: 'src/apis/badness-individual/badness-individual.service.spec.ts',
    servicePath: 'src/apis/badness-individual/badness-individual.service.ts',
  },
  {
    path: 'src/apis/statics/statics.controller.spec.ts',
    servicePath: 'src/apis/statics/statics.service.ts',
    controllerPath: 'src/apis/statics/statics.controller.ts',
  },
  {
    path: 'src/apis/statics/statics.service.spec.ts',
    servicePath: 'src/apis/statics/statics.service.ts',
  },
  {
    path: 'src/apis/users/users.service.spec.ts',
    servicePath: 'src/apis/users/users.service.ts',
  },
  {
    path: 'src/apis/auth/auth.service.spec.ts',
    servicePath: 'src/apis/auth/auth.service.ts',
  },
  {
    path: 'src/apis/level/level.controller.spec.ts',
    servicePath: 'src/apis/level/level.service.ts',
    controllerPath: 'src/apis/level/level.controller.ts',
  },
  {
    path: 'src/apis/level/level.service.spec.ts',
    servicePath: 'src/apis/level/level.service.ts',
  },
  {
    path: 'src/apis/accounts/accounts.controller.spec.ts',
    servicePath: 'src/apis/accounts/accounts.service.ts',
    controllerPath: 'src/apis/accounts/accounts.controller.ts',
  },
  {
    path: 'src/apis/departments/departments.controller.spec.ts',
    servicePath: 'src/apis/departments/departments.service.ts',
    controllerPath: 'src/apis/departments/departments.controller.ts',
  },
  {
    path: 'src/apis/departments/departments.service.spec.ts',
    servicePath: 'src/apis/departments/departments.service.ts',
  },
  {
    path: 'src/apis/programs/programs.controller.spec.ts',
    servicePath: 'src/apis/programs/programs.service.ts',
    controllerPath: 'src/apis/programs/programs.controller.ts',
  },
  {
    path: 'src/apis/programs/programs.service.spec.ts',
    servicePath: 'src/apis/programs/programs.service.ts',
  },
  {
    path: 'src/apis/classroom/classroom.controller.spec.ts',
    servicePath: 'src/apis/classroom/classroom.service.ts',
    controllerPath: 'src/apis/classroom/classroom.controller.ts',
  },
  {
    path: 'src/apis/classroom/classroom.service.spec.ts',
    servicePath: 'src/apis/classroom/classroom.service.ts',
  },
];

function checkServiceDependencies(servicePath) {
  try {
    const content = fs.readFileSync(servicePath, 'utf8');
    const needsPrisma = content.includes('PrismaService');
    const needsMinio = content.includes('MinioClientService');
    const needsJwt = content.includes('JwtService');
    const needsUsers = content.includes('UsersService');
    
    return { needsPrisma, needsMinio, needsJwt, needsUsers };
  } catch (error) {
    console.log(`Warning: Could not read ${servicePath}`);
    return { needsPrisma: true, needsMinio: false, needsJwt: false, needsUsers: false };
  }
}

function generateMockProviders(deps) {
  const providers = [];
  const imports = [];
  
  if (deps.needsPrisma) {
    providers.push(`        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },`);
    imports.push('PrismaService');
  }
  
  if (deps.needsMinio) {
    providers.push(`        {
          provide: MinioClientService,
          useValue: mockMinioClientService,
        },`);
    imports.push('MinioClientService');
  }
  
  if (deps.needsJwt) {
    providers.push(`        {
          provide: JwtService,
          useValue: mockJwtService,
        },`);
    imports.push('JwtService');
  }
  
  if (deps.needsUsers) {
    providers.push(`        {
          provide: UsersService,
          useValue: mockUsersService,
        },`);
    imports.push('UsersService');
  }
  
  return { providers: providers.join('\n'), imports };
}

function updateTestFile(testFile) {
  const fullPath = path.join(__dirname, testFile.path);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${testFile.path}`);
    return;
  }
  
  // ตรวจสอบ dependencies จาก service file
  const deps = checkServiceDependencies(path.join(__dirname, testFile.servicePath));
  const { providers, imports } = generateMockProviders(deps);
  
  // อ่านไฟล์ปัจจุบัน
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // ตรวจสอบว่าได้แก้ไขแล้วหรือยัง
  if (content.includes('mockPrismaService')) {
    console.log(`Already updated: ${testFile.path}`);
    return;
  }
  
  // สร้าง mock imports
  let mockImports = ['mockPrismaService'];
  if (deps.needsMinio) mockImports.push('mockMinioClientService');
  if (deps.needsJwt) mockImports.push('mockJwtService');
  if (deps.needsUsers) mockImports.push('mockUsersService');
  
  // สร้าง service imports
  let serviceImports = [];
  if (deps.needsPrisma) serviceImports.push('PrismaService');
  if (deps.needsMinio) serviceImports.push('MinioClientService');
  if (deps.needsJwt) serviceImports.push('JwtService');
  if (deps.needsUsers) serviceImports.push('UsersService');
  
  // แก้ไข imports
  const newImports = `import { Test, TestingModule } from '@nestjs/testing';
import { ${mockImports.join(', ')} } from '@common/test/mocks';`;
  
  // เพิ่ม service imports ถ้าจำเป็น
  if (serviceImports.length > 0) {
    content = content.replace(
      /import { Test, TestingModule } from '@nestjs\/testing';/,
      newImports + '\n' + serviceImports.map(imp => {
        if (imp === 'PrismaService') return `import { PrismaService } from '@common/services/prisma.service';`;
        if (imp === 'MinioClientService') return `import { MinioClientService } from '../minio/minio-client.service';`;
        if (imp === 'JwtService') return `import { JwtService } from '@nestjs/jwt';`;
        if (imp === 'UsersService') return `import { UsersService } from '../users/users.service';`;
        return '';
      }).filter(Boolean).join('\n')
    );
  } else {
    content = content.replace(
      /import { Test, TestingModule } from '@nestjs\/testing';/,
      newImports
    );
  }
  
  // ค้นหาและแทนที่ providers array
  const providersPattern = /providers:\s*\[([\s\S]*?)\]/;
  const match = content.match(providersPattern);
  
  if (match) {
    const currentProviders = match[1].trim();
    let newProviders;
    
    if (testFile.path.includes('.controller.spec.ts')) {
      // Controller test
      const serviceName = path.basename(testFile.servicePath, '.ts');
      const serviceClass = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
      newProviders = `        ${serviceClass},
${providers}`;
    } else {
      // Service test
      const serviceName = path.basename(testFile.servicePath, '.ts');
      const serviceClass = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
      newProviders = `        ${serviceClass},
${providers}`;
    }
    
    content = content.replace(providersPattern, `providers: [
${newProviders}
      ]`);
  }
  
  // เขียนไฟล์กลับ
  fs.writeFileSync(fullPath, content);
  console.log(`Updated: ${testFile.path}`);
}

// รันการแก้ไข
testFiles.forEach(updateTestFile);

console.log('Finished updating test files!');
