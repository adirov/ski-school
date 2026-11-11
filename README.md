# Almaty Snowboard

Сайт бренда Almaty Snowboard: каталог туров и занятий, статьи, приём заявок. Next.js 15 + TypeScript, статическая генерация, RU/EN (казахский подготовлен в архитектуре).

**Сейчас это сборка для разработки.** Услуги, туры и статьи помечены как примеры и черновики, контакты не подтверждены, приём заявок не подключён. Подробно: [docs/REPORT.md](docs/REPORT.md).

## Запуск

Нужен Node.js 20+ (проверено на 22).

```bash
npm install
cp .env.example .env.local     # заполните значения
npm run dev                    # http://localhost:3000 → /ru/
```

Сборка и запуск как на сервере:

```bash
npm run build
npm start                      # порт 3000, или: npm start -- -p 8080
```

Статическая копия для GitHub Pages (без формы заявок):

```bash
NEXT_PUBLIC_BASE_PATH=/almaty-snowboard NEXT_PUBLIC_SITE_URL=https://<user>.github.io/almaty-snowboard npm run build:pages   # → out/
```

Полезное:

- `npm run lint` — проверка типов TypeScript.
- `npm run check:content` — список всего, что ещё не подтверждено (TODO для владельца).
- Проверка формы без отправки: `LEAD_DRY_RUN=1 npm start`. Форма честно пишет, что это тестовый режим.

## Документация

- [docs/REPORT.md](docs/REPORT.md) — что сделано, что проверено, что нужно до запуска.
- [docs/CMS.md](docs/CMS.md) — админка `/admin/`: как войти и что в ней можно менять.
- [docs/EDITING.md](docs/EDITING.md) — как добавлять туры, менять цены, публиковать статьи.
- [docs/OWNER-DATA.md](docs/OWNER-DATA.md) — что получить у владельца.
- [docs/LAUNCH.md](docs/LAUNCH.md) — домен, хостинг, Search Console, аналитика, Google Business Profile.
- [docs/CONTENT-PLAN.md](docs/CONTENT-PLAN.md) — 20 тем статей.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — устройство проекта и SEO-решения.
