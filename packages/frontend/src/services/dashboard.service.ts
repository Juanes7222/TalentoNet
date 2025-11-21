import apiClient from '../lib/api-client';

export interface DashboardStats {
  employeesCount: number;
  employeesChange: number;
  payrollCount: number;
  payrollChange: number;
  documentsCount: number;
  documentsChange: number;
}

export interface PayrollTrend {
  month: string;
  count: number;
  total?: number;
}

export interface RecentActivity {
  id: string;
  description: string;
  status: 'completed' | 'pending' | 'in_progress';
  date: string;
}

export interface PendingSummary {
  pendingReview: number;
  upcomingSettlements: number;
  pendingDocuments: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const { data } = await apiClient.get('/dashboard/stats');
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Devolver datos por defecto en caso de error
      return {
        employeesCount: 0,
        employeesChange: 0,
        payrollCount: 0,
        payrollChange: 0,
        documentsCount: 0,
        documentsChange: 0,
      };
    }
  },

  async getPayrollTrend(): Promise<PayrollTrend[]> {
    try {
      const { data } = await apiClient.get('/dashboard/payroll-trend');
      return data;
    } catch (error) {
      console.error('Error fetching payroll trend:', error);
      // Devolver datos vacíos en caso de error
      return [];
    }
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const { data } = await apiClient.get('/dashboard/recent-activity');
      return data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  async getPendingSummary(): Promise<PendingSummary> {
    try {
      const { data } = await apiClient.get('/dashboard/pending-summary');
      return data;
    } catch (error) {
      console.error('Error fetching pending summary:', error);
      return {
        pendingReview: 0,
        upcomingSettlements: 0,
        pendingDocuments: 0,
      };
    }
  },
};
