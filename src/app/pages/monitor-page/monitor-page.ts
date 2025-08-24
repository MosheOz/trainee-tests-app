import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MockDataService, TestResult } from '../../services/mock-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface TraineeSummary {
  id: number;
  name: string;
  average: number;
  passed: boolean;
}

@Component({
  selector: 'app-monitor-page',
  standalone: true,
  templateUrl: './monitor-page.html',
  styleUrls: ['./monitor-page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
  ],
})
export class MonitorPage implements OnInit {
  results: TestResult[] = [];
  summaries: TraineeSummary[] = [];

  // filters
  selectedIds: number[] = [];
  nameFilter: string = '';
  showPassed: boolean = true;
  showFailed: boolean = true;

  constructor(private data: MockDataService) {}

  ngOnInit() {
    this.results = this.data.getResults();
    this.computeSummaries();
  }

  computeSummaries() {
    const byTrainee: Record<number, TestResult[]> = {};

    for (let r of this.results) {
      if (!byTrainee[r.id]) byTrainee[r.id] = [];
      byTrainee[r.id].push(r);
    }

    this.summaries = Object.entries(byTrainee).map(([id, tests]) => {
      const avg = tests.reduce((a, b) => a + b.grade, 0) / tests.length;
      return {
        id: +id,
        name: tests[0].traineeName,
        average: Math.round(avg),
        passed: avg >= 65,
      };
    });
  }

  get filteredSummaries() {
    return this.summaries.filter((s) => {
      const matchId = this.selectedIds.length
        ? this.selectedIds.includes(s.id)
        : true;
      const matchName = this.nameFilter
        ? s.name.toLowerCase().includes(this.nameFilter.toLowerCase())
        : true;
      const matchState =
        (this.showPassed && s.passed) || (this.showFailed && !s.passed);

      return matchId && matchName && matchState;
    });
  }
}
