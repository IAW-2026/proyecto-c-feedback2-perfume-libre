[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Vy85h5hj)
# Feedback App - Perfume Libre

Aplicación **Feedback** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — Proyecto C (Marketplace).

## Link al deploy de producción
**[https://proyecto-c-feedback2-perfume-libre.vercel.app/](proyecto-c-feedback2-perfume-libre.vercel.app)**

## Usuarios disponibles para realizar pruebas
Para evaluar la aplicación, se pueden utilizar las siguientes credenciales de prueba preconfiguradas en Clerk:

# Contiene productos de seller a reseñar
- **Email:** `buyer+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`

# Contiene reseñas de buyer y de otros compradores
- **Email:** `seller+cler_ktest@iaw.com`
- **Contraseña:** `iawuser#`

# Tiene acceso al panel de reportes
- **Email:** `moderator+cler_ktest@iaw.com`
- **Contraseña:** `iawuser#`

## Breve descripción del proyecto
Esta aplicación corresponde al **Módulo de Reseñas y Calificaciones** para el marketplace "Perfume Libre". Su propósito central es gestionar la reputación dentro del ecosistema, permitiendo a los compradores calificar de manera independiente tanto la calidad de los productos adquiridos como el servicio ofrecido por los vendedores.

La plataforma está construida utilizando **Next.js (App Router)** y utiliza **Prisma ORM** junto a PostgreSQL para asegurar la integridad de la base de datos relacional. La seguridad y gestión de sesiones está delegada en **Clerk**, garantizando que únicamente usuarios autenticados y vinculados a una compra puedan emitir una reseña, y previniendo la suplantación de identidad al extraer los tokens directamente desde el servidor.

Adicionalmente, el sistema contempla integraciones inter-aplicaciones, consumiendo mediante APIs REST el estado de las órdenes desde la *Buyer App* y exponiendo sus propios endpoints de lectura para que otras aplicaciones (como el Catálogo) puedan mostrar los promedios de estrellas y la distribución de calificaciones en tiempo real.

## Tecnologías extra usadas
- Supabase para el proveedor de BBDD
- Lucide para los iconos
- Vercel Blob como bucket para las imagenes

## Variables de entorno
Dentro de .env.example se pueden encontrar las distintas variables de entorno necesarias para el funcionamiento de la app:

# Url de la BBDD que usará
- DATABASE_URL="postgresql://usuario:password@localhost:5432/feedback_db"

# Tokens de Clerk
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
- CLERK_SECRET_KEY=sk_test_...

# Si es que usamos el mock de los datos de buyer o si agarramos sus datos "reales"
- USE_MOCKS="true"
- BUYER_APP_URL="http://localhost:3001"

# IDs de cada usuario de prueba (usado para el seeding de la BBDD)
- CLERK_BUYER_ID="user_..."
- CLERK_SELLER_ID="user_..."
- CLERK_MODERATOR_ID="user_..."