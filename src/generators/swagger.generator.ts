import type { Generator, Contribution } from './types.js';
import type { ProjectOptions } from '../types.js';

export class SwaggerGenerator implements Generator {
  id = 'swagger';

  shouldRun(options: ProjectOptions): boolean {
    return options.api.swagger;
  }

  contribute(): Contribution {
    return {
      dependencies: [
        { name: '@nestjs/swagger', version: '^11.0.0' },
      ],
      bootstrapHooks: [
        "const config = new DocumentBuilder().setTitle('Nyctibius API').setDescription('Generated API').setVersion('1.0').build();",
        'const document = SwaggerModule.createDocument(app, config);',
        "SwaggerModule.setup('docs', app, document);",
      ],
      files: {
        'src/config/swagger.ts': `import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Nyctibius API')
    .setDescription('Generated API using Nyctibius')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
`,
      },
    };
  }
}
