"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface VoteSymbolProps {
  type: "ballot" | "checkmark" | "fingerprint" | "evm" | "hand"
  size?: "sm" | "md" | "lg"
  className?: string
  withPulse?: boolean
}

export function VoteSymbol({ type, size = "md", className, withPulse = false }: VoteSymbolProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const getSymbolSrc = () => {
    switch (type) {
      case "ballot":
        return "/images/ballot-symbol.png"
      case "checkmark":
        return "/images/vote-checkmark.png"
      case "fingerprint":
        return "/images/fingerprint-symbol.png"
      case "evm":
        return "/images/evm-symbol.png"
      case "hand":
        return "/images/vote-hand.png"
      default:
        return "/images/ballot-symbol.png"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("relative flex items-center justify-center", withPulse && "animate-pulse", className)}
    >
      <img
        src={getSymbolSrc() || "/placeholder.svg"}
        alt={`Vote ${type} symbol`}
        className={cn("object-contain", sizeClasses[size])}
      />
    </motion.div>
  )
}
