import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private storageKey = 'spendwise_transacciones';
  private transaccionesSubject = new BehaviorSubject<any[]>(this.cargarInicial());

  transacciones$ = this.transaccionesSubject.asObservable();

  private cargarInicial(): any[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private actualizarStorage(transacciones: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(transacciones));
    this.transaccionesSubject.next(transacciones);
  }

  obtenerTransacciones(): any[] {
    return this.transaccionesSubject.value;
  }

  agregarTransaccion(transaccion: any) {
    const actual = this.obtenerTransacciones();
    const actualizado = [transaccion, ...actual];
    this.actualizarStorage(actualizado);
  }

  actualizarTransaccion(index: number, transaccion: any) {
    const actual = [...this.obtenerTransacciones()];
    actual[index] = transaccion;
    this.actualizarStorage(actual);
  }

  eliminarTransaccion(index: number) {
    const actual = [...this.obtenerTransacciones()];
    actual.splice(index, 1);
    this.actualizarStorage(actual);
  }

  obtenerTotales() {
    const transacciones = this.obtenerTransacciones();
    let ingresos = 0;
    let gastos = 0;
    for (const t of transacciones) {
      const tipo = String(t.tipo || '').toLowerCase();
      if (tipo === 'ingreso') {
        ingresos += Number(t.monto || 0);
      } else if (tipo === 'gasto') {
        gastos += Number(t.monto || 0);
      }
    }
    return {
      ingresos,
      gastos,
      balance: ingresos - gastos
    };
  }
}