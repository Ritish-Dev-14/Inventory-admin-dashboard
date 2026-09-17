import { useEffect, useState } from "react";
import { fetchStats, fetchDepartments } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Package, AlertTriangle, HelpCircle, IndianRupee, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
    fetchDepartments().then(setDepartments).catch(console.error);
  }, []);

  if (!stats) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  // Formatting currency
  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_items.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {stats.total_departments} departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Value</CardTitle>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(stats.total_value)}</div>
            <p className="text-xs text-muted-foreground mt-1">Positive balances only</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Negative Balance</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.negative_items.toLocaleString()}</div>
            <Link to="/alerts" className="text-xs text-destructive hover:underline mt-1 inline-block opacity-80">View Alerts →</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unknown Stock</CardTitle>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.unknown_items.toLocaleString()}</div>
            <Link to="/unknown" className="text-xs text-muted-foreground hover:underline mt-1 inline-block opacity-80">View Unknowns →</Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Items per Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: "#27272a" }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #3f3f46", backgroundColor: "#18181b", color: "#f4f4f5", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)" }}
                  />
                  <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recently Updated Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recently_updated.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between border-b border-border last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.item_name}</p>
                    <p className="text-xs text-muted-foreground">{item.department} {item.page ? `• Pg ${item.page}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${item.closing_balance < 0 ? 'text-destructive' : item.closing_balance === null ? 'text-muted-foreground' : 'text-emerald-500'}`}>
                      {item.closing_balance === null ? "Unknown" : formatCurrency(item.closing_balance)}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.last_updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
