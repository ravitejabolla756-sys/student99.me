import { useEffect, useRef } from "react";

type AdType = "banner" | "sidebar" | "incontent" | "footer";

interface AdSlotProps {
  type: AdType;
  className?: string;
}

const adSizes: Record<AdType, { width: string; height: string }> = {
  banner: { width: "100%", height: "90px" },
  sidebar: { width: "300px", height: "250px" },
  incontent: { width: "100%", height: "250px" },
  footer: { width: "100%", height: "90px" }
};

const adSlotIds: Record<AdType, string> = {
  banner: "1530197644",
  sidebar: "0987654321",
  incontent: "1122334455",
  footer: "5544332211"
};

export function AdSlot({ type, className = "" }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushAttempted = useRef(false);

  useEffect(() => {
    if (!adRef.current || pushAttempted.current) return;

    const timeoutId = setTimeout(() => {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        pushAttempted.current = true;
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const size = adSizes[type];

  return (
    <div
      className={`ad-container ${className}`}
      style={{
        minHeight: size.height,
        width: size.width,
        maxWidth: "100%",
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "4px",
          left: "8px",
          fontSize: "10px",
          color: "rgba(128, 128, 128, 0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          zIndex: 10
        }}
      >
        Sponsored
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: size.height }}
        data-ad-client="ca-pub-5122503324671300"
        data-ad-slot={adSlotIds[type]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
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
