import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PacketEntry, TelemetrySnapshot } from '@/lib/telemetryData'
import { mapPacketToTelemetry, parseTelemetryCsv, resolveConnection } from '@/lib/telemetryData'
import { LoraSerial, isLoRaSerialSupported } from '@/lib/LoraSerial'

const initialTelemetry: TelemetrySnapshot = {
  packetNumber: 104,
  temperature: 31.4,
  pressure: 1008.2,
  altitude: 42.8,
  battery: 3.91,
  packetLoss: 1.2,
  rssi: 88,
  humidity: 46.2,
  light: 132,
  pitch: -0.4,
  roll: 1.8,
  gpsLock: true,
  sdLogging: true,
  flightMode: 'Descent',
}

const initialHistory: PacketEntry[] = [
  {
    id: 103,
    time: '09:14:11',
    packet: 103,
    temperature: 30.8,
    pressure: 1007.1,
    altitude: 38.6,
    battery: 3.92,
    rssi: 85,
    humidity: 47.1,
    light: 128,
    pitch: -0.6,
    roll: 1.4,
    packetLoss: 0.9,
    gpsLock: true,
    sdLogging: true,
    flightMode: 'Recovery',
  },
  {
    id: 102,
    time: '09:14:10',
    packet: 102,
    temperature: 30.6,
    pressure: 1007.7,
    altitude: 37.4,
    battery: 3.93,
    rssi: 87,
    humidity: 46.6,
    light: 131,
    pitch: -0.2,
    roll: 1.2,
    packetLoss: 0.8,
    gpsLock: true,
    sdLogging: true,
    flightMode: 'Recovery',
  },
  {
    id: 101,
    time: '09:14:09',
    packet: 101,
    temperature: 30.3,
    pressure: 1008.4,
    altitude: 35.9,
    battery: 3.94,
    rssi: 90,
    humidity: 46.0,
    light: 134,
    pitch: 0.1,
    roll: 1.0,
    packetLoss: 0.7,
    gpsLock: true,
    sdLogging: true,
    flightMode: 'Descent',
  },
  {
    id: 100,
    time: '09:14:08',
    packet: 100,
    temperature: 30.2,
    pressure: 1008.9,
    altitude: 34.7,
    battery: 3.95,
    rssi: 92,
    humidity: 45.5,
    light: 137,
    pitch: 0.3,
    roll: 0.9,
    packetLoss: 0.6,
    gpsLock: true,
    sdLogging: true,
    flightMode: 'Descent',
  },
]

type ConnectionState = 'Receiving' | 'Stale' | 'Disconnected'

type TelemetryContextProps = {
  telemetry: TelemetrySnapshot
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetrySnapshot>>
  history: PacketEntry[]
  setHistory: React.Dispatch<React.SetStateAction<PacketEntry[]>>
  connection: ConnectionState
  setConnection: React.Dispatch<React.SetStateAction<ConnectionState>>
  flightMode: string
  setFlightMode: React.Dispatch<React.SetStateAction<string>>
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(undefined)

export const TelemetryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(initialTelemetry)
  const [history, setHistory] = useState<PacketEntry[]>(initialHistory)
  const [connection, setConnection] = useState<ConnectionState>('Disconnected')
  const [flightMode, setFlightMode] = useState<string>('Descent')

  useEffect(() => {
    let active = true
    let currentIndex = -1
    let serial: LoraSerial | null = null

    const applyPacket = (entry: PacketEntry) => {
      if (!active) return
      const snapshot = mapPacketToTelemetry(entry)
      setTelemetry(snapshot)
      setConnection(resolveConnection(entry.packetLoss))
      setFlightMode(entry.flightMode ?? 'Telemetry')
      setHistory((prev) => [entry, ...prev].slice(0, 20))
    }

    const loadCsv = async () => {
      try {
        const response = await fetch('/telemetry.csv')
        if (!response.ok) throw new Error(`CSV request failed ${response.status}`)
        const csvText = await response.text()
        const rows = parseTelemetryCsv(csvText)
        if (!rows.length || !active) return
        currentIndex = (currentIndex + 1) % rows.length
        applyPacket(rows[currentIndex])
      } catch (error) {
        console.warn('CSV feed unavailable', error)
      }
    }

    void loadCsv()
    const interval = window.setInterval(() => void loadCsv(), 1200)

    const initializeSerial = async () => {
      if (!isLoRaSerialSupported()) return

      try {
        serial = new LoraSerial({
          onPacket: (entry) => applyPacket(entry),
          onStatusChange: (status) => {
            if (status === 'connected') {
              setConnection('Receiving')
            }
          },
        })
        await serial.connect()
      } catch (error) {
        console.warn('LoRa serial unavailable', error)
      }
    }

    void initializeSerial()

    return () => {
      active = false
      window.clearInterval(interval)
      void serial?.disconnect()
    }
  }, [])

  return (
    <TelemetryContext.Provider
      value={{ telemetry, setTelemetry, history, setHistory, connection, setConnection, flightMode, setFlightMode }}
    >
      {children}
    </TelemetryContext.Provider>
  )
}

export const useTelemetry = () => {
  const context = useContext(TelemetryContext)
  if (!context) {
    throw new Error('useTelemetry must be used within TelemetryProvider')
  }
  return context
}
