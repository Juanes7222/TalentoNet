import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('refresh_tokens')
@Index(['userId', 'revoked'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'refresh_token_hash' })
  refreshTokenHash: string;

  @CreateDateColumn({ name: 'issued_at' })
  issuedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ name: 'revoked_at', nullable: true, type: 'timestamp with time zone' })
  revokedAt: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;
}
