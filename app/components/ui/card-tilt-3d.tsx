"use client";

import * as React from "react";
// `motion` v12 es el sucesor de `framer-motion`; mismas APIs, import desde "motion/react".
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Envoltorio que aplica una inclinación 3D interactiva (sigue el mouse) sobre
 * cualquier contenido. NO altera el contenido que envuelve: solo agrega el
 * movimiento físico encima. Usado para las tarjetas de personas (PersonCard).
 */
export function CardTilt3D({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], ["10.5deg", "-10.5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10.5deg", "10.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { width, height, left, top } = rect;
    mouseX.set((e.clientX - left) / width - 0.5);
    mouseY.set((e.clientY - top) / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div style={{ perspective: "1000px" }} className={className}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="h-full w-full transition-all duration-200"
      >
        <div
          style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
          className="h-full w-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
