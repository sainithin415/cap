"use client"

import type React from "react"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void
}

export function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
        setCameraError(null)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Camera access denied. Please use file upload instead.")
      setShowFileUpload(true)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  const captureImage = useCallback(() => {
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
        onCapture(imageSrc)
        stopCamera()
      }
    }
  }, [onCapture, stopCamera])

  const resetCapture = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setCapturedImage(result)
        onCapture(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleCaptureMethod = () => {
    if (isStreaming) {
      stopCamera()
    }
    setShowFileUpload(!showFileUpload)
    setCameraError(null)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg border bg-background">
        {!capturedImage ? (
          <>
            {!showFileUpload ? (
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
                        Capture
                      </Button>
                    )
                  )}
                  <Button onClick={toggleCaptureMethod} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    {showFileUpload ? "Use Camera" : "Upload Image"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-64 w-full flex-col items-center justify-center p-4">
                <Input type="file" accept="image/*" onChange={handleFileUpload} className="mb-4" />
                <Button onClick={toggleCaptureMethod} variant="outline" className="mt-2">
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="h-64 w-full object-cover" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button onClick={resetCapture} variant="secondary">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
