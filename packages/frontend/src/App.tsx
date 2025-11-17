import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesListPage } from './pages/EmployeesListPage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import VacanciesListPage from './pages/recruitment/VacanciesListPage';
import VacancyFormPage from './pages/recruitment/VacancyFormPage';
import VacancyDetailPage from './pages/recruitment/VacancyDetailPage';
import VacancyEditPage from './pages/recruitment/VacancyEditPage';
import CandidatesListPage from './pages/recruitment/CandidatesListPage';
import CandidateFormPage from './pages/recruitment/CandidateFormPage';
import CandidateDetailPage from './pages/recruitment/CandidateDetailPage';
import AffiliationsListPage from './pages/affiliations/AffiliationsListPage';
import AffiliationFormPage from './pages/affiliations/AffiliationFormPage';
import AffiliationDetailPage from './pages/affiliations/AffiliationDetailPage';
import AffiliationReportPage from './pages/affiliations/AffiliationReportPage';
import PayrollPeriodsPage from './pages/payroll/PayrollPeriodsPage';
import PayrollPeriodDetailPage from './pages/payroll/PayrollPeriodDetailPage';
import SettlementsListPage from './pages/settlements/SettlementsListPage';
import SettlementDetailPage from './pages/settlements/SettlementDetailPage';
import CertificationsListPage from './pages/certifications/CertificationsListPage';
import NewCertificationPage from './pages/certifications/NewCertificationPage';
import { UsersListPage } from './pages/users/UsersListPage';
import { UserFormPage } from './pages/users/UserFormPage';
import { UserDetailPage } from './pages/users/UserDetailPage';
import { RolesListPage } from './pages/roles/RolesListPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employees" element={<ProtectedRoute requiredPermission="employees.read"><EmployeesListPage /></ProtectedRoute>} />
            <Route path="/employees/new" element={<ProtectedRoute requiredPermission="employees.create"><EmployeeFormPage /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute requiredPermission="employees.read"><EmployeeDetailPage /></ProtectedRoute>} />
            <Route path="/employees/:id/edit" element={<ProtectedRoute requiredPermission="employees.update"><EmployeeFormPage /></ProtectedRoute>} />
            
            {/* Rutas de reclutamiento */}
            <Route path="/recruitment/vacancies" element={<ProtectedRoute requiredPermission="recruitment.read"><VacanciesListPage /></ProtectedRoute>} />
            <Route path="/recruitment/vacancies/new" element={<ProtectedRoute requiredPermission="recruitment.create"><VacancyFormPage /></ProtectedRoute>} />
            <Route path="/recruitment/vacancies/:id" element={<ProtectedRoute requiredPermission="recruitment.read"><VacancyDetailPage /></ProtectedRoute>} />
            <Route path="/recruitment/vacancies/:id/edit" element={<ProtectedRoute requiredPermission="recruitment.update"><VacancyEditPage /></ProtectedRoute>} />
            <Route path="/recruitment/candidates" element={<ProtectedRoute requiredPermission="recruitment.read"><CandidatesListPage /></ProtectedRoute>} />
            <Route path="/recruitment/candidates/new" element={<ProtectedRoute requiredPermission="recruitment.create"><CandidateFormPage /></ProtectedRoute>} />
            <Route path="/recruitment/candidates/:id" element={<ProtectedRoute requiredPermission="recruitment.read"><CandidateDetailPage /></ProtectedRoute>} />
            
            {/* Rutas de afiliaciones */}
            <Route path="/affiliations" element={<ProtectedRoute requiredPermission="affiliations.read"><AffiliationsListPage /></ProtectedRoute>} />
            <Route path="/affiliations/new" element={<ProtectedRoute requiredPermission="affiliations.create"><AffiliationFormPage /></ProtectedRoute>} />
            <Route path="/affiliations/:id" element={<ProtectedRoute requiredPermission="affiliations.read"><AffiliationDetailPage /></ProtectedRoute>} />
            <Route path="/affiliations/report" element={<ProtectedRoute requiredPermission="affiliations.read"><AffiliationReportPage /></ProtectedRoute>} />
            
            {/* Rutas de nómina */}
            <Route path="/payroll" element={<ProtectedRoute requiredPermission="payroll.read"><PayrollPeriodsPage /></ProtectedRoute>} />
            <Route path="/payroll/:id" element={<ProtectedRoute requiredPermission="payroll.read"><PayrollPeriodDetailPage /></ProtectedRoute>} />
            
            {/* Rutas de liquidaciones */}
            <Route path="/settlements" element={<ProtectedRoute requiredPermission="settlements.read"><SettlementsListPage /></ProtectedRoute>} />
            <Route path="/settlements/:id" element={<ProtectedRoute requiredPermission="settlements.read"><SettlementDetailPage /></ProtectedRoute>} />
            
            {/* Rutas de certificaciones */}
            <Route path="/certifications" element={<ProtectedRoute requiredPermission="certifications.read"><CertificationsListPage /></ProtectedRoute>} />
            <Route path="/certifications/new" element={<ProtectedRoute requiredPermission="certifications.create"><NewCertificationPage /></ProtectedRoute>} />
            
            {/* Rutas de usuarios */}
            <Route path="/users" element={<ProtectedRoute requiredPermission="users.read"><UsersListPage /></ProtectedRoute>} />
            <Route path="/users/new" element={<ProtectedRoute requiredPermission="users.create"><UserFormPage /></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute requiredPermission="users.read"><UserDetailPage /></ProtectedRoute>} />
            <Route path="/users/:id/edit" element={<ProtectedRoute requiredPermission="users.update"><UserFormPage /></ProtectedRoute>} />
            
            {/* Rutas de roles */}
            <Route path="/roles" element={<ProtectedRoute requiredPermission="roles.manage"><RolesListPage /></ProtectedRoute>} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
