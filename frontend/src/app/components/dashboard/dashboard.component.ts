import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userEmail: string = 'Usuario';

  ingresosTotales: number = 0;
  gastosTotales: number = 0;
  balanceActual: number = 0;
  
  porcentajeIngresos: number = 0;
  alturaIngresos: number = 20;
  alturaGastos: number = 20;

  constructor(private transactionService: TransactionService, private router: Router) {}

  ngOnInit(): void {
    this.cargarCorreoUsuario();
    this.cargarMetricasDesdeBD();
  }

  cargarCorreoUsuario(): void {
    const storedEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (storedEmail) {
      this.userEmail = storedEmail;
    }
  }

  cargarMetricasDesdeBD(): void {
    this.transactionService.obtenerTransacciones().subscribe({
      next: (transacciones: Transaction[]) => {
        this.ingresosTotales = transacciones
          .filter(t => t.tipo === 'ingreso')
          .reduce((acc, t) => acc + Number(t.monto), 0);

        this.gastosTotales = transacciones
          .filter(t => t.tipo === 'egreso')
          .reduce((acc, t) => acc + Number(t.monto), 0);

        this.balanceActual = this.ingresosTotales - this.gastosTotales;

        const totalSuma = this.ingresosTotales + this.gastosTotales;
        
        if (totalSuma > 0) {
          this.porcentajeIngresos = Math.round((this.ingresosTotales / totalSuma) * 100);
          
          const maxValor = Math.max(this.ingresosTotales, this.gastosTotales, 1);
          this.alturaIngresos = Math.max(30, Math.round((this.ingresosTotales / maxValor) * 160));
          this.alturaGastos = Math.max(30, Math.round((this.gastosTotales / maxValor) * 160));
        } else {
          this.porcentajeIngresos = 0;
          this.alturaIngresos = 20;
          this.alturaGastos = 20;
        }
      },
      error: (err) => console.error('Error al obtener métricas del dashboard:', err)
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}