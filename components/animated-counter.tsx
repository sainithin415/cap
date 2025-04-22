"use client"

import type React from "react"

import { useEffect, useState } from "react"
import CountUp from "react-countup"
import { motion } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  title: string
  icon: React.ReactNode
  prefix?: string
  suffix?: string
  duration?: number
}

export function AnimatedCounter({ value, title, icon, prefix = "", suffix = "", duration = 2 }: AnimatedCounterProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-primary mb-4 p-3 bg-primary/10 rounded-full"
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      <div className="text-3xl font-bold">
        {prefix}
        <CountUp end={value} duration={duration} separator="," />
        {suffix}
      </div>
    </motion.div>
  )
}
