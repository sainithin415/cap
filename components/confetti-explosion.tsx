"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ConfettiPiece {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
}

interface ConfettiExplosionProps {
  count?: number
  duration?: number
  onComplete?: () => void
}

export function ConfettiExplosion({ count = 100, duration = 2000, onComplete }: ConfettiExplosionProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

  useEffect(() => {
    const pieces: ConfettiPiece[] = []
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      })
    }
    setConfetti(pieces)

    const timer = setTimeout(() => {
      setConfetti([])
      if (onComplete) onComplete()
    }, duration)

    return () => clearTimeout(timer)
  }, [count, duration, onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `50%`,
            y: `50%`,
            opacity: 1,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: `${piece.x}%`,
            y: `${piece.y}%`,
            opacity: 0,
            scale: 1,
            rotate: piece.rotation,
          }}
          transition={{
            duration: duration / 1000,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.size < 8 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  )
}
