import { describe, expect, it } from 'vitest'
import { parseTelemetryCsv, serializeTelemetryCsv } from './telemetryData'

describe('telemetryData', () => {
  it('parses CSV telemetry rows into normalized packet entries', () => {
    const csv = `
time,packet,temperature,pressure,altitude,battery,rssi,humidity,light,pitch,roll,packetLoss,gpsLock,sdLogging,flightMode
14:27:00,1,24.1,1012.4,0.0,8.40,92,47.8,120,0.0,0.0,0.5,true,true,ASCENT
14:27:02,2,24.2,1011.9,8.2,8.39,91,47.6,122,0.3,0.1,0.5,true,true,ASCENT
    `.trim()

    const parsed = parseTelemetryCsv(csv)

    expect(parsed).toHaveLength(2)
    expect(parsed[0]?.packet).toBe(1)
    expect(parsed[0]?.temperature).toBe(24.1)
    expect(parsed[0]?.flightMode).toBe('ASCENT')
  })

  it('serializes packet entries back to CSV', () => {
    const csv = serializeTelemetryCsv([
      {
        id: 1,
        time: '14:27:00',
        packet: 1,
        temperature: 24.1,
        pressure: 1012.4,
        altitude: 0,
        battery: 8.4,
        rssi: 92,
        humidity: 47.8,
        light: 120,
        pitch: 0,
        roll: 0,
        packetLoss: 0.5,
        gpsLock: true,
        sdLogging: true,
        flightMode: 'ASCENT',
      },
    ])

    expect(csv).toContain('temperature')
    expect(csv).toContain('ASCENT')
  })
})
