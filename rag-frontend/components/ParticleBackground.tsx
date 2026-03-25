"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

const colors = ["rgba(108, 99, 255, 0.35)", "rgba(0, 212, 255, 0.28)"];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frame = useRef<number | null>(null);
  const pointer = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);

  const initParticles = (width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 80; i += 1) {
      const radius = Math.random() * 2 + 1;
      const speed = 0.15 + Math.random() * 0.35;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius,
        alpha: 0.3 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(width, height);
    };

    resize();

    const onMouseMove = (event: MouseEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseLeave = () => {
      pointer.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const parts = particlesRef.current;
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = pointer.current.x - p.x;
        const dy = pointer.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          p.x += dx * 0.0015;
          p.y += dy * 0.0015;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("0.3", p.alpha.toString());
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.closePath();
      }

      for (let i = 0; i < parts.length; i += 1) {
        for (let j = i + 1; j < parts.length; j += 1) {
          const p1 = parts[i];
          const p2 = parts[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = 0.35 - dist / 400;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108, 99, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }

      frame.current = window.requestAnimationFrame(animate);
    };

    frame.current = window.requestAnimationFrame(animate);

    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
    />
  );
}
