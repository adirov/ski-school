# Хостинг snow-school.kz (hoster.kz)

- Тариф «Эконом-1» на hoster.kz, панель Plesk (вход: личный кабинет hoster.kz → Хостинг snow-school.kz → «Войти в панель»). Node.js на тарифе не нужен: сайт статический.
- Папка сайта: `httpdocs`. Домен на DNS hoster.kz (ns1–ns3.hoster.kz).

## Как сайт попадает на хостинг

1. Любой коммит в `main` (в том числе сохранение в админке `/admin`) запускает `.github/workflows/deploy.yml`.
2. Workflow собирает сайт (`npm run build:pages`, корень домена, `NEXT_PUBLIC_SITE_URL=https://snow-school.kz`, индексация включена) и кладёт готовую папку `out/` в ветку `hoster` (только сборка, без исходников).
3. В Plesk → «Git» подключён публичный репозиторий `https://github.com/adirov/ski-school.git`, ветка `hoster`, автоматическое развёртывание в `httpdocs`. Последний шаг workflow вызывает webhook Plesk, Plesk забирает ветку за несколько секунд. Адрес webhook (Plesk → Git → настройки репозитория) хранится в секрете GitHub `PLESK_WEBHOOK_URL` (Settings → Secrets and variables → Actions).

Паролей от хостинга в GitHub нет. Если webhook сломался: Plesk → Git → «Получить» (Pull) и «Развернуть».

## .htaccess

Генерируется при сборке (`scripts/build-pages.mjs`): 301 на https и без www, 302 с `/` на `/ru/`, 301 из `content/redirects.json`, 404.html, кэш и заголовки безопасности. Править на сервере бессмысленно: следующая сборка перезапишет. `FORCE_HTTPS=0` при сборке отключает редирект на https (только если сертификат не выпущен).

## SSL

Plesk → SSL/TLS-сертификаты → Let's Encrypt для `snow-school.kz` и `www.snow-school.kz`, продление автоматически.

## Переменные GitHub (Settings → Secrets and variables → Actions → Variables), все необязательные

- `SITE_URL`: по умолчанию `https://snow-school.kz`.
- `ALLOW_INDEXING`: по умолчанию `1` для домена (копия на GitHub Pages всегда закрыта от индексации).
- `GA4_ID`, `YANDEX_METRIKA_ID`: счётчики, если появятся.
