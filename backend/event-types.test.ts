import assert from 'node:assert/strict'
import test from 'node:test'
import { createApp } from './app.ts'
import { assertJsonResponse } from './openapi-response.ts'

test('the event type catalog returns an empty JSON array when no types exist', async (context) => {
  const app = createApp()
  context.after(() => app.close())
  const url = await app.listen({ host: '127.0.0.1', port: 0 })

  const response = await fetch(new URL('/api/event-types', url))

  assert.equal(response.status, 200)
  assert.deepEqual(await assertJsonResponse(response, 'get', '/api/event-types'), [])
})

test('the event type catalog returns all details of an existing type', async (context) => {
  const app = createApp({
    eventTypes: [{
      id: 'intro',
      title: 'Знакомство',
      description: 'Короткий вводный звонок',
      durationMinutes: 30,
    }],
  })
  context.after(() => app.close())
  const url = await app.listen({ host: '127.0.0.1', port: 0 })

  const response = await fetch(new URL('/api/event-types', url))

  assert.equal(response.status, 200)
  assert.deepEqual(await assertJsonResponse(response, 'get', '/api/event-types'), [{
    id: 'intro',
    title: 'Знакомство',
    description: 'Короткий вводный звонок',
    durationMinutes: 30,
  }])
})
