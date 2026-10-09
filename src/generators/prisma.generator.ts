import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class PrismaGenerator implements Generator {
  id = 'prisma';

  shouldRun(options: ProjectOptions): boolean {
    return options.database.provider !== 'none' && options.database.orm === 'prisma';
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const databaseProvider = options.database.provider === 'mysql' ? 'mysql' : 'postgresql';
    const isMongo = options.database.provider === 'mongodb';

    const scriptEntries: Record<string, string> = isMongo
      ? {
          'db:generate': 'prisma generate',
          'db:push': 'prisma db push',
          'db:studio': 'prisma studio',
        }
      : {
          'db:generate': 'prisma generate',
          'db:migrate': 'prisma migrate dev',
          'db:studio': 'prisma studio',
          'db:reset': 'prisma migrate reset --force',
        };

    const schema = isMongo
      ? `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id    String  @id @default(auto()) @map("_id") @db.ObjectId
  email String  @unique
  name  String?
}
`
      : `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${databaseProvider}"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
`;

    return {
      dependencies: [{ name: '@prisma/client', version: VERSIONS.database.prismaClient }],
      devDependencies: [{ name: 'prisma', version: VERSIONS.database.prisma, dev: true }],
      env: [{
        name: 'DATABASE_URL',
        value: options.database.provider === 'mysql' ? 'mysql://localhost:3306/app' : 'postgresql://localhost:5432/app',
      }],
      scripts: scriptEntries,
      moduleImports: ['PrismaModule'],
      files: {
        'prisma/schema.prisma': schema,
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
