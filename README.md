# Futbol Goals Store

Ecommerce de arcos de futbol construido con Next.js 16, App Router, Tailwind CSS, TypeScript y Firebase. Incluye catalogo responsive, detalle de producto, autenticacion, carrito persistente, checkout con ordenes en Firestore y panel admin para productos y pedidos.

## Stack

- Next.js `16.2.1` con App Router
- React `19`
- TypeScript
- Tailwind CSS `4`
- Firebase Authentication
- Firestore Database
- Firebase Storage
- React Hook Form + Zod
- Deploy listo para Vercel

## Funcionalidades

- Home comercial con hero, categorias, destacados y beneficios
- Catalogo `/shop` con busqueda por nombre y filtros por categoria
- Detalle `/shop/[slug]` con galeria, ficha tecnica y CTA de compra
- Carrito `/cart` con persistencia local y control de cantidades
- Registro, login, logout y cuenta de usuario
- Login con Google
- Recupero de contrasena por email
- Checkout protegido con guardado de ordenes en Firestore
- Panel admin `/admin` con dashboard, CRUD de productos, seed demo, upload de imagenes y vista de ordenes
- Reglas iniciales para Firestore y Storage

## Rutas

- `/`
- `/shop`
- `/shop/[slug]`
- `/cart`
- `/checkout`
- `/forgot-password`
- `/login`
- `/register`
- `/account`
- `/admin`
- `/admin/products`
- `/admin/orders`

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores del bundle publico de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Puesta en marcha local

```bash
npm install
npm run dev
```

Validaciones disponibles:

```bash
npm run lint
npm run typecheck
npm run build
```

## Configuracion de Firebase

1. Crea un proyecto en Firebase.
2. Habilita Authentication con proveedores Email/Password y Google.
3. Crea una app web y copia sus credenciales en `.env.local`.
4. Crea Firestore Database en modo production.
5. Crea Firebase Storage.
6. Publica reglas e indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

7. Para habilitar el panel admin, asigna el rol manualmente al usuario en la coleccion `users`:

```json
{
  "uid": "USER_UID",
  "name": "Admin",
  "email": "admin@tu-dominio.com",
  "role": "admin",
  "createdAt": "serverTimestamp"
}
```

8. Personaliza la plantilla del mail de recuperacion en Firebase Console:

- Authentication
- Templates
- Password reset

Desde ahi puedes ajustar asunto, remitente y branding del correo para un resultado mas profesional.

## Seed demo

El panel `/admin/products` incluye un boton `Seed demo`. Solo crea productos si la coleccion `products` esta vacia.

Productos demo incluidos:

- Arco de Futbol 11 Soldado 3 pulgadas
- Arco Infantil Reforzado
- Arco de Entrenamiento Desarmable
- Arco Profesional con Red
- Mini Arco para Practica

## Modelo de datos

### `products`

- `id`
- `name`
- `slug`
- `description`
- `shortDescription`
- `price`
- `category`
- `size`
- `stock`
- `images`
- `featured`
- `technicalSpecs`
- `createdAt`

### `orders`

- `id`
- `userId`
- `customerName`
- `customerEmail`
- `items`
- `total`
- `status`
- `shippingAddress`
- `createdAt`

### `users`

- `uid`
- `name`
- `email`
- `role`
- `createdAt`

## Estructura del proyecto

```text
src/
  app/
  components/
  config/
  context/
  data/
  hooks/
  lib/
  services/
  types/
```

## Deploy en Vercel

1. Importa el repositorio en Vercel.
2. Configura las mismas variables `NEXT_PUBLIC_FIREBASE_*`.
3. Ejecuta el deploy.

No hace falta configuracion especial adicional para Next.js en Vercel.

## Notas de implementacion

- Si Firebase no esta configurado, la tienda publica sigue mostrando productos demo.
- Auth, checkout y admin muestran mensajes guiados cuando faltan variables.
- El carrito se persiste en `localStorage`.
- Las reglas admin dependen del documento `users/{uid}.role`.
