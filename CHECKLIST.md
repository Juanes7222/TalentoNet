# CHECKLIST DE INFORMACIÓN FALTANTE Y SUPUESTOS

## ✅ SUPUESTOS REALIZADOS

### 1. Autenticación y Seguridad
- **Supuesto**: JWT con expiración de 1 día, refresh token de 7 días
- **Supuesto**: Roles básicos (admin, rh, employee) suficientes para MVP
- **Supuesto**: Bcrypt con 10 rounds para hash de contraseñas
- **Pendiente**: Integración con SSO/OAuth2 externo (Azure AD, Google Workspace)

### 2. Cálculo de Nómina
- **Supuesto**: Deducciones básicas fijas: Salud 4%, Pensión 4%
- **Supuesto**: No se implementa todavía: horas extras, bonificaciones variables, retención en la fuente
- **FALTANTE CRÍTICO**: Tablas de retención fiscal actualizadas (DIAN 2024)
- **FALTANTE CRÍTICO**: Reglas de cálculo de aportes parafiscales (SENA, ICBF, Cajas)
- **FALTANTE**: Fórmulas exactas para prestaciones sociales (cesantías, intereses, prima)

### 3. Archivos Planos PILA
- **Supuesto**: Formato PILA 2024 (sin validar estructura oficial)
- **FALTANTE CRÍTICO**: Especificación oficial del formato PILA vigente
- **FALTANTE CRÍTICO**: Códigos de novedades (retiros, licencias, incapacidades)
- **FALTANTE**: Validaciones específicas por operador (Aportes en Línea, SOI, etc.)
- **Acción**: Contactar UGPP o revisar documentación oficial operadores

### 4. Integración Yéminus
- **Supuesto**: API REST con autenticación por API Key
- **FALTANTE CRÍTICO**: Documentación oficial API Yéminus
- **FALTANTE CRÍTICO**: Contratos de mensajes (request/response schemas)
- **FALTANTE**: URLs de ambientes (sandbox, producción)
- **FALTANTE**: Certificados SSL si requiere mTLS
- **Acción**: Solicitar acceso a portal de desarrolladores Yéminus + credenciales sandbox

### 5. Integraciones EPS/AFP/ARL
- **Supuesto**: Códigos de entidades hardcodeados en seed
- **FALTANTE**: Catálogo oficial actualizado de entidades con códigos DANE
- **FALTANTE**: APIs de validación de afiliaciones en tiempo real
- **Acción**: Descargar catálogo desde Ministerio de Salud / Ministerio de Trabajo

### 6. Almacenamiento de Documentos
- **Supuesto**: S3-compatible con presigned URLs (15 min expiración)
- **Supuesto**: Bucket único, separación por prefijos/folders
- **FALTANTE**: Políticas de retención y eliminación de documentos
- **FALTANTE**: Requerimientos de cifrado en reposo (KMS)
- **Acción**: Definir políticas de gobierno de datos corporativo

### 7. Generación de PDFs
- **Supuesto**: Puppeteer con template HTML básico
- **FALTANTE**: Templates oficiales corporativos (desprendibles, certificados)
- **FALTANTE**: Watermarks, firmas digitales
- **Acción**: Solicitar templates de diseño a equipo de marca/legal

### 8. Parámetros Fiscales y Laborales
- **FALTANTE CRÍTICO**: Salario mínimo legal vigente (SMLV) 2024
- **FALTANTE CRÍTICO**: Auxilio de transporte 2024
- **FALTANTE**: UVT (Unidad de Valor Tributario) vigente
- **FALTANTE**: Topes de cotización pensión/salud
- **Acción**: Parametrizar valores en tabla de configuración actualizable

### 9. Reportes y Analytics
- **Supuesto**: Reportes básicos exportables a CSV/Excel
- **FALTANTE**: Dashboards ejecutivos con métricas KPI
- **FALTANTE**: Integración con BI tools (Power BI, Tableau)
- **Acción**: Definir métricas clave con stakeholders

### 10. Notificaciones
- **Supuesto**: Sistema de colas para emails asíncronos
- **FALTANTE**: Proveedor de email (SendGrid, SES, SMTP)
- **FALTANTE**: Templates de notificaciones
- **FALTANTE**: Notificaciones SMS/WhatsApp
- **Acción**: Contratar servicio de email transaccional

---

## 🔴 PRIORIDAD ALTA - BLOQUEAN PRODUCCIÓN

1. **Tablas de retención fiscal 2024** → Sin esto, cálculo de nómina será incorrecto
2. **Formato oficial archivo PILA** → No se puede generar archivo válido sin spec
3. **Documentación API Yéminus** → Stub actual no funcional en producción
4. **Credenciales AWS S3 producción** → Storage no disponible
5. **Certificados SSL/TLS** → Ingress K8s requiere certs válidos
6. **Secrets de producción** → DB passwords, JWT secrets, API keys

