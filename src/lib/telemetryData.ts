export type ConnectionState = 'Receiving' | 'Stale' | 'Disconnected'

export type PacketEntry = {
  id: number
  time: string
  packet: number
  temperature: number
  pressure: number
  altitude: number
  battery: number
  rssi: number
  humidity: number
  light: number
  pitch: number
  roll: number
  packetLoss: number
  gpsLock: boolean
  sdLogging: boolean
  flightMode: string
}

export type TelemetrySnapshot = {
  packetNumber: number
  temperature: number
  pressure: number
  altitude: number
  battery: number
  packetLoss: number
  rssi: number
  humidity: number
  light: number
  pitch: number
  roll: number
  gpsLock: boolean
  sdLogging: boolean
  flightMode: string
}

export const parseTelemetryCsv = (csvText: string): PacketEntry[] => {
  const lines = csvText
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)

  if (lines.length < 2) return []

  return lines.slice(1).map((row, index) => {
    const values = row.split(',').map((value) => value.trim())
    const headerLine = lines[0].toLowerCase()

    const time = values[0] || `00:${index}`
    const packet = Number(values[1]) || index + 1
    const temperature = Number(values[3] || values[1] || 0)
    const pressure = Number(values[2] || values[1] || 0)
    const altitude = Number(values[1] || values[0] || 0)
    const tilt = Number(values[4] || values[3] || 0)

    const packetLoss = headerLine.includes('loss') ? Number(values[11] || 0) : 0
    const gpsLock = headerLine.includes('gps') ? values[12] === 'true' : true
    const sdLogging = headerLine.includes('sd') ? values[13] === 'true' : true
    const flightMode = headerLine.includes('mode') ? values[14] || 'Telemetry' : 'Telemetry'

    const battery = Number(values[5] || 3.9)
    const rssi = Number(values[6] || 80)
    const humidity = Number(values[7] || 45)
    const light = Number(values[8] || 120)
    const pitch = Number(values[4] || tilt || 0)
    const roll = Number(values[4] || tilt || 0)

    return {
      id: packet || index + 1,
      time,
      packet,
      temperature,
      pressure,
      altitude,
      battery,
      rssi,
      humidity,
      light,
      pitch,
      roll,
      packetLoss,
      gpsLock,
      sdLogging,
      flightMode,
    }
  })
}

export const mapPacketToTelemetry = (entry: PacketEntry): TelemetrySnapshot => ({
  packetNumber: entry.packet,
  temperature: entry.temperature,
  pressure: entry.pressure,
  altitude: entry.altitude,
  battery: entry.battery,
  packetLoss: entry.packetLoss,
  rssi: entry.rssi,
  humidity: entry.humidity,
  light: entry.light,
  pitch: entry.pitch,
  roll: entry.roll,
  gpsLock: entry.gpsLock,
  sdLogging: entry.sdLogging,
  flightMode: entry.flightMode ?? 'Telemetry',
})

export const resolveConnection = (packetLoss: number): ConnectionState => {
  if (packetLoss > 6) return 'Disconnected'
  if (packetLoss > 3) return 'Stale'
  return 'Receiving'
}
