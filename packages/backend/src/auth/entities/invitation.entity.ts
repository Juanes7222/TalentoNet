import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

export enum InvitationType {
  USER_INVITE = 'USER_INVITE',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: InvitationType.USER_INVITE,
  })
  type: InvitationType;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  expiresAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'used_by' })
  usedBy: User;

  @Column({ name: 'used_by', nullable: true })
  usedById: string;

  @Column({ name: 'used_at', nullable: true, type: 'timestamp with time zone' })
  usedAt: Date;
}
