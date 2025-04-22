"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.h1
          className="text-xl font-bold flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            className="inline-block"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            🗳️
          </motion.span>
          <span className="ml-2">Online Election Voting System</span>
        </motion.h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Button variant="outline" onClick={handleLogout} className="group">
                <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                Logout
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
