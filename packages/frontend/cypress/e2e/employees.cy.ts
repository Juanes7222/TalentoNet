describe('TalentoNet E2E - Flujo completo de gestión de empleados', () => {
  const baseUrl = 'http://localhost:5173';
  const apiUrl = 'http://localhost:3000/api/v1';
  
  let authToken: string;
  let createdEmployeeId: string;

  before(() => {
    // Login antes de tests
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: 'rh@talentonet.com',
        password: 'Password123!',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      authToken = response.body.access_token;
      window.localStorage.setItem('access_token', authToken);
    });
  });

  beforeEach(() => {
    // Restaurar token en cada test
    window.localStorage.setItem('access_token', authToken);
  });

  it('1. Debe cargar la página de login', () => {
    cy.visit(`${baseUrl}/login`);
    cy.contains('TalentoNet').should('be.visible');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
  });

  it('2. Debe hacer login exitosamente', () => {
    cy.visit(`${baseUrl}/login`);
    
    cy.get('input[name="email"]').type('rh@talentonet.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Verificar redirección al dashboard
    cy.url().should('include', '/dashboard');
  });

  it('3. Debe navegar a la lista de empleados', () => {
    cy.visit(`${baseUrl}/employees`);
    
    cy.contains('Empleados').should('be.visible');
    cy.get('table').should('exist');
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  it('4. Debe filtrar empleados por búsqueda', () => {
    cy.visit(`${baseUrl}/employees`);
    
    cy.get('input[placeholder*="Nombre o identificación"]').type('Juan');
    cy.wait(500); // Esperar debounce
    
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).should('contain.text', 'Juan');
    });
  });

  it('5. Debe abrir formulario de nuevo empleado', () => {
    cy.visit(`${baseUrl}/employees`);
    
    cy.contains('Nuevo Empleado').click();
    cy.url().should('include', '/employees/new');
    cy.contains('Información Personal').should('be.visible');
  });

  it('6. Debe crear un nuevo empleado completo', () => {
    cy.visit(`${baseUrl}/employees/new`);
    
    // Llenar formulario
    cy.get('select[name="identificationType"]').select('CC');
    cy.get('input[name="identificationNumber"]').type('1234567890');
    cy.get('input[name="firstName"]').type('Cypress');
    cy.get('input[name="lastName"]').type('Test Employee');
    cy.get('input[name="dateOfBirth"]').type('1990-05-15');
    cy.get('select[name="gender"]').select('M');
    cy.get('input[name="phone"]').type('3001234567');
    cy.get('input[name="email"]').type('cypress.test@talentonet.com');
    cy.get('input[name="address"]').type('Calle 123 #45-67');
    cy.get('input[name="city"]').type('Bogotá');
    cy.get('input[name="department"]').type('Cundinamarca');
    cy.get('input[name="hireDate"]').type('2024-10-01');
    
    // Enviar formulario
    cy.get('button[type="submit"]').click();
    
    // Verificar éxito
    cy.contains('Empleado creado exitosamente', { timeout: 5000 }).should('be.visible');
    cy.url().should('include', '/employees');
    
    // Verificar que aparece en la lista
    cy.contains('Cypress Test Employee').should('be.visible');
  });

  it('7. Debe validar errores en formulario', () => {
    cy.visit(`${baseUrl}/employees/new`);
    
    // Intentar enviar sin llenar
    cy.get('button[type="submit"]').click();
    
    // Verificar mensajes de error
    cy.contains('es requerido').should('be.visible');
  });

  it('8. Debe ver detalles de un empleado', () => {
    cy.visit(`${baseUrl}/employees`);
    
    // Click en "Ver" del primer empleado
    cy.get('tbody tr').first().within(() => {
      cy.contains('Ver').click();
    });
    
    // Verificar que carga la página de detalles
    cy.url().should('match', /\/employees\/[a-f0-9-]+$/);
    cy.contains('Información Personal').should('be.visible');
    cy.contains('Contratos').should('be.visible');
  });

  it('9. Debe editar un empleado existente', () => {
    cy.visit(`${baseUrl}/employees`);
    
    // Encontrar el empleado creado por Cypress
    cy.contains('Cypress Test Employee').parents('tr').within(() => {
      cy.contains('Editar').click();
    });
    
    // Modificar teléfono
    cy.get('input[name="phone"]').clear().type('3009999999');
    
    // Guardar cambios
    cy.get('button[type="submit"]').click();
    
    // Verificar actualización
    cy.contains('Empleado actualizado exitosamente', { timeout: 5000 }).should('be.visible');
    cy.contains('3009999999').should('be.visible');
  });

  it('10. Debe subir un documento (mock)', () => {
    cy.visit(`${baseUrl}/employees`);
    
    // Ir a detalles del empleado Cypress
    cy.contains('Cypress Test Employee').parents('tr').within(() => {
      cy.contains('Ver').click();
    });
    
    // Ir a la sección de documentos
    cy.contains('Documentos').click();
    
    // Simular subida de archivo
    cy.get('input[type="file"]').selectFile({
      contents: 'cypress/fixtures/sample-document.pdf',
      fileName: 'cedula.pdf',
      mimeType: 'application/pdf',
    }, { force: true });
    
    // Verificar mensaje de éxito (si hay implementación)
    // cy.contains('Documento subido').should('be.visible');
  });

  it('11. Debe aplicar paginación correctamente', () => {
    cy.visit(`${baseUrl}/employees?limit=10`);
    
    // Verificar que muestra máximo 10 items
    cy.get('tbody tr').should('have.length.lte', 10);
    
    // Click en "Siguiente"
    cy.contains('Siguiente').click();
    
    // Verificar que URL cambió
    cy.url().should('include', 'page=2');
  });

  it('12. Debe desactivar un empleado', () => {
    cy.visit(`${baseUrl}/employees`);
    
    // Encontrar el empleado Cypress
    cy.contains('Cypress Test Employee').parents('tr').within(() => {
      cy.contains('Desactivar').click();
    });
    
    // Confirmar en el diálogo
    cy.on('window:confirm', () => true);
    
    // Verificar mensaje de éxito
    cy.contains('Empleado desactivado exitosamente', { timeout: 5000 }).should('be.visible');
    
    // Verificar que ahora aparece como inactivo
    cy.contains('Cypress Test Employee').parents('tr').within(() => {
      cy.contains('Inactivo').should('be.visible');
    });
  });

  it('13. Debe cerrar sesión correctamente', () => {
    cy.visit(`${baseUrl}/dashboard`);
    
    // Click en logout (ajustar selector según implementación)
    cy.get('[data-testid="logout-button"]').click();
    
    // Verificar redirección a login
    cy.url().should('include', '/login');
    
    // Verificar que token fue eliminado
    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.be.null;
    });
  });

  it('14. Debe restringir acceso sin autenticación', () => {
    // Limpiar localStorage
    cy.clearLocalStorage();
    
    // Intentar acceder a ruta protegida
    cy.visit(`${baseUrl}/employees`);
    
    // Debe redirigir a login
    cy.url().should('include', '/login');
  });

  after(() => {
    // Cleanup: eliminar empleado de prueba si es necesario
    // (opcional, depende de estrategia de testing)
  });
});
