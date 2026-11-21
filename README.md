# Календарь звонков


[![hexlet-check](https://github.com/maxorlove/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/maxorlove/ai-for-developers-project-386/actions)

Разработайте совместно с ИИ сервис для бронирования календаря

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

## Стек

- Бэкенд — Fastify и TypeScript.
- Фронтенд — Vite и TypeScript.

## Установка

Установите Node.js версии из `.node-version` и pnpm версии из поля `packageManager` в `package.json`.

```bash
git clone https://github.com/maxorlove/ai-for-developers-project-386.git
cd ai-for-developers-project-386
pnpm install --frozen-lockfile
pnpm api:generate
```

## Использование

Запустите команды в двух терминалах.

```bash
pnpm dev:backend
```

```bash
pnpm dev:frontend
```

Фронтенд доступен на http://localhost:5173. Бэкенд отвечает на http://127.0.0.1:3000/api/health.

Владелец календаря создаёт типы встреч на http://localhost:5173/owner/. Типы сразу появляются в гостевом каталоге на http://localhost:5173/booking/. Типы встреч и записи хранятся в памяти. Перезапуск бэкенда сбрасывает каталог и все записи.

Команда `pnpm check` генерирует контракт API и SDK, затем запускает линтер, проверку типов и тесты. GitHub Actions выполняет ту же команду при каждом push.

<!-- Добавьте запись asciinema после реализации сценария бронирования -->

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
