import { createContext, useContext, useState, useEffect } from 'react'

const PerformanceContext = createContext()

export function usePerformance() {
  return useContext(PerformanceContext)
}

export function PerformanceProvider({ children }) {
  const [lowPower, setLowPower] = useState(() => {
    try {
      return localStorage.getItem('lowPowerMode') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('lowPowerMode', String(lowPower))
    } catch {}
  }, [lowPower])

  return (
    <PerformanceContext.Provider value={{ lowPower, setLowPower }}>
      {children}
    </PerformanceContext.Provider>
  )
}
