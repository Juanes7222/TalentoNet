-- =====================================================
-- SEED: Módulo de Selección y Contratación
-- Versión: 002
-- Fecha: 2025-10-24
-- Descripción: Datos de prueba para vacantes, candidatos y entrevistas
-- =====================================================

DO $$
DECLARE
    user_rh_id UUID;
    user_admin_id UUID;
    vacancy_dev_id UUID;
    vacancy_rh_id UUID;
    candidate1_id UUID;
    candidate2_id UUID;
    candidate3_id UUID;
BEGIN
    -- Obtener IDs de usuarios existentes
    SELECT id INTO user_rh_id FROM users WHERE email = 'rh@talentonet.com';
    SELECT id INTO user_admin_id FROM users WHERE email = 'admin@talentonet.com';

    -- =====================================================
    -- 1. CREAR VACANTES
    -- =====================================================
    
    -- Vacante 1: Desarrollador Full Stack
    INSERT INTO vacancies (
        departamento,
        cargo,
        descripcion,
        cantidad,
        experiencia_requerida,
        nivel_educacion,
        habilidades_requeridas,
        salario_min,
        salario_max,
        fecha_solicitud,
        estado,
        creador_id
    ) VALUES (
        'Tecnología',
        'Desarrollador Full Stack Senior',
        'Buscamos un desarrollador full stack con experiencia en React, Node.js y PostgreSQL para liderar proyectos de transformación digital.',
        2,
        '3-5 años en desarrollo web',
        'Profesional en Ingeniería de Sistemas',
        ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
        6000000,
        8000000,
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        'abierta',
        user_rh_id
    ) RETURNING id INTO vacancy_dev_id;

    -- Vacante 2: Analista de RRHH
    INSERT INTO vacancies (
        departamento,
        cargo,
        descripcion,
        cantidad,
        experiencia_requerida,
        nivel_educacion,
        habilidades_requeridas,
        salario_min,
        salario_max,
        fecha_solicitud,
        estado,
        creador_id
    ) VALUES (
        'Recursos Humanos',
        'Analista de Recursos Humanos',
        'Profesional para gestión de nómina, afiliaciones y procesos de contratación.',
        1,
        '2-4 años en gestión de nómina',
        'Profesional en Administración o Psicología',
        ARRAY['Nómina', 'Afiliaciones', 'Legislación laboral', 'Excel avanzado'],
        3500000,
        4500000,
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        'abierta',
        user_rh_id
    ) RETURNING id INTO vacancy_rh_id;

    -- =====================================================
    -- 2. CREAR CANDIDATOS PARA VACANTE DE DESARROLLADOR
    -- =====================================================
    
    -- Candidato 1: Carlos Gómez - Postulado
    INSERT INTO candidates (
        vacancy_id,
        nombre,
        apellido,
        cedula,
        email,
        telefono,
        fecha_nacimiento,
        experiencia_anios,
        ultimo_cargo,
        ultima_empresa,
        nivel_educacion,
        expectativa_salarial,
        disponibilidad,
        fecha_postulacion,
        estado_proceso,
        notas,
        puntuacion
    ) VALUES (
        vacancy_dev_id,
        'Carlos',
        'Gómez',
        '1098765432',
        'carlos.gomez@email.com',
        '3201234567',
        '1995-03-15',
        4,
        'Desarrollador Full Stack',
        'Tech Solutions SAS',
        'Ingeniero de Sistemas',
        7000000,
        'Inmediata',
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        'postulado',
        'Candidato con buen perfil técnico en React y Node.js',
        NULL
    ) RETURNING id INTO candidate1_id;

    -- Candidato 2: María Rodríguez - Preseleccionada
    INSERT INTO candidates (
        vacancy_id,
        nombre,
        apellido,
        cedula,
        email,
        telefono,
        fecha_nacimiento,
        experiencia_anios,
        ultimo_cargo,
        ultima_empresa,
        nivel_educacion,
        expectativa_salarial,
        disponibilidad,
        fecha_postulacion,
        estado_proceso,
        notas,
        puntuacion
    ) VALUES (
        vacancy_dev_id,
        'María',
        'Rodríguez',
        '1087654321',
        'maria.rodriguez@email.com',
        '3109876543',
        '1992-07-22',
        5,
        'Tech Lead',
        'Innovatech Colombia',
        'Ingeniera de Sistemas',
        8000000,
        '15 días',
        CURRENT_TIMESTAMP - INTERVAL '8 days',
        'preseleccionado',
        'Excelente perfil, experiencia en arquitectura de software',
        85
    ) RETURNING id INTO candidate2_id;

    -- Candidato 3: Andrés Martínez - Entrevistado
    INSERT INTO candidates (
        vacancy_id,
        nombre,
        apellido,
        cedula,
        email,
        telefono,
        fecha_nacimiento,
        experiencia_anios,
        ultimo_cargo,
        ultima_empresa,
        nivel_educacion,
        expectativa_salarial,
        disponibilidad,
        fecha_postulacion,
        estado_proceso,
        notas,
        puntuacion
    ) VALUES (
        vacancy_dev_id,
        'Andrés',
        'Martínez',
        '1076543210',
        'andres.martinez@email.com',
        '3187654321',
        '1993-11-10',
        3,
        'Desarrollador Backend',
        'StartupXYZ',
        'Ingeniero de Sistemas',
        6500000,
        'Inmediata',
        CURRENT_TIMESTAMP - INTERVAL '12 days',
        'entrevistado',
        'Buena actitud, conocimientos sólidos en Node.js',
        78
    ) RETURNING id INTO candidate3_id;

    -- =====================================================
    -- 3. CREAR CANDIDATOS PARA VACANTE DE RRHH
    -- =====================================================
    
    INSERT INTO candidates (
        vacancy_id,
        nombre,
        apellido,
        cedula,
        email,
        telefono,
        fecha_nacimiento,
        experiencia_anios,
        ultimo_cargo,
        ultima_empresa,
        nivel_educacion,
        expectativa_salarial,
        disponibilidad,
        fecha_postulacion,
        estado_proceso,
        notas,
        puntuacion
    ) VALUES (
        vacancy_rh_id,
        'Laura',
        'Pérez',
        '1065432109',
        'laura.perez@email.com',
        '3156789012',
        '1994-05-18',
        3,
        'Analista de Nómina',
        'Empresas ABC',
        'Administradora de Empresas',
        4000000,
        'Inmediata',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        'postulado',
        'Experiencia en nómina y afiliaciones',
        NULL
    );

    -- =====================================================
    -- 4. CREAR ENTREVISTAS
    -- =====================================================
    
    -- Entrevista 1: María Rodríguez - Completada
    INSERT INTO interviews (
        candidate_id,
        fecha,
        duracion_minutos,
        entrevistador_id,
        tipo,
        resultado,
        puntuacion,
        notas,
        fortalezas,
        debilidades,
        estado
    ) VALUES (
        candidate2_id,
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        60,
        user_rh_id,
        'virtual',
        'aprobado',
        85,
        'Candidata con excelente perfil técnico y de liderazgo. Demostró conocimientos sólidos en arquitectura de microservicios.',
        ARRAY['Liderazgo técnico', 'Arquitectura de software', 'Comunicación efectiva'],
        ARRAY['Poca experiencia en DevOps'],
        'completada'
    );

    -- Entrevista 2: Andrés Martínez - Completada
    INSERT INTO interviews (
        candidate_id,
        fecha,
        duracion_minutos,
        entrevistador_id,
        tipo,
        resultado,
        puntuacion,
        notas,
        fortalezas,
        debilidades,
        estado
    ) VALUES (
        candidate3_id,
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        45,
        user_admin_id,
        'tecnica',
        'aprobado',
        78,
        'Buen desempeño en prueba técnica. Código limpio y bien documentado.',
        ARRAY['Node.js', 'Buenas prácticas', 'Testing'],
        ARRAY['Frontend menos desarrollado', 'Falta experiencia en React'],
        'completada'
    );

    -- Entrevista 3: Carlos Gómez - Programada
    INSERT INTO interviews (
        candidate_id,
        fecha,
        duracion_minutos,
        entrevistador_id,
        tipo,
        resultado,
        puntuacion,
        notas,
        estado
    ) VALUES (
        candidate1_id,
        CURRENT_TIMESTAMP + INTERVAL '2 days',
        60,
        user_rh_id,
        'presencial',
        'pendiente',
        NULL,
        'Primera entrevista programada',
        'programada'
    );

    -- =====================================================
    -- 5. REGISTRAR HISTORIAL DE CAMBIOS DE ESTADO
    -- =====================================================
    
    -- Historial María Rodríguez
    INSERT INTO candidate_state_history (
        candidate_id,
        estado_anterior,
        estado_nuevo,
        usuario_id,
        fecha,
        comentario
    ) VALUES 
    (
        candidate2_id,
        'postulado',
        'preseleccionado',
        user_rh_id,
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        'Perfil cumple con todos los requisitos técnicos'
    ),
    (
        candidate2_id,
        'preseleccionado',
        'entrevistado',
        user_rh_id,
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        'Entrevista técnica completada con éxito'
    );

    -- Historial Andrés Martínez
    INSERT INTO candidate_state_history (
        candidate_id,
        estado_anterior,
        estado_nuevo,
        usuario_id,
        fecha,
        comentario
    ) VALUES 
    (
        candidate3_id,
        'postulado',
        'preseleccionado',
        user_rh_id,
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        'Experiencia en Node.js destacada'
    ),
    (
        candidate3_id,
        'preseleccionado',
        'entrevistado',
        user_rh_id,
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        'Prueba técnica aprobada'
    );

    RAISE NOTICE 'Seed completado exitosamente:';
    RAISE NOTICE '- 2 vacantes creadas';
    RAISE NOTICE '- 4 candidatos creados';
    RAISE NOTICE '- 3 entrevistas programadas/completadas';
    RAISE NOTICE '- 4 registros de historial de estados';
END $$;
