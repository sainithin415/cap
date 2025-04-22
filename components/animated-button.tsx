"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

export function AnimatedButton({
  children,
  variant = "default",
  size = "default",
  isLoading = false,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button variant={variant} size={size} {...props}>
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          />
        ) : null}
        {children}
      </Button>
    </motion.div>
  )
}
