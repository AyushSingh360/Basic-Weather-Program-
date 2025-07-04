"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Heart, AlertTriangle, Wind, Eye, Droplets, Thermometer, Sun, Moon, CloudRain, Navigation, Bookmark, BookmarkCheck, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeather } from "@/hooks/use-weather"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useFavorites } from "@/hooks/use-favorites"
import { useAirQuality } from "@/hooks/use-air-quality"
import { WeatherChart } from "@/components/weather-chart"
import { WeatherMap } from "@/components/weather-map"
import { AirQualityCard } from "@/components/air-quality-card"
import { WeatherAlerts } from "@/components/weather-alerts"
import { ForecastCard } from "@/components/forecast-card"
import { WeatherDetails } from "@/components/weather-details"
import { FavoritesPanel } from "@/components/favorites-panel"
import { LoadingSpinner } from "@/components/loading-spinner"
import { formatDate, formatTime, getWeatherIcon, getWeatherGradient } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export function WeatherDashboard() {
  const [city, setCity] = useState("London")
  const [searchInput, setSearchInput] = useState("")
  const [activeTab, setActiveTab] = useState("current")
  
  const { currentWeather, forecast, isLoading, error } = useWeather(city)
  const { location, isLoading: locationLoading, getCurrentLocation } = useGeolocation()
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { airQuality, isLoading: airQualityLoading } = useAirQuality(
    currentWeather?.coord?.lat,
    currentWeather?.coord?.lon
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setCity(searchInput.trim())
      setSearchInput("")
    }
  }

  const handleLocationClick = async () => {
    try {
      await getCurrentLocation()
      if (location) {
        setCity(`${location.lat},${location.lon}`)
        toast({
          title: "Location detected",
          description: "Weather updated for your current location",
        })
      }
    } catch (error) {
      toast({
        title: "Location error",
        description: "Unable to get your location. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const handleFavoriteToggle = () => {
    if (!currentWeather) return
    
    if (isFavorite(currentWeather.name)) {
      removeFavorite(currentWeather.name)
      toast({
        title: "Removed from favorites",
        description: `${currentWeather.name} has been removed from your favorites`,
      })
    } else {
      addFavorite({
        name: currentWeather.name,
        country: currentWeather.sys.country,
        temp: Math.round(currentWeather.main.temp),
        condition: currentWeather.weather[0].main,
        icon: currentWeather.weather[0].icon,
      })
      toast({
        title: "Added to favorites",
        description: `${currentWeather.name} has been added to your favorites`,
      })
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md animate-fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-center">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <Card className="backdrop-blur-md bg-white/10 dark:bg-black/20 border-white/20 shadow-xl animate-slide-up">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for a city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 transition-all duration-300"
              />
            </div>
            <Button 
              type="submit" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 transition-all duration-300 hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              onClick={handleLocationClick}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 transition-all duration-300 hover:scale-105"
              disabled={locationLoading}
            >
              {locationLoading ? <LoadingSpinner size="sm" /> : <MapPin className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Weather Display */}
      {currentWeather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather Card */}
          <Card className="lg:col-span-2 backdrop-blur-md bg-white/10 dark:bg-black/20 border-white/20 shadow-xl animate-slide-up delay-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    {currentWeather.name}, {currentWeather.sys.country}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFavoriteToggle}
                      className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                    >
                      {isFavorite(currentWeather.name) ? (
                        <BookmarkCheck className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    {formatDate(currentWeather.dt)} • {formatTime(currentWeather.dt)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white animate-pulse-slow">
                    {Math.round(currentWeather.main.temp)}°C
                  </div>
                  <div className="text-white/80 capitalize">
                    {currentWeather.weather[0].description}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl animate-bounce-slow">
                  {getWeatherIcon(currentWeather.weather[0].icon)}
                </div>
                <div className="text-right text-white/80">
                  <div>Feels like {Math.round(currentWeather.main.feels_like)}°C</div>
                  <div>H: {Math.round(currentWeather.main.temp_max)}° L: {Math.round(currentWeather.main.temp_min)}°</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                  <Wind className="h-5 w-5 text-white/80 mx-auto mb-1" />
                  <div className="text-sm text-white/80">Wind</div>
                  <div className="font-semibold text-white">{currentWeather.wind.speed} m/s</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                  <Droplets className="h-5 w-5 text-white/80 mx-auto mb-1" />
                  <div className="text-sm text-white/80">Humidity</div>
                  <div className="font-semibold text-white">{currentWeather.main.humidity}%</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                  <Eye className="h-5 w-5 text-white/80 mx-auto mb-1" />
                  <div className="text-sm text-white/80">Visibility</div>
                  <div className="font-semibold text-white">{(currentWeather.visibility / 1000).toFixed(1)} km</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                  <Thermometer className="h-5 w-5 text-white/80 mx-auto mb-1" />
                  <div className="text-sm text-white/80">Pressure</div>
                  <div className="font-semibold text-white">{currentWeather.main.pressure} hPa</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Air Quality Card */}
          <div className="space-y-6">
            <AirQualityCard 
              airQuality={airQuality} 
              isLoading={airQualityLoading}
              className="animate-slide-up delay-200"
            />
            <WeatherAlerts 
              weather={currentWeather}
              className="animate-slide-up delay-300"
            />
          </div>
        </div>
      )}

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up delay-400">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
          <TabsTrigger value="current" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-300">
            Current
          </TabsTrigger>
          <TabsTrigger value="forecast" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-300">
            Forecast
          </TabsTrigger>
          <TabsTrigger value="charts" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-300">
            Charts
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-300">
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          {currentWeather && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherDetails weather={currentWeather} />
              <WeatherMap 
                lat={currentWeather.coord?.lat} 
                lon={currentWeather.coord?.lon}
                city={currentWeather.name}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="forecast" className="mt-6">
          {forecast && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {forecast.slice(0, 10).map((item, index) => (
                <ForecastCard 
                  key={item.dt} 
                  forecast={item} 
                  className={`animate-slide-up delay-${index * 50}`}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          {forecast && (
            <div className="space-y-6">
              <WeatherChart forecast={forecast} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <FavoritesPanel 
            favorites={favorites}
            onCitySelect={setCity}
            onRemoveFavorite={removeFavorite}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}