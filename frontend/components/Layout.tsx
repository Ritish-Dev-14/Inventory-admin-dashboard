import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, AlertTriangle, FileText, DownloadCloud, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const NavLinks = () => (
    <>
      <Link to="/" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.pathname === "/" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
        <LayoutDashboard className="w-5 h-5" />
        Dashboard
      </Link>
      <Link to="/inventory" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.pathname === "/inventory" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
        <Package className="w-5 h-5" />
        Inventory
      </Link>
      <Link to="/alerts" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.pathname === "/alerts" ? "bg-destructive/10 text-destructive font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
        <AlertTriangle className="w-5 h-5" />
        Negative Alerts
      </Link>
      <Link to="/reports" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.pathname === "/reports" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
        <FileText className="w-5 h-5" />
        Reports
      </Link>
      <Link to="/import-export" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.pathname === "/import-export" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
        <DownloadCloud className="w-5 h-5" />
        Import / Export
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <h1 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Inventory Admin
        </h1>
        <Sheet>
          <SheetTrigger className="p-2 hover:bg-muted rounded-md transition-colors">
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4 border-r border-border">
            <h2 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Inventory Admin
            </h2>
            <nav className="flex flex-col gap-1">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r border-border p-4 shrink-0 h-screen sticky top-0 overflow-y-auto">
        <h2 className="font-heading font-semibold text-xl mb-8 px-3 flex items-center gap-2 text-foreground">
          <Package className="w-6 h-6 text-primary" />
          Inventory Admin
        </h2>
        <nav className="flex flex-col gap-1">
          <NavLinks />
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-[100vw]">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
