import { createEventType } from '../../api/generated/sdk/index.ts'

const form = document.querySelector<HTMLFormElement>('#event-type-form')!
const status = document.querySelector<HTMLParagraphElement>('#event-type-status')!
const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!

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
