import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MockDataService, TestResult } from '../../services/mock-data.service';

type PanelMode = 'view' | 'edit' | 'add';

const LS_FILTER = 'dataPage.filter';
const LS_PAGE = 'dataPage.page';
const LS_PAGESIZE = 'dataPage.pageSize';
const LS_SELECTED = 'dataPage.selectedId';

@Component({
  selector: 'app-data-page',
  standalone: true,
  templateUrl: './data-page.html',
  styleUrls: ['./data-page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDividerModule,
  ],
})
export class DataPage implements OnInit {
  results: TestResult[] = [];
  filteredResults: TestResult[] = [];

  page = 0;
  pageSize = 10;
  filterText = '';

  selected: TestResult | null = null;
  workingCopy: TestResult | null = null; // used by edit/add forms
  mode: PanelMode = 'view';

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    // load data
    this.results = this.dataService.getResults();

    // restore state
    this.filterText = localStorage.getItem(LS_FILTER) ?? '';
    this.page = Number(localStorage.getItem(LS_PAGE) ?? 0);
    this.pageSize = Number(localStorage.getItem(LS_PAGESIZE) ?? 10);

    const selectedId = Number(localStorage.getItem(LS_SELECTED) ?? 0);
    if (selectedId) {
      this.selected = this.results.find((r) => r.id === selectedId) ?? null;
      this.mode = this.selected ? 'view' : 'view';
    }

    this.applyFilter(false);
  }

  // ---- filtering + persistence
  applyFilter(resetPage: boolean = true) {
    const q = this.filterText.trim();
    localStorage.setItem(LS_FILTER, this.filterText);

    if (!q) {
      this.filteredResults = this.results;
    } else if (q.startsWith('ID:')) {
      const id = Number(q.slice(3).trim());
      this.filteredResults = this.results.filter((r) => r.id === id);
    } else if (q.startsWith('>')) {
      const val = Number(q.slice(1).trim());
      this.filteredResults = this.results.filter((r) => r.grade > val);
    } else if (q.startsWith('<')) {
      const val = Number(q.slice(1).trim());
      this.filteredResults = this.results.filter((r) => r.grade < val);
    } else {
      const low = q.toLowerCase();
      this.filteredResults = this.results.filter(
        (r) =>
          r.traineeName.toLowerCase().includes(low) ||
          r.subject.toLowerCase().includes(low)
      );
    }

    if (resetPage) this.page = 0;
    localStorage.setItem(LS_PAGE, String(this.page));
    localStorage.setItem(LS_PAGESIZE, String(this.pageSize));
  }

  // ---- selection
  selectRow(row: TestResult) {
    this.selected = row;
    this.mode = 'view';
    this.workingCopy = null;
    localStorage.setItem(LS_SELECTED, String(row.id));
  }

  // ---- pagination
  onPageChange(event: PageEvent) {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize ?? this.pageSize;
    localStorage.setItem(LS_PAGE, String(this.page));
    localStorage.setItem(LS_PAGESIZE, String(this.pageSize));
  }

  // ---- editing
  startEdit() {
    if (!this.selected) return;
    this.mode = 'edit';
    this.workingCopy = { ...this.selected };
  }

  cancelEdit() {
    this.mode = 'view';
    this.workingCopy = null;
  }

  saveEdit(form?: NgForm) {
    if (!this.workingCopy) return;
    // basic validation
    if (
      !this.workingCopy.traineeName?.trim() ||
      !this.workingCopy.subject?.trim()
    )
      return;

    this.dataService.updateResult(this.workingCopy);
    this.results = this.dataService.getResults();
    this.applyFilter(false);

    // keep selection pointing to updated row
    this.selected =
      this.results.find((r) => r.id === this.workingCopy!.id) ?? null;
    this.mode = 'view';
    this.workingCopy = null;
  }

  // ---- adding new row (full details form)
  startAdd() {
    this.mode = 'add';
    this.selected = null; // no row selected during add
    localStorage.removeItem(LS_SELECTED);
    this.workingCopy = {
      id: 0, // temp, assigned on save
      traineeName: '',
      subject: '',
      grade: 0,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  cancelAdd() {
    this.mode = 'view';
    this.workingCopy = null;
  }

  saveAdd(form?: NgForm) {
    if (!this.workingCopy) return;
    if (
      !this.workingCopy.traineeName?.trim() ||
      !this.workingCopy.subject?.trim()
    )
      return;

    const newId = this.dataService.addResult({
      traineeName: this.workingCopy.traineeName.trim(),
      subject: this.workingCopy.subject.trim(),
      grade: Number(this.workingCopy.grade) || 0,
      date: this.workingCopy.date,
    });

    this.results = this.dataService.getResults();
    this.applyFilter(false);

    // select the new row
    const created = this.results.find((r) => r.id === newId) ?? null;
    if (created) {
      this.selected = created;
      localStorage.setItem(LS_SELECTED, String(created.id));
    }
    this.mode = 'view';
    this.workingCopy = null;
  }

  // ---- removal
  removeSelected() {
    if (!this.selected) return;
    this.dataService.removeResult(this.selected.id);
    this.results = this.dataService.getResults();
    this.applyFilter(false);
    this.selected = null;
    localStorage.removeItem(LS_SELECTED);
  }

  // datasource slice for current page
  pageSlice() {
    const start = this.page * this.pageSize;
    return this.filteredResults.slice(start, start + this.pageSize);
  }
}
