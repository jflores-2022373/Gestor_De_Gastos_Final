import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  TipoTransaccion,
  Transaction,
  TransactionInput,
  TransactionService,
} from '../../services/transaction.service';
import { aFechaInput, hoyLocal } from '../../utils/fechas';
import { getErrorMessage } from '../../utils/http-error-message';

const CATEGORIAS_INGRESOS = ['Salario', 'Ventas', 'Inversiones', 'Otros Ingresos'];
const CATEGORIAS_EGRESOS = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Otros Gastos',
];

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule, RouterModule, DecimalPipe, DatePipe],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
})
export class TransactionsComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);

  readonly hoy = hoyLocal();

  // Todo el estado usa signals: Angular 22 usa OnPush por defecto y así
  // la vista se actualiza sola cuando responde el servidor.
  readonly vistaActual = signal<TipoTransaccion>('ingreso');

  // Campos del formulario (se enlazan con [(ngModel)])
  readonly descripcion = signal('');
  readonly monto = signal<number | null>(null);
  readonly categoria = signal('');
  readonly fecha = signal(hoyLocal());
  readonly editandoId = signal<number | null>(null);

  readonly transacciones = signal<Transaction[]>([]);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly eliminandoId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly categoriasActuales = computed(() => {
    const base = this.vistaActual() === 'ingreso' ? CATEGORIAS_INGRESOS : CATEGORIAS_EGRESOS;
    const actual = this.categoria();
    // Si se edita un registro con una categoría que ya no está en la lista, se conserva
    return actual && !base.includes(actual) ? [...base, actual] : base;
  });

  readonly listaFiltrada = computed(() =>
    this.transacciones().filter((t) => t.tipo === this.vistaActual())
  );

  readonly ingresosTotales = computed(() => this.sumar('ingreso'));
  readonly egresosTotales = computed(() => this.sumar('egreso'));
  readonly balanceNeto = computed(() => this.ingresosTotales() - this.egresosTotales());

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isLoading.set(true);
    this.transactionService.obtenerTransacciones().subscribe({
      next: (data) => {
        this.transacciones.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(getErrorMessage(err, 'No se pudieron cargar las transacciones.'));
      },
    });
  }

  cambiarVista(vista: TipoTransaccion): void {
    if (this.vistaActual() === vista) return;
    this.vistaActual.set(vista);
    this.limpiarFormulario();
    this.limpiarMensajes();
  }

  cargarParaEditar(transaccion: Transaction): void {
    this.limpiarMensajes();
    this.editandoId.set(transaccion.id);
    this.vistaActual.set(transaccion.tipo);
    this.descripcion.set(transaccion.descripcion);
    this.monto.set(transaccion.monto);
    this.categoria.set(transaccion.categoria);
    this.fecha.set(aFechaInput(transaccion.fecha));
  }

  guardarTransaccion(): void {
    this.limpiarMensajes();

    const descripcion = this.descripcion().trim();
    const montoRaw = this.monto();
    const monto = Number(montoRaw);

    if (!descripcion || !this.categoria() || !this.fecha() || montoRaw === null) {
      this.errorMessage.set('Complete todos los campos: descripción, monto, categoría y fecha.');
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      this.errorMessage.set('El monto debe ser mayor que cero.');
      return;
    }

    const data: TransactionInput = {
      descripcion,
      monto: Math.round(monto * 100) / 100,
      tipo: this.vistaActual(),
      categoria: this.categoria(),
      fecha: this.fecha(),
    };

    const id = this.editandoId();
    const peticion =
      id !== null
        ? this.transactionService.actualizarTransaccion(id, data)
        : this.transactionService.crearTransaccion(data);

    this.isSaving.set(true);

    peticion.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(
          id !== null
            ? 'Registro actualizado correctamente.'
            : `${data.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} guardado correctamente.`
        );
        this.limpiarFormulario();
        this.cargarDatos();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(getErrorMessage(err, 'No se pudo guardar el registro.'));
      },
    });
  }

  eliminarTransaccion(transaccion: Transaction): void {
    const confirmado = confirm(
      `¿Eliminar "${transaccion.descripcion}" por Q${transaccion.monto.toFixed(2)}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    this.limpiarMensajes();
    this.eliminandoId.set(transaccion.id);

    this.transactionService.eliminarTransaccion(transaccion.id).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        if (this.editandoId() === transaccion.id) {
          this.limpiarFormulario();
        }
        this.successMessage.set('Registro eliminado.');
        this.cargarDatos();
      },
      error: (err) => {
        this.eliminandoId.set(null);
        this.errorMessage.set(getErrorMessage(err, 'No se pudo eliminar el registro.'));
        this.cargarDatos();
      },
    });
  }

  limpiarFormulario(): void {
    this.descripcion.set('');
    this.monto.set(null);
    this.categoria.set('');
    this.fecha.set(hoyLocal());
    this.editandoId.set(null);
  }

  logout(): void {
    this.authService.logout();
  }

  private limpiarMensajes(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private sumar(tipo: TipoTransaccion): number {
    return this.transacciones()
      .filter((t) => t.tipo === tipo)
      .reduce((acc, t) => acc + t.monto, 0);
  }
}
