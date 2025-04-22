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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { createElection, getAllElections, updateElection, deleteElection, type Election } from "@/lib/db-service"
import { formatDate } from "@/lib/utils"
import { Plus, Trash2, Calendar, CheckCircle, XCircle } from "lucide-react"
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
import { MultiSelect } from "@/components/multi-select"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition } from "@/components/page-transition"
import { AnimatedButton } from "@/components/animated-button"
import { ParticleBackground } from "@/components/particle-background"

export default function AdminElectionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [elections, setElections] = useState<Election[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    positions: [] as string[],
    isActive: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const positionOptions = [
    { label: "MLA", value: "MLA" },
    { label: "MP", value: "MP" },
    { label: "Mayor", value: "Mayor" },
    { label: "Councilor", value: "Councilor" },
  ]

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }

    loadElections()
  }, [user, router])

  const loadElections = () => {
    const allElections = getAllElections()
    setElections(allElections)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handlePositionsChange = (selectedPositions: string[]) => {
    setFormData((prev) => ({ ...prev, positions: selectedPositions }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredElections = elections.filter(
    (election) =>
      election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      positions: [],
      isActive: false,
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title) newErrors.title = "Title is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.positions.length === 0) newErrors.positions = "At least one position is required"

    // Check if end date is after start date
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (endDate <= startDate) {
        newErrors.endDate = "End date must be after start date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddElection = () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    setTimeout(() => {
      const success = createElection({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        positions: formData.positions,
        isActive: formData.isActive,
      })

      if (success) {
        setIsAddDialogOpen(false)
        resetForm()
        loadElections()
        setStatusMessage({
          type: "success",
          message: formData.isActive ? "Election created and activated successfully" : "Election created successfully",
        })
        setTimeout(() => setStatusMessage(null), 3000)
      } else {
        setStatusMessage({
          type: "error",
          message: "Failed to create election",
        })
      }
      setIsSubmitting(false)
    }, 1000)
  }

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    const success = updateElection(id, { isActive: !currentStatus })

    if (success) {
      loadElections()
      setStatusMessage({
        type: "success",
        message: currentStatus ? "Election deactivated successfully" : "Election activated successfully",
      })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      setStatusMessage({
        type: "error",
        message: "Failed to update election status",
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setSelectedElectionId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteElection = () => {
    if (!selectedElectionId) return

    const success = deleteElection(selectedElectionId)

    if (success) {
      setIsDeleteDialogOpen(false)
      loadElections()
      setStatusMessage({
        type: "success",
        message: "Election deleted successfully",
      })
      setTimeout(() => setStatusMessage(null), 3000)
    } else {
      setStatusMessage({
        type: "error",
        message: "Failed to delete election",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ParticleBackground variant="admin" />
      <Header />
      <PageTransition>
        <main className="flex-1 p-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/10">
                Election Management
              </Badge>
            </motion.div>

            <Tabs defaultValue="elections">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="dashboard" onClick={() => router.push("/admin/dashboard")}>
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="voters" onClick={() => router.push("/admin/voters")}>
                    Voters
                  </TabsTrigger>
                  <TabsTrigger value="candidates" onClick={() => router.push("/admin/candidates")}>
                    Candidates
                  </TabsTrigger>
                  <TabsTrigger value="elections">Elections</TabsTrigger>
                </TabsList>
              </motion.div>

              <TabsContent value="elections">
                <Card>
                  <CardContent className="p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex justify-between items-center mb-6"
                    >
                      <div className="relative w-64">
                        <Input
                          placeholder="Search elections..."
                          value={searchTerm}
                          onChange={handleSearch}
                          className="pl-8 bg-white dark:bg-gray-800"
                        />
                        <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <AnimatedButton onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Election
                      </AnimatedButton>
                    </motion.div>

                    <AnimatePresence>
                      {statusMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="mb-4"
                        >
                          <Alert variant={statusMessage.type === "success" ? "default" : "destructive"}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{statusMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
                            <AlertDescription>{statusMessage.message}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="rounded-md border"
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Positions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {filteredElections.length > 0 ? (
                              filteredElections.map((election, index) => (
                                <motion.tr
                                  key={election.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="group"
                                >
                                  <TableCell className="font-medium">{election.title}</TableCell>
                                  <TableCell className="max-w-xs truncate">{election.description}</TableCell>
                                  <TableCell>{formatDate(election.startDate)}</TableCell>
                                  <TableCell>{formatDate(election.endDate)}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {election.positions.map((position) => (
                                        <Badge key={position} variant="outline" className="text-xs">
                                          {position}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={election.isActive ? "default" : "outline"}
                                      className={election.isActive ? "animate-pulse" : ""}
                                    >
                                      {election.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <AnimatedButton
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleActive(election.id, election.isActive)}
                                      >
                                        {election.isActive ? (
                                          <XCircle className="h-4 w-4 mr-1" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                        )}
                                        {election.isActive ? "Deactivate" : "Activate"}
                                      </AnimatedButton>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteClick(election.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </motion.tr>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col items-center"
                                  >
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                                    <p className="text-muted-foreground">No elections found</p>
                                  </motion.div>
                                </TableCell>
                              </TableRow>
                            )}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </PageTransition>

      {/* Add Election Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Election</DialogTitle>
            <DialogDescription>Enter the details for the new election</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter election title"
                className="bg-white dark:bg-gray-800"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter election description"
                rows={3}
                className="bg-white dark:bg-gray-800"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="bg-white dark:bg-gray-800"
                />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="bg-white dark:bg-gray-800"
                />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positions">Positions</Label>
              <MultiSelect
                options={positionOptions}
                selected={formData.positions}
                onChange={handlePositionsChange}
                placeholder="Select positions"
              />
              {errors.positions && <p className="text-sm text-destructive">{errors.positions}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="isActive">Activate election immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <AnimatedButton onClick={handleAddElection} isLoading={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Election"}
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this election? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <AnimatedButton variant="destructive" onClick={handleDeleteElection}>
              Delete
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
