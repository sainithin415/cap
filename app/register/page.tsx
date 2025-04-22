"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRound, Users } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Register as Voter</CardTitle>
              <CardDescription>Register to vote in the upcoming election</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <UserRound className="h-24 w-24 mb-6 text-primary" />
              <Button onClick={() => router.push("/register/voter")} className="w-full">
                Register as Voter
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Register as Candidate</CardTitle>
              <CardDescription>Register to participate as a candidate</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Users className="h-24 w-24 mb-6 text-primary" />
              <Button onClick={() => router.push("/register/candidate")} className="w-full">
                Register as Candidate
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
