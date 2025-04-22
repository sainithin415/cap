"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WebcamCapture } from "@/components/webcam-capture"
import { PhoneVerification } from "@/components/phone-verification"
import { calculateAge } from "@/lib/utils"
import { registerVoter } from "@/lib/db-service"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VoterRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    aadhaar: "",
    password: "",
    confirmPassword: "",
  })
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [registrationStatus, setRegistrationStatus] = useState<"idle" | "success" | "error">("idle")
  const [registrationMessage, setRegistrationMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!faceImage) newErrors.faceImage = "Face capture is required"
    if (!phoneVerified) newErrors.phoneVerified = "Phone verification is required"

    const age = calculateAge(formData.dob)
    if (age < 18) newErrors.age = "You must be at least 18 years old to register as a voter"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const age = calculateAge(formData.dob)
    if (age < 18) {
      setRegistrationStatus("error")
      setRegistrationMessage("You must be at least 18 years old to register as a voter")
      return
    }

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
      setRegistrationStatus("success")
      setRegistrationMessage("Successfully registered as a voter")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } else {
      setRegistrationStatus("error")
      setRegistrationMessage("Registration failed. Email or Aadhaar may already be registered.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Voter Registration</CardTitle>
            <CardDescription>Register to vote in the upcoming election</CardDescription>
          </CardHeader>
          <CardContent>
            {registrationStatus === "idle" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Voter Name</Label>
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
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your 10-digit mobile number"
                    />
                    {formData.phone && formData.phone.length === 10 && !phoneVerified && (
                      <PhoneVerification phone={formData.phone} onVerified={() => setPhoneVerified(true)} />
                    )}
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  {errors.phoneVerified && <p className="text-sm text-destructive">{errors.phoneVerified}</p>}
                  {phoneVerified && (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Phone verified successfully
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
                    placeholder="Enter your 12-digit Aadhaar number"
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

                <div className="space-y-2">
                  <Label>Face Capture</Label>
                  <WebcamCapture onCapture={(imageSrc) => setFaceImage(imageSrc)} />
                  {errors.faceImage && <p className="text-sm text-destructive">{errors.faceImage}</p>}
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
