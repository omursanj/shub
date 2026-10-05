Ниже — PRD, который я бы использовал как **главный технический документ проекта**. Я сразу зафиксировал архитектуру так, чтобы Python действительно был полезен, а не добавлен просто ради наличия.

# Personal Finance Hub
## Product Requirements Document — v1.0

**Тип продукта:** Personal Finance Web Application  
**Платформы:** Web / Mobile Web / PWA-ready  
**Основной пользователь:** владелец приложения  
**Основная валюта по умолчанию:** KZT (₸)  
**Хостинг:** Vercel + Supabase  
**Frontend:** React + TypeScript + Vite  
**Backend:** Python + FastAPI  
**Database:** Supabase PostgreSQL  
**Authentication:** Supabase Auth  
**File Storage:** Supabase Storage  

---

# 1. Product Vision

Personal Finance Hub — персональное финансовое пространство для контроля доходов, расходов, бюджетов, подписок, долгов, финансовых целей и будущих платежей.

Приложение должно не только хранить информацию о транзакциях, но и помогать быстро понимать:

- сколько денег пришло;
- сколько потрачено;
- куда были потрачены деньги;
- сколько бюджета осталось;
- сколько можно безопасно потратить;
- какие платежи ожидаются;
- сколько денег уходит на подписки;
- как меняются расходы со временем;
- какие финансовые цели достигнуты;
- сколько осталось выплатить по долгам и рассрочкам.

Основная философия:

**Record → Understand → Control → Plan → Improve**

---

# 2. Product Goals

Главные цели продукта:

1. Сделать добавление расходов максимально быстрым.
2. Показывать финансовую ситуацию за несколько секунд.
3. Позволять анализировать расходы за:
   - месяц;
   - 3 месяца;
   - 6 месяцев;
   - год;
   - всё время.
4. Контролировать общий бюджет.
5. Контролировать бюджеты отдельных категорий.
6. Планировать будущие обязательные платежи.
7. Управлять подписками.
8. Управлять долгами и рассрочками.
9. Создавать финансовые цели.
10. Позволять загружать и распознавать чеки.
11. Работать одинаково удобно на компьютере и телефоне.
12. Хранить данные безопасно в облаке.

---

# 3. Non-Goals v1

На первой версии НЕ являются обязательными:

- банковские интеграции;
- автоматическое подключение Kaspi/Halyk;
- инвестиционный портфель;
- криптовалюты;
- налоги;
- бухгалтерия;
- AI-финансовый консультант;
- торговля активами;
- социальная сеть;
- сложная система ролей сотрудников.

AI может быть добавлен позднее как отдельный модуль.

---

# 4. Target User

Первая версия создаётся как personal-first приложение.

Один основной пользователь должен иметь возможность использовать систему полностью самостоятельно.

Архитектура при этом должна позволять позднее добавить других пользователей без полной переработки базы данных.

---

# 5. Core Navigation

Основная навигация:

1. Home
2. Transactions
3. Budgets
4. Analytics
5. Planned
6. Subscriptions
7. Goals
8. Debts
9. Settings

Дополнительные модули:

- Accounts
- Family

Они могут включаться через Settings.

---

# 6. Dashboard / Home

Dashboard — главный экран приложения.

Главная задача:

**за 5 секунд дать понимание текущего финансового состояния.**

## Основные элементы

### Available Balance

Показывает приблизительное количество доступных денег.

Пример:

**482 350 ₸**

---

### Income

Доход текущего месяца.

Пример:

**+650 000 ₸**

---

### Expenses

Расходы текущего месяца.

Пример:

**−167 650 ₸**

---

### Budget Progress

Пример:

**167 650 ₸ / 400 000 ₸**

42%

Показывать progress bar.

---

### Safe to Spend

Приложение рассчитывает рекомендуемый дневной лимит.

Формула:

Safe Daily Spend = Remaining Available Budget / Remaining Days

