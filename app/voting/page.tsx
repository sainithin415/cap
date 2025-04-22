"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllCandidates, castVote, getActiveElection } from "@/lib/db-service"
import type { Candidate } from "@/lib/db-service"
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition } from "@/components/page-transition"
import { AnimatedButton } from "@/components/animated-button"
import { ConfettiExplosion } from "@/components/confetti-explosion"
import { ParticleBackground } from "@/components/particle-background"
import { FaceVerification } from "@/components/face-verification"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ElectionBanner } from "@/components/election-banner"
import { CommissionLogo } from "@/components/commission-logo"
import { VoteSymbol } from "@/components/vote-symbol"

export default function VotingPage() {
  // ... existing state and hooks ...
  const { user, logout } = useAuth()
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [positions, setPositions] = useState<string[]>([])
  const [votingStatus, setVotingStatus] = useState<"idle" | "success" | "error">("idle")
  const [votingMessage, setVotingMessage] = useState("")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [activeElection, setActiveElection] = useState<any>(null)
  const [electionError, setElectionError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [verificationStep, setVerificationStep] = useState<"selection" | "verification" | "confirmation">("selection")
  const [isVerified, setIsVerified] = useState(false)

  // ... existing useEffect and functions ...
  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "voter") {
      router.push("/")
      return
    }

    // Check for active election
    const election = getActiveElection()
    setActiveElection(election)

    if (!election) {
      setElectionError("There is no active election at the moment.")
      return
    }

    // Check if election has started
    const now = new Date()
    const startDate = new Date(election.startDate)
    const endDate = new Date(election.endDate)

    if (now < startDate) {
      setElectionError(`This election has not started yet. It will begin on ${formatDate(election.startDate)}.`)
      return
    }

    if (now > endDate) {
      setElectionError(`This election has ended on ${formatDate(election.endDate)}.`)
      return
    }

    if (user.hasVoted) {
      setVotingStatus("error")
      setVotingMessage("You have already cast your vote in this election.")
      return
    }

    const allCandidates = getAllCandidates()

    // Filter candidates by positions in the active election
    const electionCandidates = allCandidates.filter((c) => election.positions.includes(c.position))

    setCandidates(electionCandidates)

    // Extract unique positions from the filtered candidates
    const availablePositions = Array.from(new Set(electionCandidates.map((c) => c.position))).filter((position) =>
      election.positions.includes(position),
    )

    setPositions(availablePositions)

    if (availablePositions.length > 0) {
      setSelectedPosition(availablePositions[0])
    }
  }, [user, router])

  const filteredCandidates = candidates.filter((c) => c.position === selectedPosition)

  const handleVote = () => {
    if (!selectedCandidate) {
      setVotingStatus("error")
      setVotingMessage("Please select a candidate to vote for.")
      return
    }

    setVerificationStep("verification")
  }

  const handleVerificationComplete = (success: boolean) => {
    setIsVerified(success)
    if (success) {
      setTimeout(() => {
        setVerificationStep("confirmation")
      }, 1500)
    }
  }

  const confirmVote = () => {
    setConfirmDialogOpen(false)
    setIsVoting(true)

    if (!user || !selectedCandidate) return

    setTimeout(() => {
      const success = castVote(user.id, selectedCandidate)

      if (success) {
        setVotingStatus("success")
        setVotingMessage("Your vote has been successfully recorded. Thank you for voting!")
        setShowConfetti(true)
        setTimeout(() => {
          logout()
          router.push("/")
        }, 5000)
      } else {
        setVotingStatus("error")
        setVotingMessage("There was an error casting your vote. Please try again.")
      }
      setIsVoting(false)
    }, 1500)
  }

  if (electionError) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
        <ParticleBackground />
        <Header />
        <PageTransition>
          <main className="flex-1 p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="border-2 border-destructive/20">
                <CardHeader className="flex flex-col items-center">
                  <CommissionLogo
                    src="/images/election-commission-logo.png"
                    alt="Election Commission Logo"
                    size="sm"
                    className="mb-4"
                  />
                  <CardTitle className="text-2xl">Election Notice</CardTitle>
                  <CardDescription>Voting is currently unavailable</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cannot Vote</AlertTitle>
                    <AlertDescription>{electionError}</AlertDescription>
                  </Alert>
                  <div className="mt-4 flex justify-center">
                    <AnimatedButton onClick={() => router.push("/")}>Return to Home</AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </PageTransition>
      </div>
    )
  }

  if (user?.hasVoted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
        <ParticleBackground />
        <Header />
        <PageTransition>
          <main className="flex-1 p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="border-2 border-green-500/20">
                <CardHeader className="flex flex-col items-center">
                  <CommissionLogo
                    src="/images/election-commission-logo.png"
                    alt="Election Commission Logo"
                    size="sm"
                    className="mb-4"
                  />
                  <CardTitle className="text-2xl">Voting Complete</CardTitle>
                  <CardDescription>You have already cast your vote in this election</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Vote Recorded</AlertTitle>
                    <AlertDescription>
                      Your vote has been successfully recorded. You can only vote once per election.
                    </AlertDescription>
                  </Alert>
                  <div className="mt-4 flex justify-center">
                    <AnimatedButton onClick={() => router.push("/")}>Return to Home</AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </PageTransition>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <ParticleBackground variant="voting" />
      {showConfetti && <ConfettiExplosion count={200} />}
      <Header />
      <PageTransition>
        <main className="flex-1 p-4">
          <div className="container mx-auto mb-6">
            <ElectionBanner
              title={activeElection?.title || "Official Voting Portal"}
              subtitle="Cast your vote securely and confidentially"
              variant="secondary"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto"
          >
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <VoteSymbol type="ballot" size="md" />
                  <div>
                    <CardTitle className="text-2xl">Cast Your Vote</CardTitle>
                    <CardDescription>
                      {activeElection ? (
                        <div className="flex flex-col gap-1">
                          <span>{activeElection.title}</span>
                          <span className="text-xs text-muted-foreground">
                            Election ends on {formatDate(activeElection.endDate)}
                          </span>
                        </div>
                      ) : (
                        "Select a candidate to vote for in the election"
                      )}
                    </CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent>
                {votingStatus === "idle" ? (
                  <>
                    <Tabs value={verificationStep} onValueChange={(value) => setVerificationStep(value as any)}>
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="selection" disabled={verificationStep !== "selection"}>
                          1. Select Candidate
                        </TabsTrigger>
                        <TabsTrigger value="verification" disabled={verificationStep !== "verification"}>
                          2. Verify Identity
                        </TabsTrigger>
                        <TabsTrigger value="confirmation" disabled={verificationStep !== "confirmation"}>
                          3. Confirm Vote
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="selection">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="position">Select Position</Label>
                            <Select value={selectedPosition || ""} onValueChange={setSelectedPosition}>
                              <SelectTrigger id="position" className="bg-card">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                {positions.map((position) => (
                                  <SelectItem key={position} value={position}>
                                    {position}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedPosition && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.5 }}
                              className="space-y-2"
                            >
                              <Label>Select Candidate</Label>
                              <RadioGroup
                                value={selectedCandidate || ""}
                                onValueChange={setSelectedCandidate}
                                className="space-y-4"
                              >
                                <AnimatePresence>
                                  {filteredCandidates.length > 0 ? (
                                    filteredCandidates.map((candidate, index) => (
                                      <motion.div
                                        key={candidate.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="flex items-center space-x-4 border rounded-md p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
                                      >
                                        <RadioGroupItem value={candidate.id} id={candidate.id} />
                                        <div className="flex items-center space-x-4 flex-1">
                                          {candidate.partySymbol && (
                                            <motion.img
                                              src={candidate.partySymbol || "/placeholder.svg"}
                                              alt={`${candidate.party} Symbol`}
                                              className="h-16 w-16 object-contain"
                                              whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                                              transition={{ duration: 0.5 }}
                                            />
                                          )}
                                          <div>
                                            <Label htmlFor={candidate.id} className="text-base font-medium">
                                              {candidate.name}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">{candidate.party}</p>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))
                                  ) : (
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-center py-8 text-muted-foreground"
                                    >
                                      No candidates available for this position.
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </RadioGroup>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex justify-end mt-6"
                          >
                            <AnimatedButton
                              onClick={handleVote}
                              disabled={!selectedCandidate || filteredCandidates.length === 0}
                            >
                              Continue to Verification
                            </AnimatedButton>
                          </motion.div>
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="verification">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="bg-primary/5 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                              <h3 className="font-medium">Identity Verification Required</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              For security purposes, please verify your identity by looking at the camera. Your face
                              will be compared with your registered image.
                            </p>
                          </div>

                          <FaceVerification
                            storedFaceImage={user?.faceImage || ""}
                            onVerificationComplete={handleVerificationComplete}
                          />

                          <div className="flex justify-between mt-6">
                            <Button
                              variant="outline"
                              onClick={() => setVerificationStep("selection")}
                              disabled={isVerified}
                            >
                              Back
                            </Button>
                          </div>
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="confirmation">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="bg-green-500/10 dark:bg-green-500/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <h3 className="font-medium">Identity Verified</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Your identity has been successfully verified. Please review your selection and confirm
                              your vote.
                            </p>
                          </div>

                          {selectedCandidate && (
                            <div className="py-4">
                              <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="flex items-center space-x-4 border rounded-md p-6 bg-card/50 backdrop-blur-sm"
                              >
                                {filteredCandidates.find((c) => c.id === selectedCandidate)?.partySymbol && (
                                  <img
                                    src={
                                      filteredCandidates.find((c) => c.id === selectedCandidate)?.partySymbol ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg"
                                    }
                                    alt="Party Symbol"
                                    className="h-20 w-20 object-contain"
                                  />
                                )}
                                <div>
                                  <p className="text-lg font-medium">
                                    {filteredCandidates.find((c) => c.id === selectedCandidate)?.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {filteredCandidates.find((c) => c.id === selectedCandidate)?.party}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">Position: {selectedPosition}</p>
                                </div>
                              </motion.div>
                            </div>
                          )}

                          <Alert variant="default" className="bg-primary/5 border-primary/20">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Important</AlertTitle>
                            <AlertDescription>
                              Your vote is anonymous and secure. Once confirmed, this action cannot be undone.
                            </AlertDescription>
                          </Alert>

                          <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => setVerificationStep("verification")}>
                              Back
                            </Button>
                            <AnimatedButton onClick={() => setConfirmDialogOpen(true)}>Confirm Vote</AnimatedButton>
                          </div>
                        </motion.div>
                      </TabsContent>
                    </Tabs>

                    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader className="flex flex-col items-center">
                          <CommissionLogo
                            src="/images/election-commission-logo.png"
                            alt="Election Commission Logo"
                            size="sm"
                            className="mb-4"
                          />
                          <DialogTitle>Final Confirmation</DialogTitle>
                          <DialogDescription>
                            Are you absolutely sure you want to cast your vote? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedCandidate && (
                          <div className="py-4">
                            <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-4 border rounded-md p-4 bg-primary/5"
                            >
                              {filteredCandidates.find((c) => c.id === selectedCandidate)?.partySymbol && (
                                <img
                                  src={
                                    filteredCandidates.find((c) => c.id === selectedCandidate)?.partySymbol ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt="Party Symbol"
                                  className="h-16 w-16 object-contain"
                                />
                              )}
                              <div>
                                <p className="text-base font-medium">
                                  {filteredCandidates.find((c) => c.id === selectedCandidate)?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {filteredCandidates.find((c) => c.id === selectedCandidate)?.party}
                                </p>
                              </div>
                            </motion.div>
                          </div>
                        )}
                        <DialogFooter className="flex space-x-2 sm:justify-end">
                          <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            Cancel
                          </Button>
                          <AnimatedButton onClick={confirmVote} isLoading={isVoting}>
                            {isVoting ? "Processing..." : "Cast My Vote"}
                          </AnimatedButton>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Alert variant={votingStatus === "success" ? "default" : "destructive"}>
                      {votingStatus === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>{votingStatus === "success" ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{votingMessage}</AlertDescription>
                    </Alert>
                    {votingStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-center"
                      >
                        <div className="flex justify-center mb-4">
                          <VoteSymbol type="checkmark" size="lg" />
                        </div>
                        <p className="text-muted-foreground mb-4">You will be redirected to the home page shortly...</p>
                        <AnimatedButton onClick={() => router.push("/")}>Return to Home</AnimatedButton>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  )
}
