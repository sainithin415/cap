"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { getAllCandidates, type Candidate } from "@/lib/db-service"

export default function CandidateProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [candidateData, setCandidateData] = useState<Candidate | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "candidate") {
      router.push("/")
      return
    }

    // Get candidate data
    const candidates = getAllCandidates()
    const candidate = candidates.find((c) => c.id === user.id)
    if (candidate) {
      setCandidateData(candidate)
    }
  }, [user, router])

  if (!candidateData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 flex items-center justify-center">
          <p>Loading candidate profile...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Candidate Profile</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your candidate registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{candidateData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-lg">{formatDate(candidateData.dob)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{candidateData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Position</p>
                  <p className="text-lg">{candidateData.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Party</p>
                  <p className="text-lg">{candidateData.party}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Party Symbol</CardTitle>
              <CardDescription>Your registered party symbol</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {candidateData.partySymbol ? (
                <img
                  src={candidateData.partySymbol || "/placeholder.svg"}
                  alt={`${candidateData.party} Symbol`}
                  className="h-48 w-48 object-contain border rounded-md"
                />
              ) : (
                <p>No party symbol uploaded</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Election Statistics</CardTitle>
              <CardDescription>Your current vote count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Votes Received</p>
                <p className="text-4xl font-bold">{candidateData.votes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
