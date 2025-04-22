"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initializeDb } from "@/lib/db-service"
import { motion } from "framer-motion"
import { AnimatedButton } from "@/components/animated-button"
import { ParticleBackground } from "@/components/particle-background"
import { ElectionBanner } from "@/components/election-banner"
import { CommissionSymbolsGrid } from "@/components/commission-symbols-grid"
import { QuotesCarousel } from "@/components/quotes-carousel"
import { VoteSymbol } from "@/components/vote-symbol"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Initialize mock database
    initializeDb()

    // Redirect if already logged in
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "voter") {
        router.push("/voting")
      } else if (user.role === "candidate") {
        router.push("/candidate-profile")
      }
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    setTimeout(async () => {
      const success = await login(email, password)

      if (success) {
        // Redirect based on user role
        if (user?.role === "admin") {
          router.push("/admin/dashboard")
        } else if (user?.role === "voter") {
          router.push("/voting")
        } else if (user?.role === "candidate") {
          router.push("/candidate-profile")
        }
      } else {
        setError("Invalid email or password")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <ParticleBackground />
      <Header />
      <main className="flex-1 flex flex-col p-4">
        <div className="container mx-auto mb-8">
          <ElectionBanner title="National Election Commission" subtitle="Secure, Transparent, and Fair Elections" />
        </div>

        <div className="container mx-auto flex-1 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <VoteSymbol type="checkmark" size="sm" className="mr-2" />
                Official Election Portal
              </h2>
              <p className="text-muted-foreground">
                Welcome to the official election portal. This secure platform allows eligible voters to cast their votes
                electronically. The system ensures the integrity and confidentiality of the electoral process.
              </p>
            </motion.div>

            <QuotesCarousel />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-auto"
            >
              <CommissionSymbolsGrid />
            </motion.div>
          </div>

          <div className="w-full md:w-1/2 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <VoteSymbol type="ballot" size="md" className="mb-4" />
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your credentials to access the voting system</CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-card"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-card"
                      />
                    </motion.div>
                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">
                        {error}
                      </motion.p>
                    )}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <AnimatedButton type="submit" className="w-full" isLoading={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                      </AnimatedButton>
                    </motion.div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <AnimatedButton variant="outline" onClick={() => router.push("/register")}>
                      Register
                    </AnimatedButton>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}