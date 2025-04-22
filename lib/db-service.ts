// This is a mock database service using localStorage
// In a real application, this would be replaced with actual database calls

export type Voter = {
  id: string
  name: string
  email: string
  dob: string
  phone: string
  aadhaar: string
  password: string
  faceImage?: string
  hasVoted: boolean
  role: "voter"
}

export type Candidate = {
  id: string
  name: string
  email: string
  dob: string
  position: string
  party: string
  partySymbol: string
  password: string
  role: "candidate"
  votes: number
}

export type Admin = {
  id: string
  name: string
  email: string
  password: string
  role: "admin"
}

export type Election = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  positions: string[]
  isActive: boolean
}

type User = Voter | Candidate | Admin

// Initialize mock data
export function initializeDb() {
  if (typeof window === "undefined") return

  // Check if data already exists
  if (!localStorage.getItem("users")) {
    const admin: Admin = {
      id: "admin1",
      name: "Admin User",
      email: "admin@election.com",
      password: "admin123",
      role: "admin",
    }

    localStorage.setItem("users", JSON.stringify([admin]))
    localStorage.setItem("voters", JSON.stringify([]))
    localStorage.setItem("candidates", JSON.stringify([]))
    localStorage.setItem("elections", JSON.stringify([]))
  }
}

// Voter functions
export function registerVoter(voter: Omit<Voter, "id" | "role" | "hasVoted">): boolean {
  if (typeof window === "undefined") return false

  const voters = JSON.parse(localStorage.getItem("voters") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Check if voter with same email or aadhaar exists
  if (voters.some((v: Voter) => v.email === voter.email || v.aadhaar === voter.aadhaar)) {
    return false
  }

  const newVoter: Voter = {
    ...voter,
    id: `voter_${Date.now()}`,
    role: "voter",
    hasVoted: false,
  }

  voters.push(newVoter)
  users.push(newVoter)

  localStorage.setItem("voters", JSON.stringify(voters))
  localStorage.setItem("users", JSON.stringify(users))
  return true
}

export function getAllVoters(): Voter[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("voters") || "[]")
}

export function updateVoter(id: string, voterData: Partial<Voter>): boolean {
  if (typeof window === "undefined") return false

  const voters = JSON.parse(localStorage.getItem("voters") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  const voterIndex = voters.findIndex((v: Voter) => v.id === id)
  const userIndex = users.findIndex((u: User) => u.id === id)

  if (voterIndex === -1 || userIndex === -1) return false

  voters[voterIndex] = { ...voters[voterIndex], ...voterData }
  users[userIndex] = { ...users[userIndex], ...voterData }

  localStorage.setItem("voters", JSON.stringify(voters))
  localStorage.setItem("users", JSON.stringify(users))
  return true
}

export function deleteVoter(id: string): boolean {
  if (typeof window === "undefined") return false

  const voters = JSON.parse(localStorage.getItem("voters") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  const filteredVoters = voters.filter((v: Voter) => v.id !== id)
  const filteredUsers = users.filter((u: User) => u.id !== id)

  localStorage.setItem("voters", JSON.stringify(filteredVoters))
  localStorage.setItem("users", JSON.stringify(filteredUsers))
  return true
}

// Candidate functions
export function registerCandidate(candidate: Omit<Candidate, "id" | "role" | "votes">): boolean {
  if (typeof window === "undefined") return false

  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Check if candidate with same email exists
  if (candidates.some((c: Candidate) => c.email === candidate.email)) {
    return false
  }

  const newCandidate: Candidate = {
    ...candidate,
    id: `candidate_${Date.now()}`,
    role: "candidate",
    votes: 0,
  }

  candidates.push(newCandidate)
  users.push(newCandidate)

  localStorage.setItem("candidates", JSON.stringify(candidates))
  localStorage.setItem("users", JSON.stringify(users))
  return true
}

export function getAllCandidates(): Candidate[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("candidates") || "[]")
}

export function updateCandidate(id: string, candidateData: Partial<Candidate>): boolean {
  if (typeof window === "undefined") return false

  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  const candidateIndex = candidates.findIndex((c: Candidate) => c.id === id)
  const userIndex = users.findIndex((u: User) => u.id === id)

  if (candidateIndex === -1 || userIndex === -1) return false

  candidates[candidateIndex] = { ...candidates[candidateIndex], ...candidateData }
  users[userIndex] = { ...users[userIndex], ...candidateData }

  localStorage.setItem("candidates", JSON.stringify(candidates))
  localStorage.setItem("users", JSON.stringify(users))
  return true
}

export function deleteCandidate(id: string): boolean {
  if (typeof window === "undefined") return false

  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  const filteredCandidates = candidates.filter((c: Candidate) => c.id !== id)
  const filteredUsers = users.filter((u: User) => u.id !== id)

  localStorage.setItem("candidates", JSON.stringify(filteredCandidates))
  localStorage.setItem("users", JSON.stringify(filteredUsers))
  return true
}

// Election functions
export function createElection(election: Omit<Election, "id">): boolean {
  if (typeof window === "undefined") return false

  const elections = JSON.parse(localStorage.getItem("elections") || "[]")

  // Check if there's already an active election
  if (election.isActive && elections.some((e: Election) => e.isActive)) {
    // Deactivate all other elections
    const updatedElections = elections.map((e: Election) => ({
      ...e,
      isActive: false,
    }))
    localStorage.setItem("elections", JSON.stringify(updatedElections))
  }

  const newElection: Election = {
    ...election,
    id: `election_${Date.now()}`,
  }

  elections.push(newElection)
  localStorage.setItem("elections", JSON.stringify(elections))

  // Reset all voters' hasVoted status when creating a new election
  if (election.isActive) {
    resetVoterStatus()
  }

  return true
}

export function getAllElections(): Election[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("elections") || "[]")
}

