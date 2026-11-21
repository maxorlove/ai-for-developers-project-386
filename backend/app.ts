import Fastify from 'fastify'
import type { EventType } from '../api/generated/sdk/index.ts'
import { registerAvailabilityRoutes } from './availability.ts'
import { registerEventTypeRoutes } from './event-types.ts'

type AppOptions = {
  eventTypes?: readonly EventType[]
  clock?: () => Date
}

export function createApp({ eventTypes = [], clock = () => new Date() }: AppOptions = {}) {
  const app = Fastify()
  const eventTypeStore = new Map(eventTypes.map((eventType) => [eventType.id, eventType]))

  app.get('/api/health', async () => ({ status: 'ok' }))
  registerEventTypeRoutes(app, eventTypeStore)
  registerAvailabilityRoutes(app, eventTypeStore, clock)

  return app
}
