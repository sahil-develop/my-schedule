'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  max?: number;
}

// Mouse-driven perspective tilt — gives cards a "3D" feel with plain CSS
// transforms, no WebGL/three.js dependency needed for this effect.
export function Tilt3D({ children, className, max = 10 }: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * max * 2;
    const rotateX = (0.5 - py) * max * 2;
    el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('transition-transform duration-200 ease-out will-change-transform', className)}
      style={{ transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' }}
    >
      {children}
    </div>
  );
}
