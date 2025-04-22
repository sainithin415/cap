"use client"

import { useCallback } from "react"
import Particles from "react-particles"
import type { Container, Engine } from "tsparticles-engine"
import { loadSlim } from "tsparticles-slim"
import { useTheme } from "next-themes"

interface ParticleBackgroundProps {
  variant?: "default" | "voting" | "admin"
}

export function ParticleBackground({ variant = "default" }: ParticleBackgroundProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // console.log(container)
  }, [])

  const getParticleConfig = () => {
    const baseConfig = {
      particles: {
        number: {
          value: isDark ? 80 : 40,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        opacity: {
          value: isDark ? 0.3 : 0.5,
          random: true,
        },
        size: {
          value: isDark ? 2 : 3,
          random: true,
        },
        line_linked: {
          enable: true,
          distance: 150,
          opacity: isDark ? 0.15 : 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: isDark ? 1 : 2,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
      },
    }

    switch (variant) {
      case "voting":
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: {
              value: isDark ? "#60a5fa" : "#3b82f6",
            },
            shape: {
              type: "circle",
            },
            line_linked: {
              ...baseConfig.particles.line_linked,
              color: isDark ? "#60a5fa" : "#3b82f6",
            },
          },
        }
      case "admin":
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: {
              value: isDark ? "#34d399" : "#10b981",
            },
            shape: {
              type: "circle",
            },
            line_linked: {
              ...baseConfig.particles.line_linked,
              color: isDark ? "#34d399" : "#10b981",
            },
          },
        }
      default:
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: {
              value: isDark ? "#a78bfa" : "#6d28d9",
            },
            shape: {
              type: "circle",
            },
            line_linked: {
              ...baseConfig.particles.line_linked,
              color: isDark ? "#a78bfa" : "#6d28d9",
            },
          },
        }
    }
  }

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={getParticleConfig()}
      className="absolute inset-0 -z-10"
    />
  )
}
