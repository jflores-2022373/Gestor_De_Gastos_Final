import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Transaction, TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  vistaActual: 'ingreso' | 'egreso' = 'ingreso';
  
  descripcion: string = '';
  monto: number | null = null;
  categoria: string = '';
  fecha: string = new Date().toISOString().split('T')[0];
  editandoId: number | null = null;

  transacciones: Transaction[] = [];

  categoriasIngresos: string[] = ['Salario', 'Ventas', 'Inversiones', 'Otros Ingresos'];
  categoriasEgresos: string[] = ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento'];

  constructor(private transactionService: TransactionService, private router: Router) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.transactionService.obtenerTransacciones().subscribe({
      next: (data) => this.transacciones = data,
      error: (err) => console.error('Error al cargar transacciones:', err)
    });
  }

  cambiarVista(vista: 'ingreso' | 'egreso') {
    this.vistaActual = vista;
    this.limpiarFormulario();
  }

  get listaFiltrada() {
    return this.transacciones.filter(t => t.tipo === this.vistaActual);
  }

  get ingresosTotales(): number {
    return this.transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((acc, t) => acc + Number(t.monto), 0);
  }

  get egresosTotales(): number {
    return this.transacciones
      .filter(t => t.tipo === 'egreso')
      .reduce((acc, t) => acc + Number(t.monto), 0);
  }

  get balanceNeto(): number {
    return this.ingresosTotales - this.egresosTotales;
  }

  cargarParaEditar(transaccion: Transaction) {
    if (!transaccion.id) return;
    this.editandoId = transaccion.id;
    this.descripcion = transaccion.descripcion;
    this.monto = transaccion.monto;
    this.categoria = transaccion.categoria;
    if (transaccion.fecha) {
      this.fecha = typeof transaccion.fecha === 'string' ? transaccion.fecha.split('T')[0] : new Date(transaccion.fecha).toISOString().split('T')[0];
    }
    this.vistaActual = transaccion.tipo as 'ingreso' | 'egreso';
  }

  guardarTransaccion() {
    if (!this.descripcion || !this.monto || !this.categoria || !this.fecha) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const nueva: Transaction = {
      descripcion: this.descripcion,
      monto: Math.abs(this.monto),
      tipo: this.vistaActual,
      categoria: this.categoria,
      fecha: this.fecha
    };

    this.transactionService.agregarTransaccion(nueva).subscribe({
      next: () => {
        this.cargarDatos();
        this.limpiarFormulario();
      },
      error: (err) => console.error('Error al guardar:', err)
    });
  }

  eliminarTransaccion(id?: number) {
    if (!id) return;
    this.transactionService.eliminarTransaccion(id).subscribe({
      next: () => this.cargarDatos(),
      error: (err) => console.error('Error al eliminar:', err)
    });
  }

  limpiarFormulario() {
    this.descripcion = '';
    this.monto = null;
    this.categoria = '';
    this.fecha = new Date().toISOString().split('T')[0];
    this.editandoId = null;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}