import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Grid3X3,
  HelpCircle,
  Settings,
  Menu,
  X
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { CategorySection } from "@/components/category-section";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { tools, getToolsByCategory, ToolCategory } from "@/lib/tools-data";
import { AdBanner, AdInContent } from "@/components/ads/AdSlot";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Grid3X3, label: "All Tools", path: "/tools" },
  { icon: HelpCircle, label: "Help", path: "/help" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const categories: ToolCategory[] = ["calculators", "image", "pdf", "media", "student", "text", "finance", "utility"];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-bold font-display">
              stu<span className="text-primary">DEN</span>t99
            </h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path === "/dashboard" && location === "/dashboard");
            return (
              <Link key={item.label} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${isActive ? "bg-sidebar-accent" : ""}`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="px-4 sm:px-8 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1 flex items-center justify-center">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ThemeSwitcher />
              <Link href="/dashboard">
                <Button variant="outline" className="hidden sm:flex" data-testid="button-all-tools">
                  All Tools
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-welcome">
                Welcome to stuDENt
              </h2>
              <p className="text-muted-foreground" data-testid="text-date">{currentDate}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-sm"
                >
                  <span className="text-muted-foreground">Total Tools:</span>{" "}
                  <span className="font-semibold text-lg">99</span>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-sm"
                >
                  <span className="text-muted-foreground">Categories:</span>{" "}
                  <span className="font-semibold text-lg">8</span>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-sm"
                >
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-semibold text-lg text-green-600 dark:text-green-400">All Free</span>
                </motion.div>
              </div>
            </motion.div>

            <div className="mb-6">
              <AdBanner />
            </div>

            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <CategorySection
                  category={category}
                  tools={getToolsByCategory(category)}
                />
                {index === 1 && (
                  <div className="mb-8">
                    <AdInContent />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
