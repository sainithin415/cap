"use client"

import { motion } from "framer-motion"
import { CommissionLogo } from "./commission-logo"
import { VoteSymbol } from "./vote-symbol"

export function CommissionSymbolsGrid() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-6"
    >
      <motion.div variants={item} className="flex flex-col items-center">
        <CommissionLogo
          src="/images/election-commission-logo.png"
          alt="Election Commission Logo"
          size="md"
          withAnimation={false}
        />
        <p className="mt-2 text-sm text-center">National Election Commission</p>
      </motion.div>

      <motion.div variants={item} className="flex flex-col items-center">
        <VoteSymbol type="ballot" size="md" />
        <p className="mt-2 text-sm text-center">Official Ballot</p>
      </motion.div>

      <motion.div variants={item} className="flex flex-col items-center">
        <VoteSymbol type="evm" size="md" />
        <p className="mt-2 text-sm text-center">Electronic Voting Machine</p>
      </motion.div>

      <motion.div variants={item} className="flex flex-col items-center">
        <VoteSymbol type="fingerprint" size="md" />
        <p className="mt-2 text-sm text-center">Biometric Verification</p>
      </motion.div>

      <motion.div variants={item} className="flex flex-col items-center">
        <VoteSymbol type="hand" size="md" />
        <p className="mt-2 text-sm text-center">Cast Your Vote</p>
      </motion.div>
    </motion.div>
  )
}
