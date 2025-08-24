import { Injectable } from '@angular/core';

export interface TestResult {
  id: number;
  traineeName: string;
  subject: string;
  grade: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private data: TestResult[] = [
    {
      id: 1,
      traineeName: 'Alice',
      subject: 'Math',
      grade: 85,
      date: '2025-08-01',
    },
    {
      id: 2,
      traineeName: 'Bob',
      subject: 'Science',
      grade: 72,
      date: '2025-08-02',
    },
    {
      id: 3,
      traineeName: 'Charlie',
      subject: 'History',
      grade: 60,
      date: '2025-08-03',
    },
    {
      id: 4,
      traineeName: 'Dana',
      subject: 'Math',
      grade: 95,
      date: '2025-08-04',
    },
  ];

  getResults() {
    return [...this.data];
  }

  removeResult(id: number) {
    this.data = this.data.filter((r) => r.id !== id);
  }
  updateResult(updated: TestResult) {
    const idx = this.data.findIndex((r) => r.id === updated.id);
    if (idx !== -1) {
      this.data[idx] = { ...updated };
    }
  }

  addResult(result: Omit<TestResult, 'id'>): number {
    const nextId = this.data.length
      ? Math.max(...this.data.map((r) => r.id)) + 1
      : 1;
    this.data.push({ id: nextId, ...result });
    return nextId;
  }
}
