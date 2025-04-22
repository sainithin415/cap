"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface OfficialQuoteProps {
  quote: string
  author: string
  role?: string
  className?: string
  variant?: "primary" | "secondary" | "accent"
}

export function OfficialQuote({ quote, author, role, className, variant = "primary" }: OfficialQuoteProps) {
  const variantClasses = {
    primary: "bg-primary/5 border-primary/20",
    secondary: "bg-secondary/50 border-secondary/30",
    accent: "bg-accent border-accent/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("relative rounded-lg border p-6 shadow-sm", variantClasses[variant], className)}
    >
      <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/20 dark:text-primary/10" />
      <div className="pl-6">
        <p className="mb-4 italic text-lg">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center">
          <div>
            <p className="font-semibold">{author}</p>
            {role && <p className="text-sm text-muted-foreground">{role}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
