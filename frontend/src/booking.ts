import { createBooking, getEventTypeSlots, getEventTypes } from '../../api/generated/sdk/index.ts'
import type { Availability, EventType, Slot } from '../../api/generated/sdk/index.ts'
import { dateOptions, formatInterval, timeOptions } from './booking-time.ts'

const status = document.querySelector<HTMLParagraphElement>('#catalog-status')!
const list = document.querySelector<HTMLUListElement>('#event-types')!
const calendar = document.querySelector<HTMLElement>('#booking-calendar')!
const calendarHeading = document.querySelector<HTMLHeadingElement>('#calendar-heading')!
const calendarStatus = document.querySelector<HTMLParagraphElement>('#calendar-status')!
const timeZoneLabel = document.querySelector<HTMLParagraphElement>('#booking-time-zone')!
const daySelect = document.querySelector<HTMLSelectElement>('#booking-day')!
const slotsStatus = document.querySelector<HTMLParagraphElement>('#slots-status')!
const slotsList = document.querySelector<HTMLUListElement>('#booking-slots')!
const bookingStatus = document.querySelector<HTMLParagraphElement>('#booking-status')!
const selection = document.querySelector<HTMLElement>('#booking-selection')!
const selectionDetails = document.querySelector<HTMLParagraphElement>('#booking-selection-details')!
const confirmButton = document.querySelector<HTMLButtonElement>('#confirm-booking')!
const confirmation = document.querySelector<HTMLElement>('#booking-confirmation')!
const confirmationDetails = document.querySelector<HTMLParagraphElement>('#booking-confirmation-details')!

const formatCalendarDate = new Intl.DateTimeFormat('ru', { ...dateOptions, timeZone: 'UTC' })

type CalendarView = {
  eventType: EventType
  availability?: Availability
  request?: AbortController
}

let activeCalendar: CalendarView | undefined
let selectedSlot: Slot | undefined
let bookingPending = false

function updateSelection(slot?: Slot) {
  selectedSlot = slot
  selection.hidden = !slot
  confirmButton.disabled = bookingPending || !!activeCalendar?.request

  for (const button of slotsList.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.value === slot?.startsAt))
  }

  if (slot && activeCalendar?.availability) {
    selectionDetails.textContent = formatInterval(slot, activeCalendar.availability.timeZone)
  }
}

function renderSlots({ days, timeZone }: Availability, selectedStart?: string) {
  const slots = days.find(({ date }) => date === daySelect.value)?.slots ?? []
  const formatTime = new Intl.DateTimeFormat('ru', { ...timeOptions, timeZone })
  const focusedStart = slotsList.querySelector<HTMLButtonElement>('button:focus')?.value

  slotsList.replaceChildren()
  slotsStatus.textContent = slots.length ? '' : 'На этот день нет свободных слотов.'
  slotsList.hidden = !slots.length
  for (const slot of slots) {
    const item = document.createElement('li')
    const button = document.createElement('button')
    const time = document.createElement('time')

    button.type = 'button'
    button.value = slot.startsAt
    time.dateTime = slot.startsAt
    time.textContent = formatTime.format(new Date(slot.startsAt))
    button.append(time)
    button.addEventListener('click', () => {
      bookingStatus.textContent = ''
      updateSelection(slot)
    })

    item.append(button)
    slotsList.append(item)
    if (slot.startsAt === focusedStart) {
      button.focus({ preventScroll: true })
    }
  }

  updateSelection(slots.find(({ startsAt }) => startsAt === selectedStart))
}

async function loadAvailability(view: CalendarView) {
  view.request?.abort()
  const request = new AbortController()
  view.request = request
  confirmButton.disabled = true
  calendarStatus.textContent = 'Загружаем свободное время…'

  const { data } = await getEventTypeSlots({ path: { id: view.eventType.id }, signal: request.signal })
  if (request.signal.aborted || activeCalendar !== view) {
    return
  }

  view.request = undefined
  if (!data) {
    view.availability = undefined
    slotsList.replaceChildren()
    slotsList.hidden = true
    slotsStatus.textContent = ''
    updateSelection()
    calendarStatus.textContent = 'Не удалось загрузить свободное время.'
    return
  }

  const previousDay = view.availability && daySelect.value
  view.availability = data
  calendarHeading.textContent = `Свободное время — «${view.eventType.title}»`
  timeZoneLabel.textContent = `Часовой пояс — Москва (${data.timeZone}).`
  daySelect.replaceChildren(...data.days.map(({ date }) => {
    return new Option(formatCalendarDate.format(new Date(date)), date)
  }))
  if (previousDay && data.days.some(({ date }) => date === previousDay)) {
    daySelect.value = previousDay
  }

  renderSlots(data, selectedSlot?.startsAt)

  calendarStatus.textContent = ''
  calendar.hidden = false
}

daySelect.addEventListener('change', () => {
  bookingStatus.textContent = ''
  if (activeCalendar?.availability) {
    renderSlots(activeCalendar.availability)
  }
})

confirmButton.addEventListener('click', async () => {
  const view = activeCalendar
  const slot = selectedSlot
  if (!view?.availability || !slot || bookingPending) {
    return
  }

  const day = daySelect.value
  const { timeZone } = view.availability
  bookingPending = true
  confirmButton.disabled = true
  confirmation.hidden = true
  bookingStatus.textContent = ''

  const { data, error, response } = await createBooking({
    body: { eventTypeId: view.eventType.id, startsAt: slot.startsAt },
  })
  bookingPending = false

  const sameDay = activeCalendar === view && daySelect.value === day
  const confirmed = response?.status === 201 && data
  const conflict = response?.status === 409 && error?.code === 'slot_taken'
  if (confirmed) {
    confirmationDetails.textContent = `«${data.eventTypeTitle}» — ${formatInterval(data, timeZone)}, Москва.`
    confirmation.hidden = false
  }

  if (confirmed || conflict) {
    if (sameDay && selectedSlot === slot) {
      updateSelection()
    }

    if (conflict) {
      bookingStatus.textContent = sameDay
        ? error.message
        : `«${view.eventType.title}» — ${formatInterval(slot, timeZone)}, Москва. ${error.message}`
    }

    if (activeCalendar) {
      await loadAvailability(activeCalendar)
    }

    return
  }

  if (sameDay) {
    bookingStatus.textContent = 'Не удалось подтвердить запись. Попробуйте ещё раз.'
  }

  updateSelection(selectedSlot)
})

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
    choose.addEventListener('click', () => {
      activeCalendar?.request?.abort()
      activeCalendar = { eventType }
      calendar.hidden = true
      bookingStatus.textContent = ''
      updateSelection()
      void loadAvailability(activeCalendar)
    })
    item.append(title, description, duration, choose)
    list.append(item)
  }

  list.hidden = false
}
