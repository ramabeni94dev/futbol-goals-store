# Futbol Goals Store

Ecommerce de arcos de futbol construido con Next.js 16, App Router, Tailwind CSS, TypeScript y Firebase. La aplicacion evoluciono desde un storefront basico a una base mas realista para ecommerce: checkout autoritativo server-side, integracion con Mercado Pago, control de stock con reserva, OMS admin, emails transaccionales, SEO por producto, catalogo paginado y cobertura automatizada.

## Stack

- Next.js 16 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Firebase Admin SDK
- Mercado Pago Checkout Pro
- Resend
- React Hook Form + Zod
- Vitest + Playwright

## Capacidades actuales

- Home comercial con hero, categorias, destacados, beneficios y señales de confianza
- Catalogo `/shop` con filtros por URL, busqueda, ordenamiento y paginacion server-side
- Detalle `/shop/[slug]` con metadata dinamica, Open Graph, Twitter cards y JSON-LD `Product`
- Carrito persistente con validacion de cantidad y limite por stock disponible
- Registro, login, Google login, logout, reset password y verificacion de email
- Checkout protegido con recalculo de subtotal, descuento, envio, impuestos y total en servidor
- Validacion server-side de productos, precios vigentes y stock real contra Firestore
- Reserva transaccional de stock al crear orden
- Mercado Pago Checkout Pro con creacion de preferencia desde servidor
- Webhook idempotente para conciliacion de pago y actualizacion de orden
- Admin `/admin/orders` con OMS basico: detalle, cambio de estados, tracking, notas y auditoria
- CRUD de productos admin con upload a Firebase Storage y seed demo
- Paginas publicas de confianza y legales: envios, pagos, devoluciones, FAQ, terminos y privacidad
- Emails transaccionales para verificacion, orden creada, pago confirmado, orden enviada y cancelacion
- Test suite con unit/integration en Vitest y E2E en Playwright

## Arquitectura

La aplicacion separa la logica critica del browser:

- `src/app`: rutas, paginas y route handlers
- `src/components`: UI del storefront y admin
- `src/server`: logica de negocio server-side, auth guards, pricing, pagos, emails y servicios de ordenes
- `src/repositories`: acceso a Firestore desde servidor
- `src/lib`: helpers puros, formatters, serializadores y utilidades reutilizables
- `src/validators`: contratos Zod para requests y mutaciones
- `src/types`: modelos de dominio tipados para catalogo, ordenes, pagos e inventario
- `src/emails`: templates de email reutilizables

Mas detalle tecnico en [`docs/ecommerce-architecture.md`](./docs/ecommerce-architecture.md).

## Flujo de checkout y pagos

1. El cliente arma el carrito y envia solo `productId`, `quantity`, datos del cliente, envio y cupon.
2. `POST /api/checkout` valida el request con Zod y autentica al usuario.
3. El servidor relee productos desde Firestore, valida estado, precio y stock disponible.
4. Se recalcula `subtotal`, `shippingCost`, `tax`, `discount` y `total` en servidor.
5. Se crea la orden en Firestore mediante transaccion y se reserva stock.
6. Si Mercado Pago esta configurado, el servidor crea la preferencia de pago y actualiza la orden.
7. El webhook de Mercado Pago reconcilia el pago de forma idempotente.
8. Si el pago se aprueba, la reserva se consume y descuenta stock. Si falla o se cancela, la reserva se libera.

## Modelo de dominio principal

### `products`

- `id`
- `sku`
- `name`
- `slug`
- `description`
- `shortDescription`
- `price`
- `category`
- `size`
- `stock`
- `reservedStock`
- `trackInventory`
- `isActive`
- `images`
- `featured`
- `technicalSpecs`
- `createdAt`
- `updatedAt`

### `orders`

- `id`
- `userId`
- `customerName`
- `customerEmail`
- `items`
- `currency`
- `subtotal`
- `shippingCost`
- `tax`
- `discount`
- `total`
- `shippingMethod`
- `shippingAddress`
- `couponCode`
- `status`
- `paymentStatus`
- `fulfillmentStatus`
- `paymentMethod`
- `paymentProvider`
- `paymentIntentId`
- `preferenceId`
- `transactionId`
- `inventoryReservation`
- `trackingNumber`
- `carrier`
- `adminNotes`
- `statusHistory`
- `paymentLogs`
- `webhookEvents`
- `paidAt`
- `shippedAt`
- `deliveredAt`
- `cancelledAt`
- `refundedAt`
- `createdAt`
- `updatedAt`

