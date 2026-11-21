import type { FastifyInstance } from 'fastify'
import type { RouteHandlers } from '../api/generated/sdk/fastify.gen.ts'
import type { EventType } from '../api/generated/sdk/index.ts'

export function registerEventTypeRoutes(app: FastifyInstance, eventTypes: Map<string, EventType>) {
  const getEventTypes: RouteHandlers['getEventTypes'] = (_request, reply) => {
    reply.code(200).send([...eventTypes.values()])
  }

  app.get('/api/event-types', getEventTypes)
}
