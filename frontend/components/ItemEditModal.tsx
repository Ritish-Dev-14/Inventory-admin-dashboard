import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createItem, updateItem } from "@/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  departments: any[];
  onSaved: () => void;
}

export default function ItemEditModal({ isOpen, onClose, item, departments, onSaved }: Props) {
  const [formData, setFormData] = useState({
    department: "",
    item_name: "",
    page: "",
    closing_balance: "",
    note: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          department: item.department || "",
          item_name: item.item_name || "",
          page: item.page?.toString() || "",
          closing_balance: item.closing_balance?.toString() || "",
          note: ""
        });
      } else {
        setFormData({
          department: "",
          item_name: "",
          page: "",
          closing_balance: "",
          note: ""
        });
      }
      setErrors({});
    }
  }, [isOpen, item]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.item_name.trim()) newErrors.item_name = "Item name is required";
    if (!formData.department) newErrors.department = "Department is required";
    
    if (formData.closing_balance && isNaN(Number(formData.closing_balance))) {
      newErrors.closing_balance = "Must be a valid number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    
    const payload = {
      ...formData,
      page: formData.page ? parseInt(formData.page) : null,
      closing_balance: formData.closing_balance ? parseFloat(formData.closing_balance) : null
    };

    try {
      if (item) {
        await updateItem(item.id, payload);
        toast.success("Item updated successfully");
      } else {
        await createItem(payload);
        toast.success("Item created successfully");
      }
      onSaved();
      onClose();
    } catch (error) {
      toast.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
            <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v as string})}>
              <SelectTrigger className={errors.department ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_name">Item Name <span className="text-destructive">*</span></Label>
            <Input 
              id="item_name" 
              value={formData.item_name}
              onChange={(e) => setFormData({...formData, item_name: e.target.value})}
              placeholder="e.g. Brush Round 7sd (Fab.) Rs.185"
              className={errors.item_name ? "border-destructive" : ""}
            />
            {errors.item_name && <p className="text-xs text-destructive">{errors.item_name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page">Page (Optional)</Label>
              <Input 
                id="page" 
                type="number"
                value={formData.page}
                onChange={(e) => setFormData({...formData, page: e.target.value})}
                placeholder="Page #"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closing_balance">Closing Balance (₹)</Label>
              <Input 
                id="closing_balance" 
                type="number"
                step="0.01"
                value={formData.closing_balance}
                onChange={(e) => setFormData({...formData, closing_balance: e.target.value})}
                placeholder="0.00"
                className={errors.closing_balance ? "border-destructive" : ""}
              />
              {errors.closing_balance && <p className="text-xs text-destructive">{errors.closing_balance}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Audit Note (Optional)</Label>
            <Input 
              id="note" 
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              placeholder="Reason for change..."
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
