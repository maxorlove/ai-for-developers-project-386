import { getEventTypes } from '../../api/generated/sdk/index.ts'

const status = document.querySelector<HTMLParagraphElement>('#catalog-status')!
const list = document.querySelector<HTMLUListElement>('#event-types')!

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

    title.textContent = eventType.title
    description.textContent = eventType.description
    duration.textContent = `${eventType.durationMinutes} мин.`
    item.append(title, description, duration)
    list.append(item)
  }

  list.hidden = false
}
