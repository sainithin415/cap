"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStats, getAllCandidates } from "@/lib/db-service"
import { Users, UserRound, Vote, Calendar, Award, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { AnimatedCounter } from "@/components/animated-counter"
import { VoteChart } from "@/components/vote-chart"
import { PageTransition } from "@/components/page-transition"
import { ParticleBackground } from "@/components/particle-background"
import { ElectionBanner } from "@/components/election-banner"
import { CommissionLogo } from "@/components/commission-logo"
import { OfficialQuote } from "@/components/official-quote"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalCandidates: 0,
    votersVoted: 0,
    activeElection: null as any,
  })
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }

    const electionStats = getStats()
    setStats(electionStats)

    // Get candidates for chart
    const candidates = getAllCandidates()
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"]

    const chartData = candidates
      .filter((c) => c.votes > 0)
      .map((candidate, index) => ({
        name: candidate.name,
        votes: candidate.votes,
        party: candidate.party,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 8)

    setChartData(chartData)
  }, [user, router])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <ParticleBackground variant="admin" />
      <Header />
      <PageTransition>
        <main className="flex-1 p-4">
          <div className="container mx-auto mb-6">
            <ElectionBanner 
              title="Election Commission Administration" 
              subtitle="Secure Management Portal"
              variant="secondary"
            />
          </div>
          
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <CommissionLogo 
                  src="/images/election-commission-logo.png" 
                  alt="Election Commission Logo" 
                  size="sm"
                />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/10">
                Admin Control Panel
              </Badge>
            </motion.div>

            <Tabs defaultValue="dashboard">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="voters" onClick={() => router.push("/admin/voters")}>
                    Voters
                  </TabsTrigger>
                  <TabsTrigger value="candidates" onClick={() => router.push("/admin/candidates")}>
                    Candidates
                  </TabsTrigger>
                  <TabsTrigger value="elections" onClick={() => router.push("/admin/elections")}>
                    Elections
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <TabsContent value="dashboard">
                <motion.div className="grid gap-6 md:grid-cols-3" variants={container} initial="hidden" animate="show">
                  <motion.div variants={item}>
                    <AnimatedCounter
                      value={stats.totalVoters}
                      title="Total Voters"
                      icon={<UserRound className="h-6 w-6" />}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <AnimatedCounter
                      value={stats.totalCandidates}
                      title="Total Candidates"
                      icon={<Users className="h-6 w-6" />}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <AnimatedCounter
                      value={stats.votersVoted}
                      title="Votes Cast"
                      icon={<Vote className="h-6 w-6" />}
                      suffix={
                        stats.totalVoters > 0 ? ` (${Math.round((stats.votersVoted / stats.totalVoters) * 100)}%)` : ""
                      }
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-6 grid gap-6 md:grid-cols-3"
                >
                  <Card className="md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Election Status</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {stats.activeElection ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">{stats.activeElection.title}</h3>
                            <Badge variant="default" className="animate-pulse">
                              Active
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stats.activeElection.description}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                              <p>{formatDate(stats.activeElection.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">End Date</p>
                              <p>{formatDate(stats.activeElection.endDate)}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Positions</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {stats.activeElection.positions.map((position: string) => (
                                <Badge key={position} variant="outline">
                                  {position}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => router.push("/admin/elections")} className="w-full">
                            Manage Elections
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.1, 1] }}
                            transition={{ duration: 0.5 }}
                            className="text-muted-foreground mb-4"
                          >
                            <Calendar className="h-12 w-12 mx-auto opacity-50" />
                          </motion.div>
                          <p className="text-muted-foreground mb-4">No active election</p>
                          <Button onClick={() => router.push("/admin/elections")}>Schedule an Election</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="md:col-span-2">
                    {chartData.length > 0 ? (
                      <VoteChart data={chartData} />
                    ) : (
                      <Card className="h-full flex flex-col justify-center items-center">
                        <CardContent className="text-center py-12">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.1, 1] }}
                            transition={{ duration: 0.5 }}
                            className="text-muted-foreground mb-4"
                          >
                            <TrendingUp className="h-12 w-12 mx-auto opacity-50" />
                          </motion.div>
                          <h3 className="text-xl font-bold mb-2">No Vote Data</h3>
                          <p className="text-muted-foreground mb-4">
                            Vote data will appear here once the election has started and votes have been cast.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-6"
                >
                  <OfficialQuote
                    quote="The right to vote is a cornerstone of democracy. The Election Commission is committed to ensuring that every eligible citizen can exercise this right freely and fairly."
                    author="Election Commission"
                    role="Official Statement"
                    variant="primary"
                  />
                </motion.div>

                {stats.activeElection && chartData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-6"
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leading Candidates</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          {chartData.slice(0, 3).map((candidate, index) => (
                            <motion.div
                              key={candidate.name}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 + 0.7 }}
                              className="bg-card/50 rounded-lg p-4 relative overflow-hidden border"
                            >
                              {index === 0 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1, type: "spring" }}
                                  className="absolute top-2 right-2"
                                >
                                  <span className="text-yellow-500 text-xl">🏆</span>
                                </motion.div>
                              )}
                              <h4 className="font-bold text-lg">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">{candidate.party}</p>
                              <div className="mt-2 relative pt-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xs font-semibold inline-block text-primary">
                                      {candidate.votes} votes
                                    </span>
                                  </div>
                                </div>
                                <div className="flex overflow-hidden h-2 mb-4 text-xs rounded bg-primary/10 mt-1">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(candidate.votes / chartData[0].votes) * 100}%` }}
                                    transition={{ duration: 1, delay: 1 }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                                    style={{ backgroundColor: candidate.color }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </PageTransition>
      <footer className="bg-background/80 p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Election Commission. All rights reserved.
      </footer>
      <style jsx global>{`
        body {
          background: linear-gradient(to bottom, #f0f4f8, #e0e7ff);
        }
      `}</style>
    </div>
  )
}