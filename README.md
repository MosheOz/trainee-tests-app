# Trainee Tests App

An Angular web application for managing and analyzing trainee test results.  
The app includes three main screens:

- **Data Page** – Browse, filter, paginate, add, edit, and remove trainee results.  
- **Analysis Page** – Interactive charts (bar, line, pie) with multi-select filters for trainees/subjects, plus drag-and-drop chart swapping.  
- **Monitor Page** – (Optional extension) for real-time monitoring.

---

## Features

- Angular **standalone components** (Angular 20+).
- **Angular Material** UI: table, paginator, inputs, select, buttons.
- **ng2-charts / Chart.js** for charting.
- Drag & drop layout with **Angular CDK**.
- Persistent filters saved in `localStorage`.
- Editable row details panel.

---

## Getting Started

### Prerequisites
- Node.js (>= 18)
- npm (>= 9)

### Installation
```bash
git clone https://github.com/<your-account>/trainee-tests-app.git
cd trainee-tests-app
npm install
```

## Run Dev Server
```bash
npm start
```

### Navigate to: http://localhost:4200