export function getActiveElection(): Election | null {
  if (typeof window === "undefined") return null
  const elections = JSON.parse(localStorage.getItem("elections") || "[]")
  return elections.find((e: Election) => e.isActive) || null
}

export function updateElection(id: string, electionData: Partial<Election>): boolean {
  if (typeof window === "undefined") return false

  const elections = JSON.parse(localStorage.getItem("elections") || "[]")
  const electionIndex = elections.findIndex((e: Election) => e.id === id)

  if (electionIndex === -1) return false

  // If we're activating this election, deactivate all others
  if (electionData.isActive) {
    for (let i = 0; i < elections.length; i++) {
      if (i !== electionIndex) {
        elections[i].isActive = false
      }
    }

    // Reset all voters' hasVoted status when activating an election
    resetVoterStatus()
  }

  elections[electionIndex] = { ...elections[electionIndex], ...electionData }
  localStorage.setItem("elections", JSON.stringify(elections))
  return true
}

export function deleteElection(id: string): boolean {
  if (typeof window === "undefined") return false

  const elections = JSON.parse(localStorage.getItem("elections") || "[]")
  const filteredElections = elections.filter((e: Election) => e.id !== id)
  localStorage.setItem("elections", JSON.stringify(filteredElections))
  return true
}

// Reset all voters' hasVoted status
function resetVoterStatus(): void {
  if (typeof window === "undefined") return

  const voters = JSON.parse(localStorage.getItem("voters") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Reset hasVoted for all voters
  const updatedVoters = voters.map((voter: Voter) => ({
    ...voter,
    hasVoted: false,
  }))

  // Update hasVoted in users array for voters
  const updatedUsers = users.map((user: User) => {
    if (user.role === "voter") {
      return {
        ...user,
        hasVoted: false,
      }
    }
    return user
  })

  // Reset votes for all candidates
  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const updatedCandidates = candidates.map((candidate: Candidate) => ({
    ...candidate,
    votes: 0,
  }))

  localStorage.setItem("voters", JSON.stringify(updatedVoters))
  localStorage.setItem("users", JSON.stringify(updatedUsers))
  localStorage.setItem("candidates", JSON.stringify(updatedCandidates))
}

// Voting functions
export function castVote(voterId: string, candidateId: string): boolean {
  if (typeof window === "undefined") return false

  // Check if there's an active election
  const activeElection = getActiveElection()
  if (!activeElection) return false

  const voters = JSON.parse(localStorage.getItem("voters") || "[]")
  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  const voterIndex = voters.findIndex((v: Voter) => v.id === voterId)
  const voter = voters[voterIndex]

  if (voterIndex === -1 || voter.hasVoted) return false

  const candidateIndex = candidates.findIndex((c: Candidate) => c.id === candidateId)
  if (candidateIndex === -1) return false

  // Update voter
  voters[voterIndex].hasVoted = true
  const userVoterIndex = users.findIndex((u: User) => u.id === voterId)
  users[userVoterIndex].hasVoted = true

  // Update candidate
  candidates[candidateIndex].votes += 1

  localStorage.setItem("voters", JSON.stringify(voters))
  localStorage.setItem("candidates", JSON.stringify(candidates))
  localStorage.setItem("users", JSON.stringify(users))
  return true
}

// Stats
export function getStats() {
  if (typeof window === "undefined") return { totalVoters: 0, totalCandidates: 0, votersVoted: 0, activeElection: null }

  const voters = JSON.parse(localStorage.getItem("voters") || "[]")
  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
  const activeElection = getActiveElection()

  return {
    totalVoters: voters.length,
    totalCandidates: candidates.length,
    votersVoted: voters.filter((v: Voter) => v.hasVoted).length,
    activeElection,
  }
}
