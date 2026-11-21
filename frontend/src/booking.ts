import { getEventTypeSlots, getEventTypes } from '../../api/generated/sdk/index.ts'
import type { Availability, EventType } from '../../api/generated/sdk/index.ts'

const status = document.querySelector<HTMLParagraphElement>('#catalog-status')!
const list = document.querySelector<HTMLUListElement>('#event-types')!
const calendar = document.querySelector<HTMLElement>('#booking-calendar')!
const calendarHeading = document.querySelector<HTMLHeadingElement>('#calendar-heading')!
const calendarStatus = document.querySelector<HTMLParagraphElement>('#calendar-status')!
const timeZoneLabel = document.querySelector<HTMLParagraphElement>('#booking-time-zone')!
const daySelect = document.querySelector<HTMLSelectElement>('#booking-day')!
const slotsStatus = document.querySelector<HTMLParagraphElement>('#slots-status')!
const slotsList = document.querySelector<HTMLUListElement>('#booking-slots')!

const formatDate = new Intl.DateTimeFormat('ru', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
let slotsRequest: AbortController | undefined

function renderSlots({ days, timeZone }: Availability) {
  const slots = days.find(({ date }) => date === daySelect.value)?.slots ?? []
  const formatTime = new Intl.DateTimeFormat('ru', { timeZone, hour: '2-digit', minute: '2-digit' })

  slotsList.replaceChildren()
  slotsStatus.textContent = slots.length ? '' : 'На этот день нет свободных слотов.'
  slotsList.hidden = !slots.length
  for (const { startsAt } of slots) {
    const item = document.createElement('li')
    const time = document.createElement('time')
    time.dateTime = startsAt
    time.textContent = formatTime.format(new Date(startsAt))
    item.append(time)
    slotsList.append(item)
  }
}

async function loadAvailability(eventType: EventType) {
  slotsRequest?.abort()
  const request = new AbortController()
  slotsRequest = request
  calendar.hidden = true
  calendarStatus.textContent = 'Загружаем свободное время…'

  const { data } = await getEventTypeSlots({ path: { id: eventType.id }, signal: request.signal })
  if (request.signal.aborted) return

  if (!data) {
    calendarStatus.textContent = 'Не удалось загрузить свободное время.'
    return
  }

  calendarHeading.textContent = `Свободное время — «${eventType.title}»`
  timeZoneLabel.textContent = `Часовой пояс — Москва (${data.timeZone}).`
  daySelect.replaceChildren(...data.days.map(({ date }) => {
    return new Option(formatDate.format(new Date(date)), date)
  }))
  daySelect.onchange = () => renderSlots(data)
  renderSlots(data)

  calendarStatus.textContent = ''
  calendar.hidden = false
}

const { data: eventTypes } = await getEventTypes()

if (!eventTypes) {
  status.textContent = 'Не удалось загрузить типы встреч.'
} else if (!eventTypes.length) {
  status.textContent = 'Типов встреч пока нет.'
} else {
  for (const eventType of eventTypes) {
    const item = document.createElement('li')
    const title = document.createElement('h2')
    const description = document.createElement('p')
    const duration = document.createElement('p')
    const choose = document.createElement('button')

    title.textContent = eventType.title
    description.textContent = eventType.description
    duration.textContent = `${eventType.durationMinutes} мин.`
    choose.type = 'button'
    choose.textContent = `Выбрать «${eventType.title}»`
    choose.addEventListener('click', () => void loadAvailability(eventType))
    item.append(title, description, duration, choose)
    list.append(item)
  }

  list.hidden = false
}
