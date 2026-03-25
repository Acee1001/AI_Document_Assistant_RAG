"use client";

import { useEffect, useRef } from "react";

function isTouchDevice() {
  return ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isTouchDevice()) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const handleMove = (event: MouseEvent) => {
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
    };

    const handleHoverStart = () => {
      dot.style.background = "rgba(108, 99, 255, 1)";
      ring.style.borderColor = "rgba(0, 212, 255, 0.75)";
      ring.style.transform = "translate(-50%, -50%) scale(1.2)";
    };

    const handleHoverEnd = () => {
      dot.style.background = "rgba(0, 212, 255, 1)";
      ring.style.borderColor = "rgba(108, 99, 255, 0.8)";
      ring.style.transform = "translate(-50%, -50%) scale(1)";
    };

    document.addEventListener("mousemove", handleMove);
    document.querySelectorAll("a, button, input, textarea, select").forEach((el) => {
      el.addEventListener("mouseenter", handleHoverStart);
      el.addEventListener("mouseleave", handleHoverEnd);
    });

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.querySelectorAll("a, button, input, textarea, select").forEach((el) => {
        el.removeEventListener("mouseenter", handleHoverStart);
        el.removeEventListener("mouseleave", handleHoverEnd);
      });
    };
  }, []);

  return (
    <>
      {/* <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" /> */}
    </>
  );
}
