# Правила проекта

- Бэкенд Fastify — `backend/`. Фронтенд Vite — `frontend/`.
- Установка зависимостей — `pnpm install --frozen-lockfile`.
- Локальный запуск в двух терминалах — `pnpm dev:backend` и `pnpm dev:frontend`.
- Все проверки локально и в GitHub Actions — `pnpm check`. По отдельности — `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Сборка фронтенда — `pnpm build`, только по явной просьбе пользователя. Новые тесты добавляйте только по явной просьбе пользователя.
- Используйте Conventional Commits, например `feat: add booking form`.
