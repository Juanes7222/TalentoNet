import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
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
            <Route path="/employees" element={<EmployeesListPage />} />
            <Route path="/employees/new" element={<EmployeeFormPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
            
            {/* Rutas de reclutamiento */}
            <Route path="/recruitment/vacancies" element={<VacanciesListPage />} />
            <Route path="/recruitment/vacancies/new" element={<VacancyFormPage />} />
            <Route path="/recruitment/vacancies/:id" element={<VacancyDetailPage />} />
            <Route path="/recruitment/vacancies/:id/edit" element={<VacancyEditPage />} />
            <Route path="/recruitment/candidates" element={<CandidatesListPage />} />
            <Route path="/recruitment/candidates/new" element={<CandidateFormPage />} />
            <Route path="/recruitment/candidates/:id" element={<CandidateDetailPage />} />
            
            {/* Rutas de afiliaciones */}
            <Route path="/affiliations" element={<AffiliationsListPage />} />
            <Route path="/affiliations/new" element={<AffiliationFormPage />} />
            <Route path="/affiliations/:id" element={<AffiliationDetailPage />} />
            <Route path="/affiliations/report" element={<AffiliationReportPage />} />
            
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
