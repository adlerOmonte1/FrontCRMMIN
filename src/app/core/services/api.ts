import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { PaginatedResponse } from '@models/pagination';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list<T>(resource: string, page?: number): Observable<PaginatedResponse<T>> {
    const params = page ? new HttpParams().set('page', page) : undefined;
    return this.http.get<PaginatedResponse<T>>(this.buildUrl(resource), { params });
  }

  getById<T>(resource: string, id: number): Observable<T> {
    return this.http.get<T>(this.buildUrl(resource, id));
  }

  create<T>(resource: string, payload: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(resource), payload);
  }

  update<T>(resource: string, id: number, payload: unknown): Observable<T> {
    return this.http.put<T>(this.buildUrl(resource, id), payload);
  }

  patch<T>(resource: string, id: number, payload: unknown): Observable<T> {
    return this.http.patch<T>(this.buildUrl(resource, id), payload);
  }

  remove(resource: string, id: number): Observable<void> {
    return this.http.delete<void>(this.buildUrl(resource, id));
  }

  private buildUrl(resource: string, id?: number): string {
    return id === undefined ? `${this.baseUrl}/${resource}/` : `${this.baseUrl}/${resource}/${id}/`;
  }
}
