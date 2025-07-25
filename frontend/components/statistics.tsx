"use client"

import { useEffect, useState } from "react"

const stats = [
  {
    label: "Active Jobs",
    value: 1247,
    suffix: "+",
    description: "New opportunities posted daily",
  },
  {
    label: "Companies",
    value: 350,
    suffix: "+",
    description: "Trusted employers on our platform",
  },
  {
    label: "Successful Matches",
    value: 2890,
    suffix: "+",
    description: "Candidates placed in their dream jobs",
  },
  {
    label: "Average Match Score",
    value: 87,
    suffix: "%",
    description: "AI-powered matching accuracy",
  },
]

export default function Statistics() {
  const [counters, setCounters] = useState(stats.map(() => 0))
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("statistics-section")
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const intervals = stats.map((stat, index) => {
      const increment = stat.value / 50
      let current = 0

      return setInterval(() => {
        current += increment
        if (current >= stat.value) {
          current = stat.value
          clearInterval(intervals[index])
        }
        setCounters((prev) => {
          const newCounters = [...prev]
          newCounters[index] = Math.floor(current)
          return newCounters
        })
      }, 30)
    })

    return () => intervals.forEach(clearInterval)
  }, [isVisible])

  return (
    <section id="statistics-section" className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">JobVector by the Numbers</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of professionals who found their perfect match
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {counters[index].toLocaleString()}
                {stat.suffix}
              </div>
              <div className="text-xl font-semibold text-blue-100 mb-2">{stat.label}</div>
              <div className="text-sm text-blue-200">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
