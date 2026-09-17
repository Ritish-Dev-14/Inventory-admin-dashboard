import express from "express";
import path from "path";
import multer from "multer";
import * as xlsx from "xlsx";
import cors from "cors";
import Database from "better-sqlite3";
import sqlite3 from "sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { items, stockHistory } from "./frontend/db/schema";
import { eq, desc, asc, like, and, or, sql, isNull, lt, gte } from "drizzle-orm";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const sqlite = new Database("./data/inventory.db");
const db = drizzle(sqlite);

// Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Dashboard Stats
app.get("/api/v1/dashboard/stats", async (req, res) => {
  try {
    const totalItemsRes = await db.select({ count: sql<number>`count(*)` }).from(items);
    const totalDepartmentsRes = await db.select({ count: sql<number>`count(distinct ${items.department})` }).from(items);
    const totalValueRes = await db.select({ value: sql<number>`sum(${items.closing_balance})` }).from(items).where(gte(items.closing_balance, 0));
    const negativeRes = await db.select({ count: sql<number>`count(*)` }).from(items).where(lt(items.closing_balance, 0));
    const unknownRes = await db.select({ count: sql<number>`count(*)` }).from(items).where(isNull(items.closing_balance));
    
    const recentlyUpdated = await db.select().from(items).orderBy(desc(items.last_updated)).limit(5);

    res.json({
      total_departments: totalDepartmentsRes[0].count,
      total_items: totalItemsRes[0].count,
      total_value: totalValueRes[0].value || 0,
      negative_items: negativeRes[0].count,
      unknown_items: unknownRes[0].count,
      recently_updated: recentlyUpdated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

// Departments list
app.get("/api/v1/departments", async (req, res) => {
  try {
    const deps = await db.select({
      name: items.department,
      count: sql<number>`count(*)`
    }).from(items).groupBy(items.department).orderBy(items.department);
    res.json(deps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

// Items list with pagination, filtering, searching
app.get("/api/v1/items", async (req, res) => {
  try {
    const { dept, status, search, sort, page = "1", limit = "25" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let conditions = [];

    if (dept && dept !== "All") {
      conditions.push(eq(items.department, dept as string));
    }
    
    if (status === "In Stock") conditions.push(gte(items.closing_balance, 0));
    if (status === "Negative") conditions.push(lt(items.closing_balance, 0));
    if (status === "Unknown") conditions.push(isNull(items.closing_balance));

    if (search) {
      conditions.push(like(items.item_name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause = [desc(items.last_updated)];
    if (sort === "Name (A-Z)") orderByClause = [asc(items.item_name)];
    if (sort === "Balance (High-Low)") orderByClause = [desc(items.closing_balance)];

    const totalRes = await db.select({ count: sql<number>`count(*)` }).from(items).where(whereClause);
    
    const data = await db.select().from(items).where(whereClause).orderBy(...orderByClause).limit(limitNum).offset(offset);

    res.json({
      items: data,
      total: totalRes[0].count,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(totalRes[0].count / limitNum)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

// Single item
app.get("/api/v1/items/:id", async (req, res) => {
  try {
    const item = await db.select().from(items).where(eq(items.id, parseInt(req.params.id)));
    if (item.length === 0) return res.status(404).json({ detail: "Item not found" });
    res.json(item[0]);
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

// Create item
app.post("/api/v1/items", async (req, res) => {
  try {
    const { department, item_name, page, closing_balance, note } = req.body;
    const now = new Date();
    
    const result = await db.insert(items).values({
      department,
      item_name,
      page: page ? parseInt(page) : null,
      closing_balance: closing_balance !== null ? parseFloat(closing_balance) : null,
      last_updated: now
    }).returning();
    
    const newItem = result[0];
    
    if (note) {
      await db.insert(stockHistory).values({
        item_id: newItem.id,
        old_value: null,
        new_value: newItem.closing_balance,
        changed_at: now,
        note
      });
    }

    res.json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

// Update item
app.put("/api/v1/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { department, item_name, page, closing_balance, note } = req.body;
    
    const existing = await db.select().from(items).where(eq(items.id, id));
    if (existing.length === 0) return res.status(404).json({ detail: "Item not found" });
    const oldItem = existing[0];
    
    const now = new Date();
    const result = await db.update(items).set({
      department,
      item_name,
      page: page ? parseInt(page) : null,
      closing_balance: closing_balance !== null ? parseFloat(closing_balance) : null,
      last_updated: now
    }).where(eq(items.id, id)).returning();
    
    await db.insert(stockHistory).values({
      item_id: id,
      old_value: oldItem.closing_balance,
      new_value: result[0].closing_balance,
      changed_at: now,
      note: note || null
    });
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

// Delete item
app.delete("/api/v1/items/:id", async (req, res) => {
  try {
    await db.delete(items).where(eq(items.id, parseInt(req.params.id)));
    res.json({ detail: "Deleted" });
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

// Negative alerts
app.get("/api/v1/alerts/negative", async (req, res) => {
  try {
    const data = await db.select().from(items).where(lt(items.closing_balance, 0)).orderBy(asc(items.closing_balance));
    res.json(data);
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

// Unknown alerts
app.get("/api/v1/alerts/unknown", async (req, res) => {
  try {
    const data = await db.select().from(items).where(isNull(items.closing_balance)).orderBy(asc(items.item_name));
    res.json(data);
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

// Reports summary
app.get("/api/v1/reports/summary", async (req, res) => {
  try {
    const data = await db.select({
      department: items.department,
      total_items: sql<number>`count(*)`,
      in_stock: sql<number>`sum(case when closing_balance >= 0 then 1 else 0 end)`,
      negative_items: sql<number>`sum(case when closing_balance < 0 then 1 else 0 end)`,
      unknown_items: sql<number>`sum(case when closing_balance is null then 1 else 0 end)`,
      total_value: sql<number>`sum(case when closing_balance > 0 then closing_balance else 0 end)`
    }).from(items).groupBy(items.department).orderBy(desc(sql`sum(case when closing_balance > 0 then closing_balance else 0 end)`));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

// Export Excel
app.get("/api/v1/reports/export", async (req, res) => {
  try {
    const allItems = await db.select().from(items).orderBy(items.department, asc(items.id));
    
    const wb = xlsx.utils.book_new();
    
    // Group by department
    const deps = [...new Set(allItems.map((i: any) => i.department as string))];
    
    // Summary sheet
    const summaryData = [["Department", "Total Items", "Total Value"]];
    
    deps.forEach((dep: string) => {
      const depItems = allItems.filter((i: any) => i.department === dep);
      const totalValue = depItems.reduce((sum: number, item: any) => sum + (item.closing_balance && item.closing_balance > 0 ? item.closing_balance : 0), 0);
      summaryData.push([dep, depItems.length.toString(), totalValue.toString()]);
      
      const wsData = [["S.No.", "Page", "Item Name", "Closing Balance Value"]];
      depItems.forEach((item: any, index: number) => {
        wsData.push([(index + 1).toString(), item.page?.toString() || "", item.item_name, item.closing_balance !== null ? item.closing_balance.toString() : ""]);
      });
      
      const ws = xlsx.utils.aoa_to_sheet(wsData);
      xlsx.utils.book_append_sheet(wb, ws, dep.substring(0, 31)); // excel sheet name limit
    });
    
    const wsSummary = xlsx.utils.aoa_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(wb, wsSummary, "Department Summary");
    
    const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
    
    res.setHeader('Content-Disposition', 'attachment; filename="Inventory_Export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

// Import Excel
app.post("/api/v1/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: "No file uploaded" });
    
    const buf = fs.readFileSync(req.file.path);
    const wb = xlsx.read(buf, { type: "buffer" });
    const mode = req.body.mode || "merge"; // "replace" or "merge"
    
    if (mode === "replace") {
      await db.delete(items);
      await db.delete(stockHistory);
    }
    
    let importedCount = 0;
    const now = new Date();
    
    for (const sheetName of wb.SheetNames) {
      if (sheetName === "Department Summary") continue;
      
      const ws = wb.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
      
      // skip header row
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        if (!row || row.length < 3) continue;
        
        const sno = row[0];
        const page = row[1];
        const itemName = row[2];
        const cbRaw = row[3];
        
        if (!itemName) continue;
        
        let cb = null;
        if (cbRaw !== undefined && cbRaw !== null) {
          const str = String(cbRaw).replace(/,/g, "").trim();
          if (str.startsWith("(-)") || str.startsWith("-")) {
            const num = parseFloat(str.replace("(-)", "").replace("-", ""));
            if (!isNaN(num)) cb = -Math.abs(num);
          } else {
            const num = parseFloat(str);
            if (!isNaN(num)) cb = num;
          }
        }
        
        await db.insert(items).values({
          department: sheetName,
          page: page ? parseInt(page) : null,
          item_name: String(itemName).trim(),
          closing_balance: cb,
          last_updated: now
        });
        
        importedCount++;
      }
    }
    
    fs.unlinkSync(req.file.path);
    res.json({ detail: `Imported ${importedCount} items` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

app.get("/api/v1/backup", (req, res) => {
  res.download(path.join(__dirname, "data/inventory.db"));
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
