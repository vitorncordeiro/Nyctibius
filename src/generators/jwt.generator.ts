import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';

export class JwtGenerator implements Generator {
  id = 'jwt';

  shouldRun(options: ProjectOptions): boolean {
    return options.auth.provider === 'jwt';
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const env = [{ name: 'JWT_SECRET', value: 'change-me' }];

    if (options.auth.refreshToken) {
      env.push({ name: 'JWT_REFRESH_SECRET', value: 'change-me' });
    }

    return {
      dependencies: [
        { name: '@nestjs/jwt', version: '^11.0.0' },
        { name: '@nestjs/passport', version: '^11.0.0' },
        { name: 'passport', version: '^0.7.0' },
        { name: 'passport-jwt', version: '^4.0.1' },
      ],
      env,
      moduleImports: ['AuthModule'],
      files: {
        'src/auth/auth.module.ts': `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
`,
        'src/auth/auth.service.ts': `import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.sign(payload);
  }
}
`,
        'src/auth/strategies/jwt.strategy.ts': `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }

  validate(payload: Record<string, unknown>): Record<string, unknown> {
    return payload;
  }
}
`,
      },
    };
  }
}
