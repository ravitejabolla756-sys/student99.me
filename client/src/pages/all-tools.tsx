import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Calculator,
  Image,
  FileText,
  GraduationCap,
  Sparkles,
  Video,
  Type,
  Wallet,
  Wand2
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { tools, categoryInfo, ToolCategory, getToolsByCategory } from "@/lib/tools-data";
import { AdBanner, AdInContent } from "@/components/ads/AdSlot";

const categoryIcons: Record<ToolCategory, any> = {
  calculators: Calculator,
  image: Image,
  pdf: FileText,
  student: GraduationCap,
  media: Video,
  text: Type,
  finance: Wallet,
  utility: Wand2
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export default function AllTools() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  const categories: ToolCategory[] = ["calculators", "image", "pdf", "media", "student", "text", "finance", "utility"];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = !search ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/">
              <h1 className="text-xl font-bold font-display">
                stu<span className="text-primary">DEN</span>t99
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">All 99 Tools</h2>
          <p className="text-muted-foreground">Browse our complete collection of free student tools</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-tools"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              data-testid="filter-all"
            >
              All ({tools.length})
            </Button>
            {categories.map((cat) => {
              const info = categoryInfo[cat];
              const count = getToolsByCategory(cat).length;
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`filter-${cat}`}
                >
                  {info.name} ({count})
                </Button>
              );
            })}
          </div>
        </motion.div>

        <div className="mb-6">
          <AdBanner />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const catInfo = categoryInfo[tool.category];
            const CatIcon = categoryIcons[tool.category];

            return (
              <motion.div key={tool.id} variants={itemVariants}>
                <Link href={tool.path}>
                  <Card
                    className="group cursor-pointer h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1"
                    data-testid={`card-tool-${tool.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 w-10 h-10 rounded-lg ${catInfo.color} flex items-center justify-center text-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors truncate">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <CatIcon className="w-3 h-3 mr-1" />
                          {catInfo.name}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">No tools found matching your search.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setSearch(""); setSelectedCategory("all"); }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
