import { motion } from "framer-motion";
import { ToolCard } from "./tool-card";
import { Tool, categoryInfo, ToolCategory } from "@/lib/tools-data";

interface CategorySectionProps {
  category: ToolCategory;
  tools: Tool[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function CategorySection({ category, tools }: CategorySectionProps) {
  const info = categoryInfo[category];
  const Icon = info.icon;

  return (
    <section className="mb-12" data-testid={`section-category-${category}`}>
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        <h2 className="text-xl font-semibold">
          {info.name}
          <span className="text-muted-foreground font-normal ml-2">({tools.length})</span>
        </h2>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tools.map((tool) => (
          <motion.div key={tool.id} variants={itemVariants}>
            <ToolCard tool={tool} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
