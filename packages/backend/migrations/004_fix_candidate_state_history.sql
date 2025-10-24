-- =====================================================
-- MIGRACIÓN: Corrección del sistema de historial de estados de candidatos
-- Versión: 004
-- Fecha: 2025-10-24
-- Descripción: Elimina el trigger automático que causaba conflictos con el registro manual de cambios de estado
-- =====================================================

-- =====================================================
-- 1. ELIMINAR TRIGGER AUTOMÁTICO
-- =====================================================
-- El trigger causaba duplicación y problemas de foreign key
-- El servicio de NestJS maneja el registro de cambios de estado manualmente

DROP TRIGGER IF EXISTS candidate_state_change_logger ON candidates;
DROP FUNCTION IF EXISTS log_candidate_state_change();

-- =====================================================
-- 2. HACER USUARIO_ID NULLABLE TEMPORALMENTE
-- =====================================================
-- Esto permite registros históricos sin usuario cuando sea necesario
-- Por ejemplo, en procesos automáticos o importaciones

ALTER TABLE candidate_state_history 
    ALTER COLUMN usuario_id DROP NOT NULL;

-- =====================================================
-- 3. AGREGAR ÍNDICE PARA CONSULTAS DE AUDITORÍA
-- =====================================================
-- Optimizar consultas que buscan cambios recientes

CREATE INDEX IF NOT EXISTS idx_candidate_state_history_candidate_fecha 
    ON candidate_state_history(candidate_id, fecha DESC);

-- =====================================================
-- COMENTARIOS ACTUALIZADOS
-- =====================================================
COMMENT ON TABLE candidate_state_history IS 'Historial de cambios de estado de candidatos (auditoría). Los cambios son registrados manualmente por el servicio de candidatos.';
COMMENT ON COLUMN candidate_state_history.usuario_id IS 'Usuario que realizó el cambio. Puede ser NULL para procesos automáticos o del sistema.';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