Пример:

Осталось:

154 800 ₸

До конца месяца:

20 дней

154 800 / 20 = **7 740 ₸ в день**

Dashboard показывает:

**Safe to spend today: ~7 740 ₸**

---

### Upcoming Payments

Показывать ближайшие платежи.

Например:

Netflix  
4 990 ₸  
9 October

Gym  
25 000 ₸  
12 October

Internet  
8 000 ₸  
15 October

---

### Spending Categories

Показывать основные категории:

Food  
Housing  
Transport  
Health  
Subscriptions  
Entertainment

Каждая категория показывает:

- сумму;
- процент бюджета;
- progress indicator.

---

### Insights

Простые автоматические выводы без AI.

Например:

Food spending ↑ 18%

Transport spending ↓ 12%

Subscription spending unchanged

Budget used: 62%

---

# 7. Transactions

Transactions является центральной частью приложения.

Транзакция может быть:

- Expense
- Income
- Transfer

---

# 8. Quick Add Transaction

Добавление расхода должно занимать несколько секунд.

Большая кнопка:

**+ Add**

После нажатия:

Amount

Expense / Income

Category

Date

Save

---

# 9. Transaction Details

Дополнительные поля открываются через:

**More details**

Поля:

- amount;
- currency;
- transaction type;
- category;
- store;
- product;
- note;
- date;
- time;
- payment account;
- receipt;
- personal/family scope.

---

# 10. Categories

Приложение сразу содержит базовые категории.

## Default Categories

### Housing
- Rent
- Utilities
- Furniture
- Repairs

### Food
- Groceries
- Restaurants
- Delivery
- Coffee

### Transport
- Taxi
- Public transport
- Fuel
- Car

### Health
- Pharmacy
- Doctor
- Dental
- Medical tests

### Sport
- Gym
- Equipment
- Classes

### Entertainment
- Cinema
- Games
- Events
- Hobbies

### Education
- Courses
- Books
- Training

### Shopping
- Clothes
- Electronics
- Home

### Subscriptions

### Travel

### Children / Family

### Gifts

### Other

---

Пользователь может:

- создать категорию;
- редактировать;
- выбрать icon;
- выбрать accent color;
- архивировать категорию.

---

# 11. Receipts

К транзакции можно прикрепить фотографию чека.

Файл сохраняется в Supabase Storage.

Поддерживаемые форматы:

- JPEG
- PNG
- WEBP
- PDF — позднее

---

# 12. Receipt Scanner

Приложение должно уметь распознавать чек.

Flow:

Take photo / Upload photo

↓

Upload to Supabase Storage

↓

Python Receipt Processing API

↓

OCR

↓

Extract fields

↓

User confirmation

↓

Create Transaction

---

## Распознаваемые данные

OCR должен попытаться определить:

- магазин;
- дату;
- время;
- товары;
- количество;
- цену товара;
- общую сумму;
- скидку;
- налог, если указан;
- валюту.

---

Пример:

Magnum

5 October 2026

Milk — 890 ₸  
Bread — 450 ₸  
Apples — 1 650 ₸  
Chicken — 3 490 ₸  

**Total: 6 480 ₸**

Перед сохранением пользователь обязательно может исправить данные.

---

# 13. Budgets

Два уровня бюджета.

## Global Budget

Например:

Monthly Budget

400 000 ₸

Spent

270 000 ₸

Remaining

130 000 ₸

---

## Category Budgets

Food

100 000 ₸

Spent

72 000 ₸

72%

---

Transport

40 000 ₸

Spent

38 000 ₸

95%

---

Цветовые состояния:

Normal  
Warning  
Critical  
Exceeded

Цвета должны быть мягкими, а не агрессивными.

---

# 14. Planned Expenses

Пользователь может добавить будущий расход.

Поля:

- name;
- amount;
- currency;
- category;
- due date;
- recurring;
- account;
- note.

