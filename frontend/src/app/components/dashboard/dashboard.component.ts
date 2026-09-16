import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Transaction, TransactionService } from '../../services/transaction.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  transacciones: Transaction[] = [];
  private doughnutChart: any;
  private barChart: any;

  constructor(
    private transactionService: TransactionService, 
    private router: Router,
    private cdr: ChangeDetectorRef // <- Inyectamos el detector de cambios
  ) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    this.transactionService.obtenerTransacciones().subscribe({
      next: (data) => {
        this.transacciones = (data || []).map((t: any) => ({
          ...t,
          tipo: (t.tipo || '').toLowerCase().trim(),
          categoria: t.categoria || 'General',
          monto: Number(t.monto || 0)
        }));

        // Forzamos a Angular a actualizar la vista y los getters inmediatamente
        this.cdr.detectChanges();

        setTimeout(() => this.actualizarGraficas(), 100);
      },
      error: (err) => console.error('Error al cargar datos del dashboard:', err)
    });
  }

  get ingresosTotales(): number {
    return this.transacciones
      .filter((t: any) => t.tipo === 'ingreso')
      .reduce((acc, t) => acc + Number(t.monto), 0);
  }

  get egresosTotales(): number {
    return this.transacciones
      .filter((t: any) => t.tipo === 'egreso')
      .reduce((acc, t) => acc + Number(t.monto), 0);
  }

  get balanceNeto(): number {
    return this.ingresosTotales - this.egresosTotales;
  }

  get transaccionesRecientes(): Transaction[] {
    return [...this.transacciones].reverse().slice(0, 5);
  }

  actualizarGraficas() {
    // 1. Gráfica de Barras Dobles (Ingresos vs Egresos por Categoría) a la izquierda
    const canvasBar = document.getElementById('barChart') as HTMLCanvasElement;
    if (canvasBar) {
      if (this.barChart) this.barChart.destroy();

      const categoriasSet = new Set<string>();
      this.transacciones.forEach(t => {
        if (t.categoria) categoriasSet.add(t.categoria);
      });
      const labels = Array.from(categoriasSet);

      const ingresosData: number[] = [];
      const egresosData: number[] = [];

      labels.forEach(cat => {
        const totalIng = this.transacciones
          .filter((t: any) => t.tipo === 'ingreso' && t.categoria === cat)
          .reduce((acc, t) => acc + Number(t.monto), 0);
        
        const totalEgr = this.transacciones
          .filter((t: any) => t.tipo === 'egreso' && t.categoria === cat)
          .reduce((acc, t) => acc + Number(t.monto), 0);

        ingresosData.push(totalIng);
        egresosData.push(totalEgr);
      });

      this.barChart = new Chart(canvasBar, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['Sin datos'],
          datasets: [
            {
              label: 'Ingresos',
              data: labels.length > 0 ? ingresosData : [0],
              backgroundColor: '#10b981',
              borderRadius: 4
            },
            {
              label: 'Egresos',
              data: labels.length > 0 ? egresosData : [0],
              backgroundColor: '#ef4444',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#ffffff', font: { size: 12 } }
            }
          },
          scales: {
            x: {
              ticks: { color: '#ffffff' },
              grid: { display: false }
            },
            y: {
              ticks: { color: '#ffffff' },
              grid: { color: 'rgba(255,255,255,0.08)' }
            }
          }
        }
      });
    }

    // 2. Gráfica de Dona (Distribución general) a la derecha
    const canvasDoughnut = document.getElementById('financialChart') as HTMLCanvasElement;
    if (canvasDoughnut) {
      if (this.doughnutChart) this.doughnutChart.destroy();
      this.doughnutChart = new Chart(canvasDoughnut, {
        type: 'doughnut',
        data: {
          labels: ['Ingresos', 'Egresos'],
          datasets: [{
            data: [this.ingresosTotales, this.egresosTotales],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#ffffff', font: { size: 12 } }
            }
          }
        }
      });
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}