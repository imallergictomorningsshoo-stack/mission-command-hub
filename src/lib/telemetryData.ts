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

const toNumber = (value: string | undefined, fallback = 0): number => {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (value: string | undefined, fallback = true): boolean => {
  if (value === undefined || value === null || value === '') return fallback
  const normalized = value.toLowerCase().trim()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return fallback
}

const parseCsvLine = (line: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

const getFieldValue = (row: Record<string, string>, possibleKeys: string[], fallback = ''): string => {
  for (const key of possibleKeys) {
    const value = row[key]
    if (value !== undefined && value !== '') return value
  }
  return fallback
}

export const parseTelemetryCsv = (csvText: string): PacketEntry[] => {
  const lines = csvText
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const header = parseCsvLine(lines[0]).map((value) => value.toLowerCase().trim())
  const columns = header.filter(Boolean)

  return lines.slice(1).flatMap((line, index) => {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}

    for (let i = 0; i < columns.length; i += 1) {
      row[columns[i]] = values[i] ?? ''
    }

    const packet = toNumber(getFieldValue(row, ['packet', 'seq', 'pkt', 'packet_id'], String(index + 1)), index + 1)
    const time = getFieldValue(row, ['time', 'timestamp', 'utc', 'received_at']) || new Date(Date.now() - index * 1000).toLocaleTimeString('en-GB', { hour12: false })

    const temperature = toNumber(getFieldValue(row, ['temperature', 'temp', 'temp_c']), 0)
    const pressure = toNumber(getFieldValue(row, ['pressure', 'press', 'pressure_hpa']), 0)
    const altitude = toNumber(getFieldValue(row, ['altitude', 'alt', 'altitude_m']), 0)
    const battery = toNumber(getFieldValue(row, ['battery', 'vbat', 'voltage']), 3.9)
    const rssi = toNumber(getFieldValue(row, ['rssi', 'signal']), 80)
    const humidity = toNumber(getFieldValue(row, ['humidity']), 45)
    const light = toNumber(getFieldValue(row, ['light', 'lux']), 120)
    const pitch = toNumber(getFieldValue(row, ['pitch', 'tilt_x']), 0)
    const roll = toNumber(getFieldValue(row, ['roll', 'tilt_y']), 0)
    const packetLoss = toNumber(getFieldValue(row, ['packetloss', 'loss', 'packet_loss']), 0)
    const gpsLock = toBoolean(getFieldValue(row, ['gpslock', 'gps_lock', 'gps']), true)
    const sdLogging = toBoolean(getFieldValue(row, ['sdlogging', 'sd_logging', 'sd']), true)
    const flightMode = getFieldValue(row, ['flightmode', 'mode', 'state', 'flight_mode'], 'Telemetry') || 'Telemetry'

    return [{
      id: packet || index + 1,
      time,
      packet: packet || index + 1,
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
    }]
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

export const serializeTelemetryCsv = (rows: PacketEntry[]): string => {
  const header = [
    'id',
    'time',
    'packet',
    'temperature',
    'pressure',
    'altitude',
    'battery',
    'rssi',
    'humidity',
    'light',
    'pitch',
    'roll',
    'packetLoss',
    'gpsLock',
    'sdLogging',
    'flightMode',
  ]

  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        row.id,
        row.time,
        row.packet,
        row.temperature,
        row.pressure,
        row.altitude,
        row.battery,
        row.rssi,
        row.humidity,
        row.light,
        row.pitch,
        row.roll,
        row.packetLoss,
        row.gpsLock,
        row.sdLogging,
        row.flightMode,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ]

  return lines.join('\n')
}

export const downloadTelemetryCsv = (csvContent: string, filename = 'bhoonidi-mission-export.csv'): void => {
  if (typeof window === 'undefined') return

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