---

Пример:

Rent  
150 000 ₸  
10 October

Internet  
8 000 ₸  
15 October

Gym  
25 000 ₸  
1 November

---

Planned Expense может иметь статус:

- upcoming;
- paid;
- overdue;
- cancelled.

После оплаты его можно конвертировать в обычную transaction.

---

# 15. Real Available Money

Приложение должно учитывать будущие обязательные расходы.

Формула:

Real Available = Current Available − Upcoming Mandatory Expenses

Например:

Balance:

400 000 ₸

Upcoming:

Rent — 150 000 ₸  
Internet — 8 000 ₸  
Gym — 25 000 ₸

Total planned:

183 000 ₸

Real Free Money:

**217 000 ₸**

---

# 16. Subscriptions

Отдельный модуль регулярных платежей.

Subscription содержит:

- name;
- price;
- currency;
- frequency;
- next payment;
- category;
- active/inactive;
- payment method;
- note.

---

Пример:

ChatGPT  
$20  
Monthly

Netflix  
4 990 ₸  
Monthly

Gym  
25 000 ₸  
Monthly

---

Показывать:

Monthly subscription spending

и

Annual subscription spending.

---

# 17. Financial Goals

Пользователь может создать цель.

Пример:

Vacation

Target:

1 000 000 ₸

Saved:

650 000 ₸

Remaining:

350 000 ₸

Progress:

65%

---

Goal содержит:

- name;
- icon;
- target amount;
- current amount;
- currency;
- deadline;
- priority;
- note.

---

Можно добавлять Goal Contributions.

Например:

+50 000 ₸

October contribution

---

# 18. Debts

Три типа.

### I Owe

Деньги, которые пользователь должен.

### Owed to Me

Деньги, которые должны пользователю.

### Loan / Installment

Кредит или рассрочка.

---

Debt содержит:

- person/company;
- initial amount;
- remaining amount;
- currency;
- interest — optional;
- monthly payment;
- due date;
- start date;
- status;
- notes.

---

Debt Payments должны храниться отдельно.

Это позволит видеть историю погашения.

---

# 19. Analytics

Analytics должна стать одной из визуально самых красивых частей приложения.

Period selector:

1M  
3M  
6M  
1Y  
ALL

---

Основные показатели:

Total Income

Total Expenses

Savings

Savings Rate

Average Monthly Spending

Average Daily Spending

Largest Expense

Highest Spending Category

Highest Spending Month

---

# 20. Savings Rate

Формула:

Savings Rate = (Income − Expenses) / Income × 100%

Если Income = 0, показатель не рассчитывается.

---

# 21. Spending Trends

Line / Area chart.

Показывать:

расходы по дням;

расходы по месяцам;

доход;

экономию.

---

# 22. Category Analytics

Donut chart или современная bar visualization.

Например:

Food — 26%

Housing — 24%

Transport — 14%

Entertainment — 9%

Health — 7%

Other — 20%

---

# 23. Period Comparison

Пример:

October vs September

Food  
+18%

Transport  
−12%

Health  
+4%

Entertainment  
−21%

---

# 24. Multi-Currency

Поддерживаемые валюты не должны быть жёстко ограничены.

Минимально:

KZT  
USD  
EUR  
GBP  
RUB  
PLN  
CNY

Использовать стандартные ISO currency codes.

---

Каждая transaction хранит:

original_amount

currency_code

exchange_rate

base_amount

---

Например:

$20 subscription.

Base currency:

KZT

В analytics используется base_amount.

Исторический курс должен сохраняться вместе с транзакцией, чтобы аналитика прошлого не менялась при изменении текущего курса.

На первой версии курс может задаваться вручную.

Автоматическое получение валютных курсов — отдельное улучшение.

---

# 25. Accounts — Optional

В Settings:

**Enable Accounts**

После включения пользователь может создать:

Kaspi

Halyk

Cash

Savings

