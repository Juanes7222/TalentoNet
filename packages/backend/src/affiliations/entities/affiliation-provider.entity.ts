import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AffiliationType } from './affiliation.entity';

export enum ApiAuthType {
  OAUTH2 = 'oauth2',
  API_KEY = 'api_key',
  BASIC = 'basic',
}

@Entity('affiliation_providers')
export class AffiliationProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Información del proveedor
  @Column({
    type: 'varchar',
    length: 20,
    enum: AffiliationType,
  })
  tipo: AffiliationType;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 20, nullable: true })
  nit?: string;

  @Column({ length: 50, nullable: true })
  codigo?: string;

  // Contacto
  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  telefono?: string;

  @Column({ length: 500, nullable: true })
  website?: string;

  // Configuración de integración API
  @Column({ name: 'api_enabled', default: false })
  apiEnabled: boolean;

  @Column({ name: 'api_endpoint', type: 'text', nullable: true })
  apiEndpoint?: string;

  @Column({
    name: 'api_auth_type',
    type: 'varchar',
    length: 50,
    nullable: true,
    enum: ApiAuthType,
  })
  apiAuthType?: ApiAuthType;

  @Column({ name: 'api_credentials_encrypted', type: 'bytea', nullable: true })
  apiCredentialsEncrypted?: Buffer;

  // Plantilla de correo para radicado manual
  @Column({ name: 'email_template', type: 'text', nullable: true })
  emailTemplate?: string;

  @Column({ name: 'email_destino', length: 255, nullable: true })
  emailDestino?: string;

  // Validación de número de afiliación
  @Column({ name: 'numero_afiliacion_pattern', length: 200, nullable: true })
  numeroAfiliacionPattern?: string;

  @Column({ name: 'numero_afiliacion_ejemplo', length: 100, nullable: true })
  numeroAfiliacionEjemplo?: string;

  // Estado
  @Column({ default: true })
  activo: boolean;

  // Auditoría
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
