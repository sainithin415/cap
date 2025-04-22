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
import { WebcamCapture } from "@/components/webcam-capture"
import { PhoneVerification } from "@/components/phone-verification"
import { getAllVoters, deleteVoter, registerVoter, type Voter } from "@/lib/db-service"
import { calculateAge, formatDate } from "@/lib/utils"
import { Plus, Trash2, UserRound, CheckCircle2, XCircle } from "lucide-react"
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

export default function AdminVotersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [voters, setVoters] = useState<Voter[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVoterId, setSelectedVoterId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    aadhaar: "",
    password: "",
  })
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(false)
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

    loadVoters()
  }, [user, router])

  const loadVoters = () => {
    const allVoters = getAllVoters()
    setVoters(allVoters)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredVoters = voters.filter(
    (voter) =>
      voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.aadhaar.includes(searchTerm),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      dob: "",
      email: "",
      phone: "",
      aadhaar: "",
      password: "",
    })
    setFaceImage(null)
    setPhoneVerified(false)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.dob) newErrors.dob = "Date of birth is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone) newErrors.phone = "Phone number is required"
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits"
    if (!formData.aadhaar) newErrors.aadhaar = "Aadhaar number is required"
    else if (!/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = "Aadhaar number must be 12 digits"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (!faceImage) newErrors.faceImage = "Face capture is required"
    if (!phoneVerified) newErrors.phoneVerified = "Phone verification is required"

    const age = calculateAge(formData.dob)
    if (age < 18) newErrors.age = "Voter must be at least 18 years old"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddVoter = () => {
    if (!validateForm()) return

    const success = registerVoter({
      name: formData.name,
      dob: formData.dob,
      email: formData.email,
      phone: formData.phone,
      aadhaar: formData.aadhaar,
      password: formData.password,
      faceImage: faceImage || undefined,
    })

    if (success) {
      setIsAddDialogOpen(false)
      resetForm()
      loadVoters()
      setStatusMessage({
        type: "success",
        message: "Voter added successfully",
      })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      setStatusMessage({
        type: "error",
        message: "Failed to add voter. Email or Aadhaar may already be registered.",
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setSelectedVoterId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteVoter = () => {
    if (!selectedVoterId) return

    const success = deleteVoter(selectedVoterId)

    if (success) {
      setIsDeleteDialogOpen(false)
      loadVoters()
      setStatusMessage({
        type: "success",
        message: "Voter deleted successfully",
      })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      setStatusMessage({
        type: "error",
        message: "Failed to delete voter",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <Tabs defaultValue="voters">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard" onClick={() => router.push("/admin/dashboard")}>
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="voters">Voters</TabsTrigger>
              <TabsTrigger value="candidates" onClick={() => router.push("/admin/candidates")}>
                Candidates
              </TabsTrigger>
              <TabsTrigger value="elections" onClick={() => router.push("/admin/elections")}>
                Elections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voters">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="relative w-64">
                      <Input
                        placeholder="Search voters..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8"
                      />
                      <UserRound className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Voter
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
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Aadhaar</TableHead>
                          <TableHead>Voted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVoters.length > 0 ? (
                          filteredVoters.map((voter) => (
                            <TableRow key={voter.id}>
                              <TableCell className="font-medium">{voter.name}</TableCell>
                              <TableCell>{formatDate(voter.dob)}</TableCell>
                              <TableCell>{voter.email}</TableCell>
                              <TableCell>{voter.phone}</TableCell>
                              <TableCell>{voter.aadhaar}</TableCell>
                              <TableCell>
                                {voter.hasVoted ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(voter.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No voters found
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

      {/* Add Voter Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Voter</DialogTitle>
            <DialogDescription>Enter the details of the new voter</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Voter Name</Label>
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
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                />
                {formData.phone && formData.phone.length === 10 && !phoneVerified && (
                  <PhoneVerification phone={formData.phone} onVerified={() => setPhoneVerified(true)} />
                )}
              </div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              {errors.phoneVerified && <p className="text-sm text-destructive">{errors.phoneVerified}</p>}
              {phoneVerified && (
                <p className="text-sm text-green-600 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Phone verified
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                name="aadhaar"
                value={formData.aadhaar}
                onChange={handleChange}
                placeholder="Enter 12-digit Aadhaar number"
              />
              {errors.aadhaar && <p className="text-sm text-destructive">{errors.aadhaar}</p>}
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
              <Label>Face Capture</Label>
              <WebcamCapture onCapture={(imageSrc) => setFaceImage(imageSrc)} />
              {errors.faceImage && <p className="text-sm text-destructive">{errors.faceImage}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVoter}>Add Voter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this voter? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVoter}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
