import { createEventType, getBookings } from '../../api/generated/sdk/index.ts'
import { formatInterval } from './booking-time.ts'

const form = document.querySelector<HTMLFormElement>('#event-type-form')!
const status = document.querySelector<HTMLParagraphElement>('#event-type-status')!
const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!
const bookingStatus = document.querySelector<HTMLParagraphElement>('#upcoming-bookings-status')!
const bookingList = document.querySelector<HTMLUListElement>('#upcoming-bookings-list')!

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const fields = new FormData(form)
  status.textContent = ''
  submit.disabled = true

  try {
    const { data, error } = await createEventType({
      body: {
        id: String(fields.get('id')),
        title: String(fields.get('title')),
        description: String(fields.get('description')),
        durationMinutes: Number(fields.get('durationMinutes')),
      },
    })

    if (!data) {
      status.textContent = error?.code === 'validation_error' || error?.code === 'event_type_exists'
        ? error.message
        : 'Не удалось создать тип встречи. Попробуйте ещё раз.'
      return
    }

    form.reset()
    status.textContent = `Тип встречи «${data.title}» создан.`
  } finally {
    submit.disabled = false
  }
})

const { data: bookings } = await getBookings()

if (!bookings) {
  bookingStatus.textContent = 'Не удалось загрузить записи.'
} else if (!bookings.length) {
  bookingStatus.textContent = 'Предстоящих записей пока нет.'
} else {
  for (const booking of bookings) {
    const item = document.createElement('li')
    item.textContent = `«${booking.eventTypeTitle}» — ${formatInterval(booking, 'Europe/Moscow')}, Москва.`
    bookingList.append(item)
  }

  bookingStatus.hidden = true
  bookingList.hidden = false
}
