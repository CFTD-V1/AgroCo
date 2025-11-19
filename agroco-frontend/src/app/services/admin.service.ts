import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  async summary() {
    return this.api.get('/api/v1/admin/summary', true);
  }

  async users(params?: { q?: string; page?: number; per_page?: number }) {
    const qs = this.buildQuery(params);
    return this.api.get<Pagination<any>>(`/api/v1/admin/users${qs}`, true);
  }

  async createUser(payload: any) {
    return this.api.post('/api/v1/admin/users', payload, true);
  }

  async updateUser(id: number, payload: any) {
    return this.api.put(`/api/v1/admin/users/${id}`, payload, true);
  }

  async deleteUser(id: number) {
    return this.api.delete(`/api/v1/admin/users/${id}`, true);
  }

  async soilAnalyses(params?: { page?: number; per_page?: number }) {
    const qs = this.buildQuery(params);
    return this.api.get<Pagination<any>>(`/api/v1/admin/soil-analyses${qs}`, true);
  }

  async fertilizerPlans(params?: { page?: number; per_page?: number }) {
    const qs = this.buildQuery(params);
    return this.api.get<Pagination<any>>(`/api/v1/admin/fertilizer-plans${qs}`, true);
  }

  private buildQuery(params?: Record<string, any>): string {
    if (!params) return '';
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qp.set(key, String(value));
    });
    const str = qp.toString();
    return str ? `?${str}` : '';
  }
}
