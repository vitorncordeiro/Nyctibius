import type { Generator, Contribution } from './types.js';
import type { ProjectOptions } from '../types.js';

export class PrismaGenerator implements Generator {
  id = 'prisma';

  shouldRun(options: ProjectOptions): boolean {
    return options.database.provider !== 'none' && options.database.orm === 'prisma';
  }

  contribute(): Contribution {
    return {
      dependencies: [{ name: '@prisma/client', version: '^6.0.0' }],
      devDependencies: [{ name: 'prisma', version: '^6.0.0', dev: true }],
      env: [{ name: 'DATABASE_URL', value: 'postgresql://postgres:postgres@localhost:5432/app' }],
      scripts: {
        'db:generate': 'prisma generate',
        'db:migrate': 'prisma migrate dev',
        'db:studio': 'prisma studio',
      },
      moduleImports: ['PrismaModule'],
      files: {
        'prisma/schema.prisma': `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
`,
        'src/database/prisma.module.ts': `import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
`,
        'src/database/prisma.service.ts': `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
`,
      },
    };
  }
}
