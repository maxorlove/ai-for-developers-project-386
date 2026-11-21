const status = document.querySelector('#server-status')

if (status) {
  const isOnline = await fetch('/api/health').then(
    (response) => response.ok,
    () => false,
  )

  status.textContent = isOnline ? 'Сервер доступен' : 'Сервер недоступен'
}
