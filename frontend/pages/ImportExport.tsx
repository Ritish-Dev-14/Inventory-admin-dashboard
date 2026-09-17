import { useState, useRef } from "react";
import { importExcel } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Download, Database, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export default function ImportExport() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("merge");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select an Excel file first");
      return;
    }
    
    setUploading(true);
    try {
      const res = await importExcel(file, mode);
      toast.success(res.detail || "Import successful");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Failed to import file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight">Import & Export</h1>
        <p className="text-muted-foreground mt-1">Manage bulk data operations and backups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              Import from Excel
            </CardTitle>
            <CardDescription>
              Upload the <strong>StkSum_Department_Wise.xlsx</strong> file to update inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${file ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border bg-muted hover:bg-muted/80'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                  <p className="font-medium text-emerald-500">{file.name}</p>
                  <p className="text-xs text-emerald-500/80">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-muted-foreground" />
                  <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Excel files (.xlsx)</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Import Mode</p>
              <Select value={mode} onValueChange={(v) => setMode(v as string)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Merge (Add new, skip existing matching IDs)</SelectItem>
                  <SelectItem value="replace">Replace All (Delete existing database and start fresh)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              disabled={!file || uploading}
              onClick={handleImport}
            >
              {uploading ? "Importing..." : "Start Import"}
            </Button>
          </CardContent>
        </Card>

        {/* Export Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-500" />
                Export to Excel
              </CardTitle>
              <CardDescription>
                Download a formatted Excel file matching the original structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.open('/api/v1/reports/export', '_blank')} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" /> Download Excel Export
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-muted-foreground" />
                Database Backup
              </CardTitle>
              <CardDescription>
                Download the raw SQLite .db file for manual archiving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => window.open('/api/v1/backup', '_blank')} className="w-full text-foreground">
                <Download className="w-4 h-4 mr-2" /> Download inventory.db
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
