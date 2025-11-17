import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuditService } from './services/audit.service';
import { EmailService } from './services/email.service';
import { MfaService } from './services/mfa.service';
import { AuditLog } from './entities/audit-log.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Invitation } from './entities/invitation.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([AuditLog, RefreshToken, Invitation]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION', '1d') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditService, EmailService, MfaService],
  exports: [AuthService, AuditService, EmailService, MfaService],
})
export class AuthModule {}
