package com.emporio.pet.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDTO {

    private int agendamentosHoje;
    private double agendamentosHojeVsOntem;

    private int novosClientesMes;
    private double novosClientesMesVsPassado;

    private BigDecimal faturamentoMes;
    private double faturamentoMesVsPassado;

    private List<RecentActivityDTO> recentActivities;

    public int getAgendamentosHoje() {
        return agendamentosHoje;
    }

    public void setAgendamentosHoje(int agendamentosHoje) {
        this.agendamentosHoje = agendamentosHoje;
    }

    public double getAgendamentosHojeVsOntem() {
        return agendamentosHojeVsOntem;
    }

    public void setAgendamentosHojeVsOntem(double agendamentosHojeVsOntem) {
        this.agendamentosHojeVsOntem = agendamentosHojeVsOntem;
    }

    public int getNovosClientesMes() {
        return novosClientesMes;
    }

    public void setNovosClientesMes(int novosClientesMes) {
        this.novosClientesMes = novosClientesMes;
    }

    public double getNovosClientesMesVsPassado() {
        return novosClientesMesVsPassado;
    }

    public void setNovosClientesMesVsPassado(double novosClientesMesVsPassado) {
        this.novosClientesMesVsPassado = novosClientesMesVsPassado;
    }

    public BigDecimal getFaturamentoMes() {
        return faturamentoMes;
    }

    public void setFaturamentoMes(BigDecimal faturamentoMes) {
        this.faturamentoMes = faturamentoMes;
    }

    public double getFaturamentoMesVsPassado() {
        return faturamentoMesVsPassado;
    }

    public void setFaturamentoMesVsPassado(double faturamentoMesVsPassado) {
        this.faturamentoMesVsPassado = faturamentoMesVsPassado;
    }

    public List<RecentActivityDTO> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<RecentActivityDTO> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
