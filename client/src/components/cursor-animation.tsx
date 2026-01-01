import { useEffect, useRef } from "react";

export function CursorAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      element: HTMLDivElement;
    }>
  >([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = particlesRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Create particle trail
      for (let i = 0; i < 3; i++) {
        const particle = document.createElement("div");
        particle.className =
          "pointer-events-none fixed w-2 h-2 bg-primary rounded-full blur-sm";
        particle.style.left = mouseX + "px";
        particle.style.top = mouseY + "px";
        particle.style.opacity = "0.6";
        document.body.appendChild(particle);

        const vx = (Math.random() - 0.5) * 4;
        const vy = (Math.random() - 0.5) * 4 - 2;

        particles.push({
          x: mouseX,
          y: mouseY,
          vx,
          vy,
          life: 1,
          element: particle,
        });
      }
    };

    const animate = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= 0.02;

        p.element.style.left = p.x + "px";
        p.element.style.top = p.y + "px";
        p.element.style.opacity = String(p.life * 0.6);

        if (p.life <= 0) {
          p.element.remove();
          particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      particles.forEach((p) => p.element.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  );
}
