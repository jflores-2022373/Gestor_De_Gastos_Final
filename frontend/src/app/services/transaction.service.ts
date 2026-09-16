import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id?: string | number;
  titulo?: string;
  descripcion?: string; // Añadido para que coincida con el componente
  monto: number;
  tipo: 'ingreso' | 'egreso';
  categoria?: string;
  fecha?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/api/transactions';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerTransacciones(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearTransaccion(transaccion: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaccion, { headers: this.getHeaders() });
  }

  agregarTransaccion(transaccion: Transaction): Observable<Transaction> {
    return this.crearTransaccion(transaccion);
  }

  actualizarTransaccion(id: string | number, transaccion: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaccion, { headers: this.getHeaders() });
  }

  eliminarTransaccion(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}