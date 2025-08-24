import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MockDataService, TestResult } from '../../services/mock-data.service';

type ChartKey = 'chart1' | 'chart2' | 'chart3';
type SlotKey = 'left' | 'right' | 'hidden';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  templateUrl: './analysis-page.html',
  styleUrls: ['./analysis-page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    DragDropModule,
    NgChartsModule,
  ],
})
export class AnalysisPage implements OnInit {
  results: TestResult[] = [];

  trainees: string[] = [];
  subjects: string[] = [];

  selectedIds: string[] = [];
  selectedSubjects: string[] = [];

  chart1!: ChartConfiguration<'bar'>['data']; // per trainee (avg)
  chart2!: ChartConfiguration<'line'>['data']; // per trainee over time
  chart3!: ChartConfiguration<'pie'>['data']; // per subject (avg)

  // typed constants for drop list data
  slotLeft: SlotKey = 'left';
  slotRight: SlotKey = 'right';
  slotHidden: SlotKey = 'hidden';

  // two visible slots + one hidden
  slots: Record<SlotKey, ChartKey> = {
    left: 'chart1',
    right: 'chart2',
    hidden: 'chart3',
  };

  constructor(private data: MockDataService) {}

  ngOnInit() {
    this.results = this.data.getResults();
    this.trainees = [...new Set(this.results.map((r) => r.traineeName))];
    this.subjects = [...new Set(this.results.map((r) => r.subject))];
    this.updateCharts();
  }

  updateCharts() {
    // Chart 1: average per trainee
    const traineeAverages = this.selectedIds.length
      ? this.selectedIds.map((name) => {
          const grades = this.results
            .filter((r) => r.traineeName === name)
            .map((r) => r.grade);
          const avg = grades.length
            ? grades.reduce((a, b) => a + b, 0) / grades.length
            : 0;
          return { name, avg: Math.round(avg) };
        })
      : [];

    this.chart1 = {
      labels: traineeAverages.map((t) => t.name),
      datasets: [
        { data: traineeAverages.map((t) => t.avg), label: 'Average Grade' },
      ],
    };

    // Chart 2: grades over time per selected trainee
    if (this.selectedIds.length) {
      const dates = [...new Set(this.results.map((r) => r.date))].sort();
      this.chart2 = {
        labels: dates,
        datasets: this.selectedIds.map((name) => {
          const rows = this.results.filter((r) => r.traineeName === name);
          return {
            data: dates.map((d) => {
              const rec = rows.find((r) => r.date === d);
              return rec ? rec.grade : null;
            }),
            label: `${name} Grades`,
            fill: false,
          };
        }),
      };
    } else {
      this.chart2 = { labels: [], datasets: [] };
    }

    // Chart 3: average per subject
    const subjectAverages = this.selectedSubjects.length
      ? this.selectedSubjects.map((sub) => {
          const grades = this.results
            .filter((r) => r.subject === sub)
            .map((r) => r.grade);
          const avg = grades.length
            ? grades.reduce((a, b) => a + b, 0) / grades.length
            : 0;
          return { subject: sub, avg: Math.round(avg) };
        })
      : [];

    this.chart3 = {
      labels: subjectAverages.map((s) => s.subject),
      datasets: [
        {
          data: subjectAverages.map((s) => s.avg),
          label: 'Average by Subject',
        },
      ],
    };
  }

  chartTitle(key: ChartKey): string {
    switch (key) {
      case 'chart1':
        return 'Chart 1: Avg per Trainee';
      case 'chart2':
        return 'Chart 2: Trainees Over Time';
      case 'chart3':
        return 'Chart 3: Avg per Subject';
    }
  }

  private swap(a: SlotKey, b: SlotKey) {
    const tmp = this.slots[a];
    this.slots[a] = this.slots[b];
    this.slots[b] = tmp;
  }

  // typed drop: lists are connected; we only swap assignments
  onDrop(event: CdkDragDrop<SlotKey, SlotKey, any>) {
    const from = event.previousContainer.data;
    const to = event.container.data;
    if (from === to) return;
    this.swap(from, to);

    // keep the draggable button where it came from (we're just swapping chart assignments)
    // moving DOM is unnecessary and confusing here
    event.previousContainer.element.nativeElement.appendChild(
      event.item.element.nativeElement
    );
  }
}
