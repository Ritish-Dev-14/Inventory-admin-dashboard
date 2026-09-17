# 📦 Inventory Admin

> **An Enterprise-Grade Inventory Management & Reconciliation System**

## 📖 What is this application?
**Inventory Admin** is a high-performance, full-stack web application tailored for large-scale retail and wholesale suppliers (specifically architected for stationery, arts, and craft distributors). It transitions businesses away from fragile, disorganized spreadsheet tracking into a secure, centralized database system. It provides a real-time, actionable view of stock valuations, negative balance anomalies, and departmental summaries.

## 🎯 Why use this application?
Managing thousands of SKUs across multiple departments using traditional spreadsheets often leads to data corruption, untracked negative balances, and painful auditing processes. 

**Inventory Admin solves this by providing:**
- **Single Source of Truth:** A structured SQLite database prevents accidental data deletion, formula corruption, and formatting errors.
- **Proactive Auditing:** Automatically flags negative inventory balances and unknown/missing data for immediate review, preventing financial leakage.
- **Financial Visibility:** Calculates real-time total stock valuation grouped by department.
- **Seamless Migration:** Robust Excel import/export ensures you can transition existing workflows instantly without vendor lock-in.

## ✨ Core Functionalities
- **📊 Interactive Dashboard:** Bird's-eye view of total SKUs, gross stock valuation, recent updates, and departmental distributions via visual charts.
- **📋 Comprehensive Inventory Grid:** Fast, searchable, and sortable data grid to view, edit, and manage thousands of items across paginated views.
- **🚨 Anomaly Detection:** Dedicated Alert modules for **Negative Stock** (items requiring immediate reconciliation) and **Unknown Stock** (items missing closing balances).
- **📈 Departmental Reports:** Instant aggregation of total items, positive stock, and financial value per department, exportable to cleanly formatted multi-sheet Excel files.
- **🔄 Bulk Data Operations:** Enterprise-grade Import/Export module supporting:
  - **Merge Import:** Add new items and update existing records dynamically.
  - **Replace Import:** Wipe the slate clean and start fresh from a new master spreadsheet.
  - **Raw Backup:** 1-click download of the raw SQLite `.db` file for cold-storage archiving and compliance.

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** Node.js, Express.js REST API
- **Database:** SQLite3 (Better-SQLite3) with Drizzle ORM
- **Data Processing:** SheetJS (xlsx) for robust Excel parsing and generation

## 🚀 How to Use (Local & Production Setup)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Installation
Clone the repository and install the required dependencies:
```bash
npm install
```

### 2. Development Mode
Start the local development server (this concurrently spins up the Vite frontend and Express backend via `tsx`):
```bash
npm run dev
```
The application will be securely accessible at `http://localhost:3000`.

### 3. Production Build & Deployment
To build the application for enterprise production environments (e.g., Docker containers, Cloud Run, AWS EC2):

```bash
# 1. Compile the frontend statically and bundle the backend using esbuild
npm run build

# 2. Start the optimized production server
npm run start
```
*Note: The production build creates a highly optimized, self-contained `dist/server.cjs` file. This resolves ESM paths at build time, bypassing runtime resolution overhead to ensure lightning-fast container cold starts.*

---
*Built with modern web standards for reliability, speed, and scale.*