Deposit

Other

---

Account содержит:

name

type

currency

opening balance

icon

color

active status

---

Пользователь может отключить Accounts и использовать приложение в Simple Mode.

---

# 26. Family Mode — Optional

В Settings:

**Enable Family Mode**

После этого операции могут иметь scope:

Personal

Family

Dashboard позволяет переключаться:

Personal

Family

All

---

Архитектура должна в будущем позволять приглашать других членов семьи.

В первой версии приглашения необязательны.

---

# 27. Settings

Settings содержит:

Profile

Default currency

Theme

Categories

Accounts

Family Mode

Notifications

Receipt settings

Date format

Number format

Application modules

Export

Delete account

---

# 28. Design Direction

Дизайн:

**Apple-inspired modern financial dashboard.**

Но НЕ копия Apple.

---

## Design Principles

Clean

Calm

Premium

Modern

Visual

Fast

Personal

---

Избегать:

слишком большого количества цветов;

чистого чёрно-белого оформления;

банковского корпоративного дизайна;

огромного количества borders;

визуального шума;

слишком большого числа графиков на одном экране.

---

## Suggested Palette

Background:

warm white / soft grey.

Primary accents:

Deep Blue

Indigo

Soft Purple

Emerald

Amber

Coral

---

Категории могут иметь разные цвета.

Основной интерфейс остаётся спокойным.

---

# 29. Themes

Минимально:

Light Mode

Dark Mode

System

---

Позднее:

Custom accent colors.

---

# 30. Mobile First

Приложение проектируется mobile-first.

Основное использование предполагается с телефона.

На mobile navigation:

Home

Transactions

Add

Analytics

More

---

Центральная кнопка:

**+**

для быстрого добавления операции.

---

На Desktop:

Sidebar navigation.

---

# 31. TECH STACK

## Frontend

### React

Используется для построения UI.

### TypeScript

Используется во всём frontend-коде.

Запрещается необоснованное использование `any`.

### Vite

Используется как development/build tool.

---

## Routing

**React Router**

Основные routes:

/

 /transactions

 /budgets

 /analytics

 /planned

 /subscriptions

 /goals

 /debts

 /settings

---

# 32. Frontend Libraries

### Data Fetching

TanStack Query

Назначение:

- caching;
- loading states;
- mutation handling;
- invalidation;
- server state.

---

### Forms

React Hook Form

+

Zod

Назначение:

- формы;
- validation;
- typed schemas.

---

### Styling

Tailwind CSS

+

custom Design System.

UI не должен выглядеть как стандартный Tailwind template.

---

### UI Primitives

Radix UI допустим для:

- dialogs;
- dropdowns;
- tabs;
- tooltips;
- accessibility primitives.

---

### Charts

Recharts.

Использовать для:

- line charts;
- area charts;
- bar charts;
- donut charts.

---

### Icons

Lucide React.

---

### Dates

date-fns.

---

# 33. Frontend State Architecture

Разделить state на две категории.

## Server State

TanStack Query.

Пример:

transactions

budgets

goals

subscriptions

---

## Local UI State

React state или Zustand.

Например:

selected period

sidebar state

theme

temporary UI filters

modal states

---

Не хранить данные базы в глобальном Zustand store без необходимости.

---

# 34. Backend

## Python

Python используется для серверных операций.

## Framework

**FastAPI**

Backend размещается через Vercel Python Functions.

---

Основные задачи Python:

Receipt OCR

Receipt parsing

Complex financial calculations

Analytics aggregation при необходимости

Data export

Future AI integration

Future external integrations

Scheduled processing logic

---

# 35. API Structure

Пример:

GET /api/health

POST /api/receipts/scan

POST /api/receipts/parse

GET /api/analytics/summary

GET /api/analytics/trends

POST /api/export

---

CRUD обычных пользовательских данных может выполняться непосредственно через Supabase SDK с защитой через RLS.

