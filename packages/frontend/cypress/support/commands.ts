/// <reference types="cypress" />

// ***********************************************
// Comandos personalizados de Cypress para TalentoNet
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login personalizado que obtiene token y lo guarda en localStorage
       * @example cy.login('rh@talentonet.com', 'Password123!')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Navegar con token de autenticación incluido
       * @example cy.authenticatedVisit('/employees')
       */
      authenticatedVisit(url: string): Chainable<void>;

      /**
       * Esperar a que desaparezca el spinner de carga
       * @example cy.waitForLoading()
       */
      waitForLoading(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api/v1';

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('access_token');
    
    window.localStorage.setItem('access_token', response.body.access_token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('authenticatedVisit', (url: string) => {
  const token = window.localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No hay token de autenticación. Ejecuta cy.login() primero.');
  }

  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.setItem('access_token', token);
    },
  });
});

Cypress.Commands.add('waitForLoading', () => {
  // Esperar a que desaparezca cualquier indicador de carga
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
});

// Prevenir errores no capturados en tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // útil para errores de terceros que no afectan la funcionalidad
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

export {};
