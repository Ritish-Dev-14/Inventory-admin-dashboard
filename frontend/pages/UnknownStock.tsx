import { useEffect, useState } from "react";
import { fetchUnknowns } from "@/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HelpCircle, Clock } from "lucide-react";

export default function UnknownStock() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnknowns()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-muted-foreground" />
          Unknown Stock Alerts
        </h1>
        <p className="text-muted-foreground mt-1">Items that currently have a missing closing balance value.</p>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-muted">
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
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Loading items...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-emerald-500 font-medium">
                  ✅ No unknown stock items! Everything is looking good.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="text-muted-foreground">{item.department}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.item_name}</TableCell>
                  <TableCell className="text-right font-medium text-muted-foreground">Unknown</TableCell>
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
