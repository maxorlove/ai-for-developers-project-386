import Fastify from 'fastify'
import type { Booking, EventType } from '../api/generated/sdk/index.ts'
import { registerAvailabilityRoutes } from './availability.ts'
import { registerBookingRoutes } from './bookings.ts'
import { registerEventTypeRoutes } from './event-types.ts'

type AppOptions = {
  eventTypes?: readonly EventType[]
  clock?: () => Date
}

export function createApp({ eventTypes = [], clock = () => new Date() }: AppOptions = {}) {
  const app = Fastify()
  const eventTypeStore = new Map(eventTypes.map((eventType) => [eventType.id, eventType]))
  const bookings: Booking[] = []

  app.get('/api/health', async () => ({ status: 'ok' }))
  registerEventTypeRoutes(app, eventTypeStore)
  registerAvailabilityRoutes(app, eventTypeStore, clock, bookings)
  registerBookingRoutes(app, eventTypeStore, clock, bookings)

  return app
}
