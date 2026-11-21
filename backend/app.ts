import Fastify from 'fastify'

export function createApp() {
  const app = Fastify()

  app.get('/api/health', async () => ({ status: 'ok' }))

  return app
}
