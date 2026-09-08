import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  ingresosTotales: number = 0;
  gastosTotales: number = 0;
  balanceNeto: number = 0;
  porcentajeIngresos: number = 50;
  porcentajeGastos: number = 50;
  
  // Alturas para la gráfica basadas en la referencia visual (máximo 30)
  alturaIngresos: number = 0;
  alturaGastos: number = 0;

  constructor(private transactionService: TransactionService, private router: Router) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const totales = this.transactionService.obtenerTotales();
    this.ingresosTotales = totales.ingresos;
    this.gastosTotales = totales.gastos;
    this.balanceNeto = totales.balance;

    const mayorMonto = Math.max(this.ingresosTotales, this.gastosTotales, 1);
    this.alturaIngresos = Math.round((this.ingresosTotales / mayorMonto) * 220);
    this.alturaGastos = Math.round((this.gastosTotales / mayorMonto) * 220);

    if (this.ingresosTotales > 0 && this.alturaIngresos < 30) this.alturaIngresos = 30;
    if (this.gastosTotales > 0 && this.alturaGastos < 30) this.alturaGastos = 30;

    const sumaTotal = this.ingresosTotales + this.gastosTotales;
    if (sumaTotal > 0) {
      this.porcentajeIngresos = Math.round((this.ingresosTotales / sumaTotal) * 100);
      this.porcentajeGastos = 100 - this.porcentajeIngresos;
    } else {
      this.porcentajeIngresos = 0;
      this.porcentajeGastos = 0;
    }
  }

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
}