import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

export interface AuditContext {
  actorUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(action: AuditAction, context: AuditContext): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action,
      actorUserId: context.actorUserId,
      resourceType: context.resourceType,
      resourceId: context.resourceId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      details: this.sanitizeDetails(context.details),
    });

    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * Query audit logs with filters
   */
  async query(filters: {
    actorUserId?: string;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      actorUserId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actorUser', 'actor');

    if (actorUserId) {
      query.andWhere('audit.actorUserId = :actorUserId', { actorUserId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    if (resourceType) {
      query.andWhere('audit.resourceType = :resourceType', { resourceType });
    }

    if (resourceId) {
      query.andWhere('audit.resourceId = :resourceId', { resourceId });
    }

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    query
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLog(userId: string, limit = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { actorUserId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceAuditLog(
    resourceType: string,
    resourceId: string,
    limit = 100,
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { resourceType, resourceId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['actorUser'],
    });
  }

  /**
   * Sanitize sensitive data from audit details
   */
  private sanitizeDetails(details?: Record<string, any>): Record<string, any> {
    if (!details) return {};

    const sanitized = { ...details };
    const sensitiveKeys = [
      'password',
      'passwordHash',
      'token',
      'refreshToken',
      'accessToken',
      'mfaSecret',
      'mfaSecretEncrypted',
    ];

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
