import { resolve } from 'node:path'
import { expect, test as base } from '@playwright/test'
import { createServer } from 'vite'
import { createApp } from '../../backend/app.ts'

const test = base.extend({
  // oxlint-disable-next-line no-empty-pattern -- Playwright requires object destructuring for fixture dependencies.
  async baseURL({}, use) {
    const backend = createApp({ clock: () => new Date('2026-11-20T20:59:59.999Z') })
    try {
      const backendURL = await backend.listen({ host: '127.0.0.1', port: 0 })
      const frontend = await createServer({
        root: resolve(import.meta.dirname, '..'),
        server: {
          host: '127.0.0.1',
          port: 0,
          hmr: false,
          proxy: { '/api': backendURL },
        },
      })
      try {
        await frontend.listen()
        const address = frontend.httpServer?.address()
        if (!address || typeof address === 'string') {
          throw new Error('Vite did not open a TCP port')
        }

        await use(`http://127.0.0.1:${address.port}`)
      } finally {
        await frontend.close()
      }
    } finally {
      await backend.close()
    }
  },
})

test('a guest books a call and the owner sees the same meeting', async ({ page, context }) => {
  const owner = await context.newPage()
  await owner.goto('/owner/')
  await owner.getByLabel('Идентификатор').fill('intro')
  await owner.getByLabel('Название').fill('Знакомство')
  await owner.getByLabel('Описание').fill('Вводный звонок')
  await owner.getByLabel('Длительность, мин.').fill('30')
  await owner.getByRole('button', { name: 'Создать тип встречи' }).click()
  await expect(owner.getByText('Тип встречи «Знакомство» создан.')).toBeVisible()

  await page.goto('/')
  await page.getByRole('link', { name: 'Записаться на звонок' }).click()
  await expect(page).toHaveURL(/\/booking\/$/)
  await page.getByRole('button', { name: 'Выбрать «Знакомство»' }).click()
  await page.getByLabel('День').selectOption('2026-11-22')
  await page.getByRole('button', { name: '10:00', exact: true }).click()
  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  const details = /Знакомство.*22 ноября.*10:00–10:30.*Москва/
  const confirmation = page.getByRole('region', { name: 'Запись подтверждена' })
  await expect(confirmation).toContainText(details)

  await owner.reload()
  const upcoming = owner.getByRole('region', { name: 'Предстоящие записи' })
  await expect(upcoming.getByRole('listitem')).toHaveText(details)
})

test('a guest sees updated slots when another guest books the selected time', async ({ page, request }) => {
  const eventType = await request.post('/api/event-types', {
    data: { id: 'brief', title: 'Краткий звонок', description: 'Короткая встреча', durationMinutes: 30 },
  })
  expect(eventType.status()).toBe(201)

  await page.goto('/booking/')
  await page.getByRole('button', { name: 'Выбрать «Краткий звонок»' }).click()
  const day = page.getByLabel('День')
  await day.selectOption('2026-11-22')
  const slots = page.getByRole('list', { name: 'Свободные слоты' })
  const selected = slots.getByRole('button', { name: '10:00', exact: true })
  await selected.click()

  const booking = await request.post('/api/bookings', {
    data: { eventTypeId: 'brief', startsAt: '2026-11-22T10:00:00+03:00' },
  })
  expect(booking.status()).toBe(201)
  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  await expect(page.getByRole('alert')).toHaveText('Это время уже занято. Выберите другой слот.')
  await expect(selected).toHaveCount(0)
  await expect(day).toHaveValue('2026-11-22')
  await expect(slots.getByRole('button', { name: '10:30', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Запись подтверждена' })).toBeHidden()
})
