"use client"

import { useState, useCallback } from "react"

interface GeolocationState {
  lat: number
  lon: number
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const newLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }

      setLocation(newLocation)
      return newLocation
    } catch (err) {
      const errorMessage = err instanceof GeolocationPositionError 
        ? getGeolocationErrorMessage(err.code)
        : "Failed to get location"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
  }
}

function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location access denied. Please enable location permissions."
    case 2:
      return "Location unavailable. Please try again."
    case 3:
      return "Location request timed out. Please try again."
    default:
      return "Failed to get location."
  }
}