"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface FaceVerificationProps {
  storedFaceImage: string
  onVerificationComplete: (success: boolean) => void
}

export function FaceVerification({ storedFaceImage, onVerificationComplete }: FaceVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (verificationStatus === "verifying") {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            return 100
          }
          return prev + 10
        })
      }, 200)

      return () => clearInterval(timer)
    }
  }, [verificationStatus])

  useEffect(() => {
    if (progress === 100) {
      // Simulate face verification with stored image
      setTimeout(() => {
        const success = simulateFaceVerification()
        setVerificationStatus(success ? "success" : "failed")
        onVerificationComplete(success)
      }, 500)
    }
  }, [progress])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
        setCameraError(null)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Camera access denied. Face verification is required to vote.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageSrc = canvas.toDataURL("image/png")
        setCapturedImage(imageSrc)
        stopCamera()
        setVerificationStatus("verifying")
      }
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setVerificationStatus("idle")
    setProgress(0)
    startCamera()
  }

  // Simulate face verification with stored image
  // In a real app, this would use a face recognition API
  const simulateFaceVerification = () => {
    // For demo purposes, we'll randomly succeed or fail with 80% success rate
    // In a real app, this would compare the captured image with the stored image
    return Math.random() < 0.8
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg border bg-background">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-64 w-full object-cover"
              onCanPlay={() => videoRef.current?.play()}
            />
            <canvas ref={canvasRef} className="hidden" />

            {cameraError && (
              <Alert variant="destructive" className="absolute inset-0 flex items-center justify-center">
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 border-4 border-dashed border-primary/30 pointer-events-none"
              style={{
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {!isStreaming && !cameraError ? (
                <Button onClick={startCamera} variant="secondary">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                !cameraError && (
                  <Button onClick={captureImage} variant="secondary">
                    <Camera className="mr-2 h-4 w-4" />
                    Verify Face
                  </Button>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="h-64 w-full object-cover" />

              <AnimatePresence>
                {verificationStatus === "verifying" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center"
                  >
                    <p className="text-white mb-2">Verifying your identity...</p>
                    <div className="w-3/4">
                      <Progress value={progress} className="h-2" />
                    </div>
                  </motion.div>
                )}

                {verificationStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="bg-green-500 rounded-full p-4"
                    >
                      <Check className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                )}

                {verificationStatus === "failed" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex flex-col items-center justify-center"
                  >
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-white text-center px-4">Verification failed. Please try again.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {verificationStatus !== "success" && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <Button onClick={resetCapture} variant="secondary">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {verificationStatus === "failed" ? "Try Again" : "Retake"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Your face will be verified against your registered image for security purposes.</p>
      </div>
    </div>
  )
}
