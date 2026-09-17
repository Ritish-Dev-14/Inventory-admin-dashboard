import { useEffect, useState, useCallback } from "react";
import { fetchItems, fetchDepartments, deleteItem } from "@/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit2, Trash2, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import ItemEditModal from "@/components/ItemEditModal";

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortParam, setSortParam] = useState("Recently Updated");
  const [limit, setLimit] = useState("25");
  
  const [editItem, setEditItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(console.error);
  }, []);

  const loadItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {
      page: page.toString(),
      limit
    };
    if (search) params.search = search;
    if (deptFilter !== "All") params.dept = deptFilter;
    if (statusFilter !== "All") params.status = statusFilter;
    if (sortParam !== "Recently Updated") params.sort = sortParam;

    fetchItems(params)
      .then(res => {
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, limit, search, deptFilter, statusFilter, sortParam]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadItems]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id);
        toast.success("Item deleted successfully");
        loadItems();
      } catch (err) {
        toast.error("Failed to delete item");
      }
    }
  };

  const formatCurrency = (val: number | null) => {
    if (val === null) return "-";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight">Inventory</h1>
        <Button onClick={() => { setEditItem(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-background"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v as string); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as string); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Negative">Negative</SelectItem>
              <SelectItem value="Unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortParam} onValueChange={(v) => { setSortParam(v as string); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Recently Updated">Recently Updated</SelectItem>
              <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
              <SelectItem value="Balance (High-Low)">Balance (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-16 whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap min-w-[200px]">Item Name</TableHead>
                <TableHead className="whitespace-nowrap">Department</TableHead>
                <TableHead className="w-24 whitespace-nowrap">Page</TableHead>
                <TableHead className="text-right whitespace-nowrap">Balance (₹)</TableHead>
                <TableHead className="text-center w-32 whitespace-nowrap">Status</TableHead>
                <TableHead className="text-right w-24 whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">Loading items...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">No items found for your search.</TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">{item.id}</TableCell>
                    <TableCell className="font-medium text-foreground">{item.item_name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.department}</TableCell>
                    <TableCell className="text-muted-foreground">{item.page || "-"}</TableCell>
                    <TableCell className={`text-right font-medium ${item.closing_balance < 0 ? 'text-destructive' : item.closing_balance === null ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {formatCurrency(item.closing_balance)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.closing_balance < 0 ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 w-full justify-center">⚠️ Negative</Badge>
                      ) : item.closing_balance === null ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border w-full justify-center">❓ Unknown</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 w-full justify-center">✅ In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditItem(item); setIsModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-border bg-muted/50 px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(page - 1) * parseInt(limit) + (items.length > 0 ? 1 : 0)}</span> to <span className="font-medium">{(page - 1) * parseInt(limit) + items.length}</span> of <span className="font-medium">{total}</span> results
              </p>
              <Select value={limit} onValueChange={(v) => { setLimit(v as string); setPage(1); }}>
                <SelectTrigger className="w-[80px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ItemEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        item={editItem} 
        departments={departments}
        onSaved={loadItems}
      />
    </div>
  );
}
