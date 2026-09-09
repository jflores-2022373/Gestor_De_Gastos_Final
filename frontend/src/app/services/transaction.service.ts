import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id?: number;
  descripcion: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/api/transactions'; // Ajusta según tu ruta backend

  constructor(private http: HttpClient) {}

  obtenerTransacciones(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  agregarTransaccion(transaccion: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaccion);
  }

  eliminarTransaccion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}