Это уменьшает количество ненужных API endpoints.

Python используется там, где действительно требуется server-side processing.

---

# 36. Python Libraries

FastAPI

Pydantic

httpx

Pillow

python-multipart

pytest

---

Для Receipt Scanner будет создан abstraction layer:

ReceiptOCRProvider

Это позволит позднее менять OCR-движок без изменения остального приложения.

---

# 37. Supabase

Supabase используется для:

PostgreSQL

Auth

Storage

Realtime — при необходимости

Database Functions — при необходимости

---

# 38. Authentication

Supabase Auth.

Первоначально:

Email + Password.

Дополнительно можно добавить:

Magic Link

Google OAuth

Apple OAuth

---

Каждый пользователь получает UUID.

Все приватные записи связаны с:

user_id.

---

# 39. Database

Database:

PostgreSQL через Supabase.

---

Основные таблицы:

profiles

user_settings

categories

accounts

transactions

transaction_items

receipts

budgets

planned_expenses

subscriptions

goals

goal_contributions

debts

debt_payments

households

household_members

---

# 40. transactions

Основные поля:

id UUID

user_id UUID

account_id UUID nullable

category_id UUID

type

amount

currency_code

exchange_rate

base_amount

store_name

product_name

note

transaction_date

scope

created_at

updated_at

---

type:

expense

income

transfer

---

# 41. transaction_items

Используется для товаров из чеков.

Поля:

id

transaction_id

name

quantity

unit_price

total_price

category_id nullable

---

# 42. receipts

id

user_id

transaction_id

storage_path

ocr_status

raw_text

merchant

detected_total

detected_date

created_at

---

ocr_status:

uploaded

processing

processed

failed

confirmed

---

# 43. budgets

id

user_id

category_id nullable

period

amount

currency_code

start_date

end_date

---

Если category_id NULL:

это global budget.

---

# 44. subscriptions

id

user_id

name

amount

currency

billing_frequency

next_payment_date

category_id

active

created_at

---

# 45. goals

id

user_id

name

target_amount

current_amount

currency

deadline

status

created_at

---

# 46. debts

id

user_id

type

counterparty

original_amount

remaining_amount

currency

monthly_payment

due_date

status

created_at

---

# 47. Database Rules

Все ID:

UUID.

Все денежные значения:

Postgres NUMERIC.

Никогда не использовать floating point для хранения денег.

---

Timestamp:

timestamptz.

---

Все основные таблицы должны иметь:

created_at

updated_at

---

Физическое удаление финансовых данных использовать осторожно.

Для некоторых сущностей предпочтителен:

archived_at

или

status.

---

# 48. Security

Для всех пользовательских таблиц включить:

**Row Level Security — RLS.**

Базовая логика:

пользователь может видеть только свои данные.

Условие:

auth.uid() = user_id

---

Secret / service keys:

никогда не помещаются во frontend.

---

Frontend получает только Supabase publishable key.

---

Backend secrets хранятся только в:

Vercel Environment Variables

или

Supabase Secrets.

---

# 49. Receipt Security

Receipts bucket:

private.

Файлы не должны быть публичными.

Доступ только владельцу файла.

Storage policies должны проверять user ownership.

---

# 50. Architecture

Основная архитектура:

User

↓

React + TypeScript

↓

Vite Application

↓

Vercel

↓

Supabase Auth

↓

Supabase PostgreSQL

↓

Supabase Storage

---

Для специальных операций:

React

↓

FastAPI

↓

Python Vercel Function

↓

Supabase / OCR Processing

---

# 51. Repository Structure

Пример:

