"use client"

import { motion } from "framer-motion"
import { CommissionLogo } from "./commission-logo"
import { VoteSymbol } from "./vote-symbol"

interface ElectionBannerProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  showQuote?: boolean
  showSymbol?: boolean
  variant?: "primary" | "secondary"
}

export function ElectionBanner({
  title = "Your Vote Matters",
  subtitle = "Exercise your democratic right",
  showLogo = true,
  showQuote = true,
  showSymbol = true,
  variant = "primary",
}: ElectionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full rounded-lg border p-6 shadow-md ${
        variant === "primary" ? "bg-primary/5 border-primary/20" : "bg-secondary/50 border-secondary/30"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {showLogo && (
          <div className="flex-shrink-0">
            <CommissionLogo src="/images/election-commission-logo.png" alt="Election Commission Logo" size="md" />
          </div>
        )}

        <div className="flex-grow text-center md:text-left">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            {subtitle}
          </motion.p>

          {showQuote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm italic"
            >
              "The ballot is stronger than the bullet." - Abraham Lincoln
            </motion.div>
          )}
        </div>

        {showSymbol && (
          <div className="flex-shrink-0">
            <VoteSymbol type="ballot" size="lg" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
