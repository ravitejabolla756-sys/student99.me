import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import { useTheme, themes, ThemeName } from "@/components/theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeEntries = (Object.entries(themes) as [ThemeName, { label: string; color: string }][]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Change theme"
      >
        <Palette className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-popover border border-popover-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 space-y-1">
            {/* Minimal theme */}
            <button
              onClick={() => {
                setTheme("minimal");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
            >
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300 flex-shrink-0"></div>
              <span className="flex-1 text-sm">Minimal</span>
              {theme === "minimal" && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>

            {/* Solar theme */}
            <button
              onClick={() => {
                setTheme("solar");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
            >
              <div className="w-4 h-4 rounded-full bg-yellow-300 flex-shrink-0"></div>
              <span className="flex-1 text-sm">Solar</span>
              {theme === "solar" && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>

            {/* Slate theme */}
            <button
              onClick={() => {
                setTheme("slate");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
            >
              <div className="w-4 h-4 rounded-full bg-slate-500 flex-shrink-0"></div>
              <span className="flex-1 text-sm">Slate</span>
              {theme === "slate" && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
