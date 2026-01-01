import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  UserX, 
  Sparkles, 
  Calculator, 
  Image, 
  FileText, 
  GraduationCap,
  Video,
  ArrowRight
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ScrollReactiveBackground } from "@/components/scroll-reactive-background";
import { CursorAnimation } from "@/components/cursor-animation";
import { categoryInfo, getToolsByCategory } from "@/lib/tools-data";
import { AdBanner, AdInContent } from "@/components/ads/AdSlot";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Landing() {
  const categories = [
    { key: "calculators" as const, icon: Calculator, count: getToolsByCategory("calculators").length },
    { key: "image" as const, icon: Image, count: getToolsByCategory("image").length },
    { key: "pdf" as const, icon: FileText, count: getToolsByCategory("pdf").length },
    { key: "media" as const, icon: Video, count: getToolsByCategory("media").length },
    { key: "student" as const, icon: GraduationCap, count: getToolsByCategory("student").length },
  ];

  const features = [
    { icon: Sparkles, title: "Free Forever", description: "All 60 tools completely free, no hidden costs" },
    { icon: UserX, title: "No Login Required", description: "Start using tools instantly, no account needed" },
    { icon: Zap, title: "Lightning Fast", description: "Browser-based processing, works offline" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CursorAnimation />
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <h1 className="text-2xl font-bold font-display">
              stu<span className="text-primary">DEN</span>t
            </h1>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link href="/dashboard">
              <Button data-testid="button-header-open-tools">
                Open Tools
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="min-h-[80vh] flex items-center justify-center px-4 sm:px-8 py-16 relative overflow-hidden">
          <ScrollReactiveBackground />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display mb-6 leading-tight"
            >
              All Student Tools.{" "}
              <span className="text-primary">One Website.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Your all-in-one productivity platform with 60 free tools for school and college students. 
              No login, no subscription, just tools that work.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-8 text-base group" data-testid="button-hero-open-tools">
                  Open Tools
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base" data-testid="button-hero-browse">
                  Browse All 60 Tools
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{feature.title}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <AdBanner className="mx-auto" />
        </div>

        <section className="py-16 px-4 sm:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.h3 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-bold text-center mb-4"
            >
              Why Choose StuDENT?
            </motion.h3>
            <motion.p 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
            >
              Built specifically for students who need reliable, fast, and free tools for everyday tasks.
            </motion.p>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} variants={fadeInUp}>
                    <Card className="text-center h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardContent className="pt-8 pb-6">
                        <motion.div 
                          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-8 h-8 text-primary" />
                        </motion.div>
                        <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <AdInContent className="mx-auto" />
        </div>

        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.h3 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold text-center mb-4"
            >
              Browse by Category
            </motion.h3>
            <motion.p 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
            >
              60 tools organized into 5 categories to help you find exactly what you need.
            </motion.p>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {categories.map((cat) => {
                const info = categoryInfo[cat.key];
                const Icon = cat.icon;
                return (
                  <motion.div key={cat.key} variants={fadeInUp}>
                    <Link href="/dashboard">
                      <Card 
                        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.03] hover:-translate-y-1"
                        data-testid={`card-category-${cat.key}`}
                      >
                        <CardContent className="pt-6 pb-4 text-center">
                          <motion.div 
                            className={`w-14 h-14 rounded-xl ${info.color} flex items-center justify-center mx-auto mb-4 text-white`}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-7 h-7" />
                          </motion.div>
                          <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{info.name}</h4>
                          <p className="text-sm text-muted-foreground">{cat.count} tools</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold font-display mb-4">
                stu<span className="text-primary">DEN</span>t
              </h4>
              <p className="text-muted-foreground text-sm">
                The ultimate productivity platform for students. 60 free tools to help you succeed in school and college.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    All Tools
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} StuDENT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
