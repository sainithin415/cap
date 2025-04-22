"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllCandidates, deleteCandidate, registerCandidate, type Candidate } from "@/lib/db-service"
import { calculateAge, formatDate } from "@/lib/utils"
import { Plus, Trash2, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminCandidatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    position: "",
    party: "",
    password: "",
  })
  const [partySymbol, setPartySymbol] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }

    loadCandidates()
  }, [user, router])

  const loadCandidates = () => {
    const allCandidates = getAllCandidates()
    setCandidates(allCandidates)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPartySymbol(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      dob: "",
      email: "",
      position: "",
      party: "",
      password: "",
    })
    setPartySymbol(null)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.dob) newErrors.dob = "Date of birth is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.position) newErrors.position = "Position is required"
    if (!formData.party) newErrors.party = "Party name is required"
    if (!partySymbol) newErrors.partySymbol = "Party symbol is required"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"

    const age = calculateAge(formData.dob)
    if (age < 25) newErrors.age = "Candidate must be at least 25 years old"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddCandidate = () => {
    if (!validateForm()) return

    const success = registerCandidate({
      name: formData.name,
      dob: formData.dob,
      email: formData.email,
      position: formData.position,
      party: formData.party,
      partySymbol: partySymbol || "",
      password: formData.password,
    })

    if (success) {
      setIsAddDialogOpen(false)
      resetForm()
      loadCandidates()
      setStatusMessage({
        type: "success",
        message: "Candidate added successfully",
      })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      setStatusMessage({
        type: "error",
        message: "Failed to add candidate. Email may already be registered.",
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setSelectedCandidateId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteCandidate = () => {
    if (!selectedCandidateId) return

    const success = deleteCandidate(selectedCandidateId)

    if (success) {
      setIsDeleteDialogOpen(false)
      loadCandidates()
      setStatusMessage({
        type: "success",
        message: "Candidate deleted successfully",
      })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      setStatusMessage({
        type: "error",
        message: "Failed to delete candidate",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <Tabs defaultValue="candidates">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard" onClick={() => router.push("/admin/dashboard")}>
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="voters" onClick={() => router.push("/admin/voters")}>
                Voters
              </TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="elections" onClick={() => router.push("/admin/elections")}>
                Elections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="candidates">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="relative w-64">
                      <Input
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8"
                      />
                      <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Candidate
                    </Button>
                  </div>

                  {statusMessage && (
                    <Alert variant={statusMessage.type === "success" ? "default" : "destructive"} className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{statusMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{statusMessage.message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>DOB</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Votes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                              <TableCell className="font-medium">{candidate.name}</TableCell>
                              <TableCell>{formatDate(candidate.dob)}</TableCell>
                              <TableCell>{candidate.position}</TableCell>
                              <TableCell>{candidate.party}</TableCell>
                              <TableCell>
                                {candidate.partySymbol && (
                                  <img
                                    src={candidate.partySymbol || "/placeholder.svg"}
                                    alt={`${candidate.party} Symbol`}
                                    className="h-10 w-10 object-contain"
                                  />
                                )}
                              </TableCell>
                              <TableCell>{candidate.votes}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(candidate.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No candidates found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Candidate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>Enter the details of the new candidate</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Candidate Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} />
              {errors.dob && <p className="text-sm text-destructive">{errors.dob}</p>}
              {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Participating Position</Label>
              <Select value={formData.position} onValueChange={(value) => handleSelectChange("position", value)}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MLA">MLA</SelectItem>
                  <SelectItem value="MP">MP</SelectItem>
                  <SelectItem value="Mayor">Mayor</SelectItem>
                  <SelectItem value="Councilor">Councilor</SelectItem>
                </SelectContent>
              </Select>
              {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="party">Party Name</Label>
              <Input
                id="party"
                name="party"
                value={formData.party}
                onChange={handleChange}
                placeholder="Enter party name"
              />
              {errors.party && <p className="text-sm text-destructive">{errors.party}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="partySymbol">Party Symbol/Logo</Label>
              <Input id="partySymbol" type="file" accept="image/*" onChange={handleFileChange} />
              {partySymbol && (
                <div className="mt-2">
                  <img
                    src={partySymbol || "/placeholder.svg"}
                    alt="Party Symbol"
                    className="h-24 w-24 object-contain border rounded-md"
                  />
                </div>
              )}
              {errors.partySymbol && <p className="text-sm text-destructive">{errors.partySymbol}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCandidate}>Add Candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this candidate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCandidate}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
