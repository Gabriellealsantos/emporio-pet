import { RecentActivity } from "./RecentActivity";

export interface DashboardData {
  agendamentosHoje: number;
  agendamentosHojeVsOntem: number;
  novosClientesMes: number;
  novosClientesMesVsPassado: number;
  faturamentoMes: number;
  faturamentoMesVsPassado: number;
  recentActivities: RecentActivity[];
}
