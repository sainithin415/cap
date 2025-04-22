"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CommissionLogoProps {
  src: string
  alt: string
  size?: "sm" | "md" | "lg"
  className?: string
  withAnimation?: boolean
}

export function CommissionLogo({ src, alt, size = "md", className, withAnimation = true }: CommissionLogoProps) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const Logo = () => (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img src={src || "/placeholder.svg"} alt={alt} className={cn("object-contain", sizeClasses[size])} />
    </div>
  )

  if (!withAnimation) return <Logo />

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <Logo />
    </motion.div>
  )
}
