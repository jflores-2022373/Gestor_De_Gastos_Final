import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transacciones: any[] = [];
  vistaActual: 'ingreso' | 'gasto' = 'ingreso';

  descripcion: string = '';
  monto: number | null = null;
  categoria: string = '';
  editIndex: number | null = null;

  categoriasIngreso = ['Salario', 'Inversiones', 'Freelance', 'Ventas', 'Bonos', 'Regalos'];
  categoriasGasto = ['Alimentación y Supermercado', 'Alquiler / Vivienda', 'Servicios Básicos', 'Transporte', 'Entretenimiento', 'Salud / Farmacia'];

  constructor(private transactionService: TransactionService, private router: Router) {}

  ngOnInit(): void {
    this.cargarTransacciones();
  }

  cargarTransacciones(): void {
    this.transacciones = this.transactionService.obtenerTransacciones();
  }

  cambiarVista(tipo: 'ingreso' | 'gasto'): void {
    this.vistaActual = tipo;
    this.categoria = '';
    this.editIndex = null;
    this.descripcion = '';
    this.monto = null;
  }

  get transaccionesFiltradas() {
    return this.transacciones.filter(t => String(t.tipo || '').toLowerCase() === this.vistaActual);
  }

  get totalIngresos(): number {
    return this.transacciones
      .filter(t => String(t.tipo || '').toLowerCase() === 'ingreso')
      .reduce((acc, t) => acc + Number(t.monto || 0), 0);
  }

  get totalGastos(): number {
    return this.transacciones
      .filter(t => String(t.tipo || '').toLowerCase() === 'gasto')
      .reduce((acc, t) => acc + Number(t.monto || 0), 0);
  }

  get balanceNeto(): number {
    return this.totalIngresos - this.totalGastos;
  }

  guardar(): void {
    if (!this.descripcion || this.monto === null || !this.categoria) return;

    const nuevaTransaccion = {
      descripcion: this.descripcion,
      monto: Number(this.monto),
      categoria: this.categoria,
      tipo: this.vistaActual
    };

    if (this.editIndex !== null) {
      const transaccionFiltradaSeleccionada = this.transaccionesFiltradas[this.editIndex];
      const indexReal = this.transacciones.findIndex(t => t === transaccionFiltradaSeleccionada);
      if (indexReal !== -1) {
        this.transactionService.actualizarTransaccion(indexReal, nuevaTransaccion);
      }
      this.editIndex = null;
    } else {
      this.transactionService.agregarTransaccion(nuevaTransaccion);
    }

    this.descripcion = '';
    this.monto = null;
    this.categoria = '';
    this.cargarTransacciones();
  }

  editar(transaccionFiltrada: any): void {
    this.editIndex = this.transaccionesFiltradas.findIndex(t => t === transaccionFiltrada);
    this.descripcion = transaccionFiltrada.descripcion;
    this.monto = transaccionFiltrada.monto;
    this.categoria = transaccionFiltrada.categoria;
  }

  eliminar(transaccionFiltrada: any): void {
    const indexReal = this.transacciones.findIndex(t => t === transaccionFiltrada);
    if (indexReal !== -1) {
      this.transactionService.eliminarTransaccion(indexReal);
      this.cargarTransacciones();
    }
  }

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
}