```text
finance-hub/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── analytics/
│   │   ├── subscriptions/
│   │   ├── goals/
│   │   ├── debts/
│   │   ├── receipts/
│   │   └── settings/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── api/
│   │   └── utils/
│   ├── routes/
│   ├── types/
│   ├── styles/
│   └── main.tsx
│
├── api/
│   ├── index.py
│   ├── routes/
│   │   ├── receipts.py
│   │   ├── analytics.py
│   │   └── export.py
│   ├── services/
│   │   ├── receipt_service.py
│   │   └── analytics_service.py
│   └── models/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── tests/
│
├── public/
│
├── package.json
├── requirements.txt
├── vite.config.ts
├── tsconfig.json
└── vercel.json
```

---

# 52. Environment Variables

Frontend:

VITE_SUPABASE_URL

VITE_SUPABASE_PUBLISHABLE_KEY

VITE_API_URL

---

Backend:

SUPABASE_URL

SUPABASE_SECRET_KEY

DATABASE_URL — если потребуется direct DB connection

OCR_PROVIDER_KEY — если потребуется

---

Секреты никогда не commit в Git.

---

# 53. Deployment

Source control:

GitHub.

Основные branches:

main

develop

feature/*

---

## Vercel

Vercel используется для:

frontend deployment;

Python API;

preview deployments;

production deployment.

---

main:

Production.

Pull Requests:

Preview Deployment.

---

# 54. Supabase Environments

Рекомендуется иметь:

Development

Production

Для начала допускается один Supabase project, но перед реальным использованием рекомендуется разделить development и production.

---

# 55. Migrations

Все изменения базы должны выполняться через migrations.

Не создавать production database вручную без migration history.

---

# 56. Validation

Валидация должна выполняться на двух уровнях.

Frontend:

Zod.

Backend:

Pydantic.

Database:

constraints.

---

Например:

amount > 0

currency_code NOT NULL

type IN (...)

user_id NOT NULL

---

# 57. Error Handling

Пользователь не должен видеть technical stack traces.

UI сообщения:

Could not save transaction.

Could not process receipt.

Connection lost.

Please try again.

---

Логи должны сохранять техническую причину ошибки.

---

# 58. Loading States

Каждая асинхронная операция должна иметь:

loading

success

empty

error

states.

---

Использовать skeleton loaders вместо постоянных spinners там, где это улучшает UX.

---

# 59. Offline / Bad Connection

Первая версия не обязана работать полностью offline.

Однако:

ввод транзакции не должен теряться при случайной ошибке сети.

Позднее можно добавить PWA offline queue.

---

# 60. Performance

Цели:

быстрый первый экран;

lazy loading тяжёлых страниц;

lazy loading charts;

image compression для receipts;

pagination / infinite scroll transactions;

не загружать всю историю операций при открытии приложения.

---

# 61. Accessibility

Минимально:

keyboard navigation;

semantic HTML;

accessible dialogs;

visible focus states;

достаточный contrast;

labels у input;

не передавать информацию только цветом.

---

# 62. Testing

## Frontend

Vitest

React Testing Library

---

## End-to-End

Playwright

Основные flows:

Login

Add Transaction

Edit Transaction

Delete / Archive Transaction

Create Budget

Upload Receipt

Create Goal

Create Planned Payment

---

## Backend

Pytest.

---

# 63. CI Checks

Перед merge:

TypeScript check

Lint

Frontend tests

Python tests

Production build

---

Важно:

Vite отвечает за сборку и transpilation, но type checking должен запускаться отдельно через TypeScript.

---

# 64. MVP

Первая рабочая версия должна включать:

Authentication

Dashboard

Transactions

Categories

Global Budget

Category Budgets

Basic Analytics

Planned Expenses

Responsive Mobile UI

Supabase Database

RLS

Vercel Deployment

---

# 65. Phase 2

Subscriptions

Goals

Debts

Accounts

Receipt upload

Receipt OCR

Advanced Analytics

Multi-currency improvements

---

# 66. Phase 3

Family Mode

Notifications

Recurring transaction automation

Currency API

Export

PWA

---

# 67. Future Phase

AI Financial Assistant.

Примеры:

“Where did I spend the most money?”

“Compare the last three months.”

“How can I reduce my expenses?”

“Which subscriptions cost me the most?”

---

AI должен работать только с финансовыми данными, к которым пользователь имеет доступ.

AI не является частью MVP.

---

# 68. MVP Development Order

## Step 1

Create GitHub repository.

React + TypeScript + Vite.

Configure project structure.

---

## Step 2

Create Supabase project.

Configure environment variables.

Connect React to Supabase.

---

## Step 3

Implement Supabase Auth.

Login.

Signup.

Session handling.

Protected routes.

---

## Step 4

Create database schema.

profiles

categories

transactions

budgets

planned_expenses

---

## Step 5

Implement RLS.

---

## Step 6

Create base Design System.

Typography.

Colors.

Buttons.

Cards.

Inputs.

Modals.

Navigation.

---

## Step 7

Build responsive App Layout.

Mobile bottom navigation.

Desktop sidebar.

---

## Step 8

Build Transactions.

Create.

Read.

Update.

Delete / Archive.

Filters.

---

## Step 9

Build Dashboard.

Income.

Expenses.

Balance.

Budget.

Categories.

Upcoming payments.

---

## Step 10

Build Budgets.

Global budget.

Category budgets.

Progress.

---

## Step 11

Build Analytics.

1M.

3M.

6M.

1Y.

Charts.

Comparisons.

---

## Step 12

Build Planned Expenses.

---

## Step 13

Deploy to Vercel.

---

## Step 14

Add subscriptions.

---

## Step 15

Add financial goals.

---

## Step 16

Add debts.

---

## Step 17

Add receipts.

Supabase Storage.

---

## Step 18

Create Python FastAPI backend.

---

## Step 19

Implement OCR pipeline.

---

## Step 20

Polish mobile UX and animations.

---

# 69. Definition of Done — MVP

MVP считается готовым, если пользователь может:

создать аккаунт;

войти;

добавить доход;

добавить расход;

выбрать категорию;

создать свою категорию;

редактировать операцию;

удалить/архивировать операцию;

установить месячный бюджет;

установить бюджет категории;

увидеть расходы за месяц;

увидеть доходы;

увидеть остаток;

увидеть диаграммы;

сравнить финансовые периоды;

добавить будущий платёж;

увидеть реальные свободные деньги;

использовать приложение с телефона;

закрыть браузер и позднее увидеть сохранённые данные;

получать доступ только к собственным данным.

---

# 70. Final Technology Stack

### Frontend
React  
TypeScript  
Vite  
React Router  
TanStack Query  
React Hook Form  
Zod  
Tailwind CSS  
Radix UI  
Recharts  
Lucide React  
date-fns

### Backend
Python  
FastAPI  
Pydantic  
httpx  
Pillow

### Database
Supabase PostgreSQL

### Authentication
Supabase Auth

### Storage
Supabase Storage

### Security
PostgreSQL RLS

### Hosting
Vercel

### Backend Hosting
Vercel Python Functions

### Database Hosting
Supabase Cloud

### Source Control
GitHub

### Frontend Testing
Vitest  
React Testing Library

### E2E Testing
Playwright

### Backend Testing
Pytest

---

# 71. Core Product Principle

Приложение не должно превращаться в сложную бухгалтерскую систему.

Каждый экран должен отвечать на конкретный финансовый вопрос.

Home:

**Как у меня дела с деньгами?**

Transactions:

**Куда ушли деньги?**

Budget:

**Укладываюсь ли я в план?**

Analytics:

**Как меняются мои расходы?**

Planned:

**Что мне ещё предстоит оплатить?**

Subscriptions:

**Сколько я отдаю за регулярные сервисы?**

Goals:

**На что я коплю и сколько осталось?**

Debts:

**Кому и сколько я должен?**

Главная задача приложения:

**дать пользователю ясное и спокойное ощущение контроля над своими деньгами.**


