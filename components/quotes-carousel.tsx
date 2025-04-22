"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OfficialQuote } from "./official-quote"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const quotes = [
  {
    quote: "The ballot is stronger than the bullet.",
    author: "Abraham Lincoln",
    role: "16th President of the United States",
  },
  {
    quote: "Democracy is not just the right to vote, it is the right to live in dignity.",
    author: "Naomi Klein",
    role: "Author and Activist",
  },
  {
    quote: "The vote is the most powerful instrument ever devised by human beings for breaking down injustice.",
    author: "Martin Luther King Jr.",
    role: "Civil Rights Leader",
  },
  {
    quote: "The ignorance of one voter in a democracy impairs the security of all.",
    author: "John F. Kennedy",
    role: "35th President of the United States",
  },
  {
    quote: "Democracy cannot succeed unless those who express their choice are prepared to choose wisely.",
    author: "Franklin D. Roosevelt",
    role: "32nd President of the United States",
  },
]

export function QuotesCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [autoplay])

  const next = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev + 1) % quotes.length)
  }

  const prev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev - 1 + quotes.length) % quotes.length)
  }

  return (
    <div className="relative w-full py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <OfficialQuote
            quote={quotes[current].quote}
            author={quotes[current].author}
            role={quotes[current].role}
            variant="secondary"
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center mt-4 gap-2">
        <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAutoplay(false)
                setCurrent(i)
              }}
              className={`h-2 w-2 rounded-full transition-all ${i === current ? "bg-primary w-4" : "bg-primary/30"}`}
            />
          ))}
        </div>
        <Button variant="outline" size="icon" onClick={next} className="rounded-full">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
