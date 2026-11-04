# Архитектура

**Стек:** Next.js 15 (App Router) + TypeScript, статическая генерация страниц (SSG), один серверный маршрут для заявок.
Проект был пустой, поэтому выбран Next.js: страницы собираются в HTML на этапе сборки, а приём заявок требует сервера, который Next.js даёт без отдельного бэкенда.

```
content/                 ← всё, что редактирует владелец
  site.json              ← факты о бренде, контакты, TODO (confirmed: true/false)
  media.json             ← фото и alt на RU/EN
  services/*.json        ← направления (статус demo | confirmed | hidden)
  tours/*.json           ← программы, все поля карточки тура
  articles/{ru,en}/*.md  ← статьи (frontmatter + Markdown), статус draft | published
  categories.json        ← рубрики статей
  faq.json               ← вопросы (confirmed: false → скрыто в production)
  pages/{ru,en}/*.md     ← «О нас», условия, политика
  redirects.json         ← 301 при смене slug
src/
  app/[locale]/…         ← страницы /ru/ и /en/ (kk подготовлен, не опубликован)
  app/api/lead/…         ← приём заявки: валидация, антиспам, доставка
  app/sitemap.ts, robots.ts, global-not-found.tsx
  lib/content.ts         ← загрузка и проверка контента (zod): сборка падает на ошибке в данных
  lib/seo.ts             ← metadata, canonical, hreflang, JSON-LD
  lib/routes.ts          ← единый список страниц для sitemap и переключателя языка
  i18n/                  ← языки и словари интерфейса
```

## Режимы

`NEXT_PUBLIC_SITE_MODE=preview` (по умолчанию): видны примеры и черновики с пометками, все страницы `noindex`, sitemap пустой.
`NEXT_PUBLIC_SITE_MODE=production`: только подтверждённое и опубликованное; разделы без контента не показываются (например, «Статьи» без опубликованных статей дают 404 и пропадают из меню).

## SEO-решения

- URL: `/ru/…`, `/en/…`, со слешем на конце; `/` → `/ru/` (временный редирект).
- canonical на свою языковую версию; hreflang только между реально существующими переводами (+ x-default на EN).
- Служебные страницы (`/thank-you/`, `/search/`) и черновики юридических текстов: `noindex, follow`, в robots.txt не закрыты, чтобы поисковик видел noindex. `/api/` закрыт.
- Фильтры каталога работают без изменения URL, поэтому не создают дублей.
- JSON-LD: Organization и WebSite на главной, BreadcrumbList на внутренних, BlogPosting на статьях, TouristTrip/Service только для подтверждённых предложений. Нет рейтингов, отзывов, цен и доступности без данных. FAQPage не используем.
- Изображения через `next/image`: AVIF/WebP, srcset, размеры, lazy ниже первого экрана, priority для первого экрана.
