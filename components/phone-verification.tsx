"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface PhoneVerificationProps {
  phone: string
  onVerified: () => void
}

export function PhoneVerification({ phone, onVerified }: PhoneVerificationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")

  const sendOtp = () => {
    // In a real app, this would call an API to send an OTP
    // For demo purposes, we'll generate a random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(newOtp)
    setIsOpen(true)
    console.log(`OTP sent to ${phone}: ${newOtp}`)
  }

  const verifyOtp = () => {
    setIsVerifying(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      if (otp === generatedOtp) {
        setIsOpen(false)
        onVerified()
      } else {
        setError("Invalid OTP. Please try again.")
      }
      setIsVerifying(false)
    }, 1000)
  }

  return (
    <div>
      <Button type="button" onClick={sendOtp} variant="outline">
        Verify Phone Number
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phone Verification</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit code to {phone}. Enter the code below to verify your phone number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">For demo purposes, the OTP is: {generatedOtp}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={verifyOtp} disabled={otp.length !== 6 || isVerifying}>
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
