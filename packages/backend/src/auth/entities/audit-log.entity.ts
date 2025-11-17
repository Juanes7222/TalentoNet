import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/user.entity';

export enum AuditAction {
  // User actions
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  SUSPEND_USER = 'suspend_user',
  ACTIVATE_USER = 'activate_user',
  
  // Auth actions
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAIL = 'login_fail',
  LOGOUT = 'logout',
  REFRESH_TOKEN = 'refresh_token',
  REVOKE_TOKEN = 'revoke_token',
  
  // Password actions
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_CHANGE = 'password_change',
  
  // Invitation actions
  INVITE_SEND = 'invite_send',
  INVITE_ACCEPT = 'invite_accept',
  INVITE_EXPIRE = 'invite_expire',
  
  // Role/Permission actions
  ROLE_ASSIGN = 'role_assign',
  ROLE_REVOKE = 'role_revoke',
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  
  // MFA actions
  MFA_ENABLE = 'mfa_enable',
  MFA_DISABLE = 'mfa_disable',
  MFA_VERIFY_SUCCESS = 'mfa_verify_success',
  MFA_VERIFY_FAIL = 'mfa_verify_fail',
  
  // Impersonation
  IMPERSONATE_START = 'impersonate_start',
  IMPERSONATE_END = 'impersonate_end',
}

@Entity('audit_logs')
@Index(['actorUserId', 'action', 'createdAt'])
@Index(['resourceType', 'resourceId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser: User;

  @Column({ name: 'actor_user_id', nullable: true })
  actorUserId: string;

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  @Column({ name: 'resource_type', nullable: true })
  resourceType: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