## 🟠 PRIORIDAD MEDIA - MEJORAN FUNCIONALIDAD

7. Catálogo oficial EPS/AFP/ARL actualizado
8. Templates corporativos para PDFs
9. Parámetros laborales SMLV/Auxilio transporte
10. Proveedor de email transaccional
11. Monitoreo y observabilidad (Datadog/New Relic)
12. Backup automatizado de base de datos

## 🟢 PRIORIDAD BAJA - NICE TO HAVE

13. Integración SSO con Azure AD
14. Dashboards BI avanzados
15. Notificaciones SMS/WhatsApp
16. App móvil nativa
17. Firma electrónica de documentos
18. Integración con contabilidad (SAP/Siigo)

---

## 🎯 ACCIONES INMEDIATAS RECOMENDADAS

### Semana 1
- [ ] Solicitar acceso API Yéminus + documentación + credenciales sandbox
- [ ] Descargar especificación oficial PILA vigente
- [ ] Obtener tablas de retención fiscal DIAN 2024
- [ ] Definir templates PDF con equipo legal/diseño
- [ ] Provisionar infraestructura AWS (S3, RDS, EKS) o alternativa

### Semana 2
- [ ] Implementar cálculo de nómina con parámetros reales
- [ ] Desarrollar generador de archivo PILA según spec oficial
- [ ] Integrar Yéminus con API real (reemplazar stub)
- [ ] Configurar proveedor de email (SendGrid recomendado)
- [ ] Configurar secrets de producción en K8s

### Semana 3
- [ ] Testing end-to-end con datos reales en sandbox
- [ ] Validar archivos PILA generados con operador
- [ ] Pruebas de carga (1000+ empleados)
- [ ] Auditoría de seguridad (penetration testing)
- [ ] Documentación de usuario final

### Semana 4
- [ ] Deploy a ambiente de staging
- [ ] UAT (User Acceptance Testing) con usuarios reales
- [ ] Migración de datos históricos (si aplica)
- [ ] Capacitación a usuarios RH
- [ ] Go-live producción con subset de empleados

---

## 📋 INFORMACIÓN REQUERIDA POR STAKEHOLDER

### Equipo Legal
- Políticas de retención de documentos
- Requisitos de firma electrónica
- Compliance GDPR/LOPD (si aplica internacional)
- Auditoría de trazabilidad requerida

### Finanzas/Contabilidad
- Integración con sistema contable existente
- Centros de costo y contabilización
- Formatos de exportación requeridos
- Códigos PUC para cuentas contables

### IT/Infraestructura
- Presupuesto cloud mensual aprobado
- Políticas de backup y DR (disaster recovery)
- SLAs requeridos (uptime %, RTO, RPO)
- Ventanas de mantenimiento permitidas

### Recursos Humanos
- Flujos de aprobación de nómina
- Niveles de acceso y roles adicionales
- Calendario de nómina (quincenal/mensual)
- Políticas de confidencialidad

---

## 🚨 RIESGOS IDENTIFICADOS

Ver sección de **Riesgos Técnicos** en documento principal.

---

## ✅ CÓMO USAR STUBS MIENTRAS SE OBTIENE INFO

### 1. Cálculo de Nómina
```typescript
// packages/backend/src/payroll/payroll.service.ts
// Stub simplificado, reemplazar con cálculo real
calculatePayroll(baseSalary: number) {
  const health = baseSalary * 0.04;
  const pension = baseSalary * 0.04;
  // TODO: Agregar retención, parafiscales, etc.
  return { health, pension, netPay: baseSalary - health - pension };
}
```

### 2. Yéminus Integration
```typescript
// packages/backend/src/integrations/yeminus.adapter.ts
// Stub que simula respuesta exitosa
// Reemplazar con llamada HTTP real cuando se tenga API docs
```

### 3. PILA Generator
```typescript
// packages/backend/src/payroll/pila-generator.service.ts
// Stub que genera archivo de texto básico
// Reemplazar con formato oficial completo
```

---

## 📞 CONTACTOS SUGERIDOS

- **UGPP**: Información oficial PILA → www.ugpp.gov.co
- **Yéminus**: Soporte desarrolladores → soporte@yeminus.com
- **DIAN**: Tablas tributarias → www.dian.gov.co
- **MinTrabajo**: Normatividad laboral → www.mintrabajo.gov.co
- **AWS**: Soporte técnico → support.aws.amazon.com (Enterprise plan recomendado)

---

**NOTA IMPORTANTE**: Este checklist debe revisarse y actualizarse semanalmente durante la implementación. Priorizar obtención de información crítica marcada como FALTANTE CRÍTICO antes de go-live.
