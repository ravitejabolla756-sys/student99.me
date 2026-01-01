import { useEffect, useRef } from "react";

export function ScrollReactiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const blobs = blobsRef.current;
    if (!container || !blobs) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = container.offsetHeight;
      
      // Stop animation after hero section passes
      if (scrollY > heroHeight) {
        blobs.style.opacity = "0";
        return;
      }

      // Calculate parallax effect (slow movement)
      const parallaxRatio = 0.15;
      const translateY = scrollY * parallaxRatio;
      
      blobs.style.transform = `translateY(${translateY}px)`;
      blobs.style.opacity = String(Math.max(0, 1 - scrollY / (heroHeight * 1.5)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <div ref={blobsRef} className="relative w-full h-full transition-opacity duration-300">
        {/* Floating gradient blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-secondary/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-gradient-to-t from-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
