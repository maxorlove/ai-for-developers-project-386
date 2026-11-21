import Fastify from 'fastify'
import type { EventType } from '../api/generated/sdk/index.ts'
import { registerEventTypeRoutes } from './event-types.ts'

type AppOptions = {
  eventTypes?: readonly EventType[]
}

export function createApp({ eventTypes = [] }: AppOptions = {}) {
  const app = Fastify()
  const eventTypeStore = new Map(eventTypes.map((eventType) => [eventType.id, eventType]))

  app.get('/api/health', async () => ({ status: 'ok' }))
  registerEventTypeRoutes(app, eventTypeStore)

  return app
}
