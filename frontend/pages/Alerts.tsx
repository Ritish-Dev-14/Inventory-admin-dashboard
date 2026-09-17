import { useEffect, useState } from "react";
import { fetchAlerts } from "@/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts()
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          Negative Stock Alerts
        </h1>
        <p className="text-muted-foreground mt-1">Items that currently have a negative closing balance, indicating potential stock discrepancy.</p>
      </div>

      <div className="bg-card rounded-lg border border-destructive/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-destructive/5">
            <TableRow>
              <TableHead className="whitespace-nowrap">Department</TableHead>
              <TableHead className="whitespace-nowrap min-w-[200px]">Item Name</TableHead>
              <TableHead className="text-right whitespace-nowrap">Balance</TableHead>
              <TableHead className="text-right w-40 whitespace-nowrap">Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Loading alerts...</TableCell>
              </TableRow>
            ) : alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-emerald-500 font-medium">
                  🎉 No negative stock alerts! Everything is looking good.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((item) => (
                <TableRow key={item.id} className="hover:bg-destructive/10">
                  <TableCell className="text-muted-foreground">{item.department}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.item_name}</TableCell>
                  <TableCell className="text-right font-bold text-destructive">{formatCurrency(item.closing_balance)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm flex items-center justify-end gap-1 pt-4">
                    <Clock className="w-3 h-3" />
                    {new Date(item.last_updated).toLocaleDateString()}
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
