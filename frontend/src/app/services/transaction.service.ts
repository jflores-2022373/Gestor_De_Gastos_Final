import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoTransaccion = 'ingreso' | 'egreso';

export interface Transaction {
  id: number;
  descripcion: string;
  monto: number;
  tipo: TipoTransaccion;
  categoria: string;
  /** Fecha ISO, por ejemplo "2026-09-20T12:00:00.000Z" */
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  descripcion: string;
  monto: number;
  tipo: TipoTransaccion;
  categoria: string;
  /** Formato YYYY-MM-DD */
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  // El token lo agrega automáticamente el authInterceptor

  obtenerTransacciones(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  crearTransaccion(data: TransactionInput): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, data);
  }

  actualizarTransaccion(id: number, data: TransactionInput): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, data);
  }

  eliminarTransaccion(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