### `users`

- `uid`
- `name`
- `email`
- `role`
- `emailVerified`
- `createdAt`
- `updatedAt`

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores.

### Frontend / app URLs

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Firebase client

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Firebase Admin

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=
```

Puedes configurar Firebase Admin de dos formas:

- inline, usando `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` y `FIREBASE_ADMIN_PRIVATE_KEY`
- por archivo, usando `FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH` apuntando al JSON de la cuenta de servicio

Si usas la opcion inline, `FIREBASE_ADMIN_PRIVATE_KEY` debe cargarse escapando saltos de linea como `\\n`.

### Mercado Pago

```env
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
MERCADO_PAGO_WEBHOOK_URL=
MERCADO_PAGO_SUCCESS_URL=
MERCADO_PAGO_PENDING_URL=
MERCADO_PAGO_FAILURE_URL=
```

### Emails

```env
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=
```

## Puesta en marcha local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Scripts utiles

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

`npm run test:e2e` compila una build dedicada con bypass de auth solo para la suite E2E.

## Configuracion de Firebase

1. Crear un proyecto Firebase.
2. Habilitar Authentication con Email/Password y Google.
3. Crear Firestore en modo production.
4. Crear Firebase Storage.
5. Configurar la app web y copiar las credenciales publicas.
6. Configurar credenciales de servicio para Firebase Admin en variables privadas.
7. Publicar reglas e indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

8. Asignar `role: "admin"` al usuario que administrara catalogo y ordenes.

## Configuracion de Mercado Pago

1. Crear una aplicacion en Mercado Pago y obtener `MERCADO_PAGO_ACCESS_TOKEN`.
2. Configurar `MERCADO_PAGO_WEBHOOK_URL` apuntando a `/api/webhooks/mercado-pago`.
3. Configurar `MERCADO_PAGO_WEBHOOK_SECRET` para validar la firma.
4. Definir `MERCADO_PAGO_SUCCESS_URL`, `MERCADO_PAGO_PENDING_URL` y `MERCADO_PAGO_FAILURE_URL`.
5. Verificar que `NEXT_PUBLIC_SITE_URL` o `APP_URL` coincidan con el dominio publico real.

Sin estas variables, el checkout sigue creando ordenes seguras pero opera en modo manual.

Nota para desarrollo local:

- si trabajas en `localhost`, la app puede crear la preferencia y redirigir al checkout de Mercado Pago
- `auto_return`, `back_urls` y `notification_url` se omiten automaticamente porque Mercado Pago requiere URLs publicas para esos callbacks
- para probar retorno automatico y webhooks, usa un dominio publico temporal como `ngrok`

## Configuracion de emails

1. Crear una API key en Resend.
2. Configurar `EMAIL_FROM` con un remitente validado.
3. Configurar opcionalmente `EMAIL_REPLY_TO`.
4. Personalizar dominio y branding desde Resend y Firebase Auth si quieres una salida mas corporativa.

## Catalogo y filtros por URL

La pagina `/shop` soporta search params persistibles:

- `q`: busqueda por nombre
- `category`: filtro por categoria
- `sort`: `featured`, `price_asc`, `price_desc`, `name_asc`, `name_desc`
- `page`: pagina actual

Ejemplo:

```text
/shop?q=profesional&category=professional&sort=price_desc&page=2
```

## Paginas publicas

- `/shipping`
- `/returns`
- `/payments`
- `/faq`
- `/terms`
- `/privacy`

## Seed demo

El panel `/admin/products` incluye un boton `Seed demo`. Solo inserta productos si la coleccion `products` esta vacia.

Productos demo:

- Arco de Futbol 11 Soldado 3 pulgadas
- Arco Infantil Reforzado
- Arco de Entrenamiento Desarmable
- Arco Profesional con Red
- Mini Arco para Practica

## Deploy en Vercel

1. Importar el repositorio en Vercel.
2. Cargar todas las variables de entorno publicas y privadas.
3. Configurar el dominio final en `NEXT_PUBLIC_SITE_URL` y `APP_URL`.
4. Registrar la URL publica del webhook en Mercado Pago.
5. Desplegar.

## Notas operativas

- Si faltan credenciales de Firebase cliente, la tienda publica sigue mostrando productos demo.
- Si faltan credenciales de Firebase Admin, las mutaciones server-side sensibles no estaran disponibles.
- Si falta Mercado Pago, el checkout queda operativo en modo manual.
- Si falta Resend, la aplicacion sigue funcionando pero registra el evento y omite el envio de email.
