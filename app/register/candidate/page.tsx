"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateAge } from "@/lib/utils"
import { registerCandidate } from "@/lib/db-service"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CandidateRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    position: "",
    party: "",
    password: "",
    confirmPassword: "",
  })
  const [partySymbol, setPartySymbol] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [registrationStatus, setRegistrationStatus] = useState<"idle" | "success" | "error">("idle")
  const [registrationMessage, setRegistrationMessage] = useState("")

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
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    const age = calculateAge(formData.dob)
    if (age < 25) newErrors.age = "You must be at least 25 years old to register as a candidate"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const age = calculateAge(formData.dob)
    if (age < 25) {
      setRegistrationStatus("error")
      setRegistrationMessage("You must be at least 25 years old to register as a candidate")
      return
    }

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
      setRegistrationStatus("success")
      setRegistrationMessage("Successfully registered as a candidate")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } else {
      setRegistrationStatus("error")
      setRegistrationMessage("Registration failed. Email may already be registered.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Candidate Registration</CardTitle>
            <CardDescription>Register to participate as a candidate in the election</CardDescription>
          </CardHeader>
          <CardContent>
            {registrationStatus === "idle" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
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
                    placeholder="Enter your email"
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
                    placeholder="Enter your party name"
                  />
                  {errors.party && <p className="text-sm text-destructive">{errors.party}</p>}
                </div>

                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => router.push("/register")}>
                    Back
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            ) : (
              <Alert variant={registrationStatus === "success" ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{registrationStatus === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{registrationMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
