import { useEffect, useState } from "react";
import { fetchSummaryReport } from "@/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Download, IndianRupee } from "lucide-react";

export default function Reports() {
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryReport()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">Department-wise stock overview and valuation.</p>
        </div>
        
        <Button onClick={() => window.open('/api/v1/reports/export', '_blank')} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Download className="w-4 h-4 mr-2" /> Export All to Excel
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted">
          <h2 className="font-medium text-foreground">Department Summary Report</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Department</TableHead>
                <TableHead className="text-center whitespace-nowrap">Total Items</TableHead>
                <TableHead className="text-center whitespace-nowrap">In Stock</TableHead>
                <TableHead className="text-center whitespace-nowrap">Negative</TableHead>
                <TableHead className="text-center whitespace-nowrap">Unknown</TableHead>
                <TableHead className="text-right whitespace-nowrap">Total Value (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">Loading report...</TableCell>
                </TableRow>
              ) : summary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">No data available.</TableCell>
                </TableRow>
              ) : (
                summary.map((row) => (
                  <TableRow key={row.department} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">{row.department}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{row.total_items.toLocaleString()}</TableCell>
                    <TableCell className="text-center text-emerald-500">{row.in_stock.toLocaleString()}</TableCell>
                    <TableCell className="text-center text-destructive">{row.negative_items > 0 ? row.negative_items.toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{row.unknown_items > 0 ? row.unknown_items.toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(row.total_value)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
