import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { Transaction, TransactionService } from '../../services/transaction.service';
import { getErrorMessage } from '../../utils/http-error-message';

Chart.register(...registerables);

const COLOR_INGRESO = '#00e676';
const COLOR_EGRESO = '#ff3d00';
const COLOR_TEXTO = '#e5e5e5';

function formatoQ(valor: unknown, decimales = 2): string {
  return `Q${Number(valor).toLocaleString('es-GT', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}`;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);
  readonly session = inject(SessionService);

  // static: true -> los canvas existen desde el inicio (no están dentro de un @if)
  @ViewChild('barCanvas', { static: true }) private barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas', { static: true }) private doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  private barChart?: Chart;
  private doughnutChart?: Chart;

  // Estado con signals: Angular 22 usa OnPush por defecto, así la vista se actualiza sola
  readonly transacciones = signal<Transaction[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly avatarFailed = signal(false);

  readonly ingresosTotales = computed(() => this.sumar('ingreso'));
  readonly egresosTotales = computed(() => this.sumar('egreso'));
  readonly balanceNeto = computed(() => this.ingresosTotales() - this.egresosTotales());

  /** El backend ya las envía ordenadas de la más reciente a la más antigua. */
  readonly transaccionesRecientes = computed(() => this.transacciones().slice(0, 5));

  ngOnInit(): void {
    this.cargarDatosDashboard();
    // Mantiene actualizados nombre y foto (por ejemplo, si vinculó Google)
    this.authService.refreshUser().subscribe({ error: () => undefined });
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.doughnutChart?.destroy();
  }

  cargarDatosDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionService.obtenerTransacciones().subscribe({
      next: (data) => {
        this.transacciones.set(data);
        this.isLoading.set(false);
        this.actualizarGraficas();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(getErrorMessage(err, 'No se pudieron cargar sus datos.'));
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private sumar(tipo: Transaction['tipo']): number {
    return this.transacciones()
      .filter((t) => t.tipo === tipo)
      .reduce((acc, t) => acc + t.monto, 0);
  }

  private actualizarGraficas(): void {
    this.crearGraficaBarras();
    this.crearGraficaDona();
  }

  /** Ingresos vs egresos por categoría */
  private crearGraficaBarras(): void {
    this.barChart?.destroy();

    const transacciones = this.transacciones();
    const categorias = Array.from(new Set(transacciones.map((t) => t.categoria)));
    const totalPor = (tipo: Transaction['tipo'], categoria: string) =>
      transacciones
        .filter((t) => t.tipo === tipo && t.categoria === categoria)
        .reduce((acc, t) => acc + t.monto, 0);

    const hayDatos = categorias.length > 0;

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: hayDatos ? categorias : ['Sin movimientos'],
        datasets: [
          {
            label: 'Ingresos',
            data: hayDatos ? categorias.map((c) => totalPor('ingreso', c)) : [0],
            backgroundColor: COLOR_INGRESO,
            borderRadius: 4,
          },
          {
            label: 'Egresos',
            data: hayDatos ? categorias.map((c) => totalPor('egreso', c)) : [0],
            backgroundColor: COLOR_EGRESO,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: COLOR_TEXTO, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatoQ(ctx.raw)}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: COLOR_TEXTO }, grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { color: COLOR_TEXTO, callback: (value) => formatoQ(value, 0) },
            grid: { color: 'rgba(255,255,255,0.08)' },
          },
        },
      },
    });
  }

  /** Distribución general ingresos / egresos */
  private crearGraficaDona(): void {
    this.doughnutChart?.destroy();

    const ingresos = this.ingresosTotales();
    const egresos = this.egresosTotales();
    const hayDatos = ingresos > 0 || egresos > 0;

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: hayDatos ? ['Ingresos', 'Egresos'] : ['Sin movimientos'],
        datasets: [
          {
            data: hayDatos ? [ingresos, egresos] : [1],
            backgroundColor: hayDatos ? [COLOR_INGRESO, COLOR_EGRESO] : ['#2c313c'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: COLOR_TEXTO, font: { size: 12 } } },
          tooltip: {
            enabled: hayDatos,
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatoQ(ctx.raw)}`,
            },
          },
        },
      },
    });
  }
}
