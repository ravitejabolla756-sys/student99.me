import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type AdType = "banner" | "sidebar" | "incontent" | "footer";

interface AdSlotProps {
  type: AdType;
  className?: string;
}

const adSizes: Record<AdType, { width: string; height: string; mobileHeight: string }> = {
  banner: { width: "100%", height: "90px", mobileHeight: "60px" },
  sidebar: { width: "300px", height: "250px", mobileHeight: "250px" },
  incontent: { width: "100%", height: "120px", mobileHeight: "100px" },
  footer: { width: "100%", height: "90px", mobileHeight: "60px" }
};

export function AdSlot({ type, className = "" }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const size = adSizes[type];
  const height = isMobile ? size.mobileHeight : size.height;

  return (
    <motion.div
      ref={adRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-lg bg-muted/30 border border-border/50 ${className}`}
      style={{
        width: size.width,
        height: height,
        maxWidth: type === "sidebar" ? size.width : "100%"
      }}
    >
      <div className="absolute top-1 left-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
        Sponsored
      </div>
      
      {isVisible && (
        <div className="w-full h-full flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "100%" }}
            data-ad-client="ca-pub-XXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
      
      {!isVisible && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-muted-foreground/40 text-sm">Advertisement</div>
        </div>
      )}
    </motion.div>
  );
}

export function AdBanner({ className = "" }: { className?: string }) {
  return <AdSlot type="banner" className={className} />;
}

export function AdSidebar({ className = "" }: { className?: string }) {
  return <AdSlot type="sidebar" className={className} />;
}

export function AdInContent({ className = "" }: { className?: string }) {
  return <AdSlot type="incontent" className={className} />;
}

export function AdFooter({ className = "" }: { className?: string }) {
  return <AdSlot type="footer" className={className} />;
}
