import { PrismaClient, TipoResena, EstadoResena, MotivoReporte, DecisionModeracion } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("La variable de entorno DATABASE_URL no está definida.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando el seed de la base de datos...');

  // Identificadores de Clerk para los usuarios de prueba
  const CLERK_BUYER_ID = process.env.CLERK_BUYER_ID || 'user_seed_buyer';
  const CLERK_SELLER_ID = process.env.CLERK_SELLER_ID || 'user_seed_seller';
  const CLERK_MODERATOR_ID = process.env.CLERK_MODERATOR_ID || 'user_admin';

  // Usuarios Base
  const users = [
    { clerkUserId: CLERK_BUYER_ID, email: 'buyer+clerktest@iaw.com', nombre: 'Buyer Evaluador' },
    { clerkUserId: 'user_seed_2', email: 'comprador2@test.com', nombre: 'Laura Gomez' },
    { clerkUserId: 'user_seed_3', email: 'comprador3@test.com', nombre: 'Esteban Quito' },
    { clerkUserId: 'user_seed_4', email: 'comprador4@test.com', nombre: 'Valeria Luna' },
    { clerkUserId: 'user_seed_5', email: 'comprador5@test.com', nombre: 'Carlos Perez' },
    { clerkUserId: 'user_seed_6', email: 'comprador6@test.com', nombre: 'Lucía Torres' },
    { clerkUserId: CLERK_MODERATOR_ID, email: 'moderator+clerktest@iaw.com', nombre: 'Moderador Principal' },
    { clerkUserId: CLERK_SELLER_ID, email: 'seller+clerktest@iaw.com', nombre: 'Seller Evaluador' },
  ];

  for (const u of users) {
    await prisma.usuarioLocal.upsert({
      where: { clerkUserId: u.clerkUserId },
      update: {},
      create: u,
    });
  }

  // Lista de Productos (Perfumes)
  const productos = [
    { id: "prod_chanel_5", nombre: "Chanel No. 5" },
    { id: "prod_dior_sauvage", nombre: "Dior Sauvage" },
    { id: "prod_armani_code", nombre: "Armani Code" },
    { id: "prod_paco_invictus", nombre: "Paco Rabanne Invictus" },
    { id: "prod_carolina_good_girl", nombre: "Carolina Herrera Good Girl" },
    { id: "prod_ysl_libre", nombre: "YSL Libre" },
    { id: "prod_hugo_boss", nombre: "Hugo Boss Bottled" },
    { id: "prod_versace_eros", nombre: "Versace Eros" },
  ];

  // Lista de Vendedores
  const vendedores = [
    { id: CLERK_SELLER_ID, nombre: "Seller Evaluador (Cuenta Real)" },
    { id: "seller_aromas_vip", nombre: "Aromas VIP" },
    { id: "seller_esencias", nombre: "Esencias Puras" },
    { id: "seller_fragancias_mundo", nombre: "Fragancias del Mundo" },
  ];

  const comentariosPositivos = [
    "Excelente fragancia, muy duradera.",
    "Llegó en perfecto estado, original 100%.",
    "Aroma increíble, mi favorito sin duda.",
    "Lo compré para regalo y le encantó.",
    "Muy buen precio para la calidad que tiene."
  ];

  const comentariosNeutros = [
    "El aroma es rico pero no dura tanto en mi piel.",
    "Está bien, pero esperaba algo distinto.",
    "Relación calidad-precio aceptable."
  ];

  const comentariosNegativos = [
    "No me gustó para nada, me da dolor de cabeza.",
    "Parece una réplica, la fijación es nula.",
    "Pésimo producto, no lo recomiendo."
  ];

  const { MOCKED_ORDERS_DB } = require("../lib/services/orders");

  // Generar reseñas emparejadas basadas en las órdenes mockeadas
  for (const orden of MOCKED_ORDERS_DB) {
    if (orden.id_orden === 'orden_1001' || orden.id_orden === 'orden_1002' || orden.id_orden.startsWith('orden_9')) {
      continue;
    }
    const califProd = Math.floor(Math.random() * 3) + 3; // 3 a 5
    const califVend = Math.floor(Math.random() * 3) + 3; // 3 a 5
    
    // Crear reseña producto
    await prisma.resena.create({
      data: {
        idOrden: orden.id_orden,
        idComprador: orden.id_comprador,
        tipoResena: TipoResena.PRODUCTO,
        idProducto: orden.items[0].id_producto,
        calificacion: califProd,
        comentario: califProd >= 4 ? "Excelente producto, aroma duradero." : "El aroma es rico pero no dura mucho.",
        estado: EstadoResena.PUBLICA,
      }
    });

    // Actualizar métricas producto (acumulamos en DB simplificado)
    const metricasProd = await prisma.resena.aggregate({
      where: { idProducto: orden.items[0].id_producto, tipoResena: TipoResena.PRODUCTO },
      _avg: { calificacion: true },
      _count: { _all: true }
    });
    
    await prisma.metricasProducto.upsert({
      where: { idProducto: orden.items[0].id_producto },
      update: { 
        promedioCalificacion: metricasProd._avg.calificacion || califProd, 
        cantidadResenas: metricasProd._count._all || 1
      },
      create: { 
        idProducto: orden.items[0].id_producto, 
        promedioCalificacion: califProd, 
        cantidadResenas: 1 
      }
    });

    // Crear reseña vendedor
    await prisma.resena.create({
      data: {
        idOrden: orden.id_orden,
        idComprador: orden.id_comprador,
        tipoResena: TipoResena.VENDEDOR,
        idVendedor: orden.id_vendedor,
        calificacion: califVend,
        comentario: califVend >= 4 ? "Vendedor rápido y confiable." : "Tardó un poco el envío.",
        estado: EstadoResena.PUBLICA,
      }
    });

    // Actualizar métricas vendedor
    const metricasVend = await prisma.resena.aggregate({
      where: { idVendedor: orden.id_vendedor, tipoResena: TipoResena.VENDEDOR },
      _avg: { calificacion: true },
      _count: { _all: true }
    });
    
    await prisma.metricasVendedor.upsert({
      where: { idVendedor: orden.id_vendedor },
      update: { 
        promedioCalificacion: metricasVend._avg.calificacion || califVend, 
        cantidadResenas: metricasVend._count._all || 1
      },
      create: { 
        idVendedor: orden.id_vendedor, 
        promedioCalificacion: califVend, 
        cantidadResenas: 1 
      }
    });
  }

  // 3. Crear reseñas ficticias realistas usando los IDs de clerk
  console.log("Creando reseñas de prueba...");
  
  // Reseña positiva (Producto)
  await prisma.resena.upsert({
    where: {
      idOrden_idComprador_tipoResena: {
        idOrden: 'orden_1001',
        idComprador: CLERK_BUYER_ID,
        tipoResena: 'PRODUCTO'
      }
    },
    update: {},
    create: {
      idResena: 'resena_seed_1',
      idOrden: 'orden_1001',
      idComprador: CLERK_BUYER_ID,
      tipoResena: 'PRODUCTO',
      idProducto: 'prod_chanel_5',
      calificacion: 5,
      comentario: 'Excelente perfume, me encantó. Llegó en perfectas condiciones.',
      estado: 'PUBLICA',
      imagenes: {
        create: [
          { url: 'https://placehold.co/300x300/e0f2fe/0369a1?text=Caja+Chanel' },
          { url: 'https://placehold.co/300x300/fce7f3/be185d?text=Frasco+Abierto' }
        ]
      }
    }
  });

  // Reseña positiva (Vendedor - par de la orden_seed_1)
  await prisma.resena.upsert({
    where: {
      idOrden_idComprador_tipoResena: {
        idOrden: 'orden_1001',
        idComprador: CLERK_BUYER_ID,
        tipoResena: 'VENDEDOR'
      }
    },
    update: {},
    create: {
      idResena: 'resena_seed_v1',
      idOrden: 'orden_1001',
      idComprador: CLERK_BUYER_ID,
      tipoResena: 'VENDEDOR',
      idVendedor: CLERK_SELLER_ID,
      calificacion: 5,
      comentario: 'El vendedor despachó rapidísimo.',
      estado: 'PUBLICA'
    }
  });

  // Reseña negativa para que el administrador la vea
  const resenaMala = await prisma.resena.upsert({
    where: {
      idOrden_idComprador_tipoResena: {
        idOrden: 'orden_1002',
        idComprador: CLERK_BUYER_ID,
        tipoResena: 'PRODUCTO'
      }
    },
    update: {},
    create: {
      idResena: 'resena_seed_2',
      idOrden: 'orden_1002',
      idComprador: CLERK_BUYER_ID,
      tipoResena: 'PRODUCTO',
      idProducto: 'prod_dior_sauvage',
      calificacion: 2,
      comentario: 'El perfume parece falso, el olor no dura nada y la caja venía abollada. Un desastre total!!!! Estafador!!!',
      estado: 'PUBLICA',
      imagenes: {
        create: [
          { url: 'https://placehold.co/300x300/fef2f2/b91c1c?text=Caja+Abollada' }
        ]
      }
    }
  });

  // Reseña negativa (Vendedor - par de la orden_seed_2)
  await prisma.resena.upsert({
    where: {
      idOrden_idComprador_tipoResena: {
        idOrden: 'orden_1002',
        idComprador: CLERK_BUYER_ID,
        tipoResena: 'VENDEDOR'
      }
    },
    update: {},
    create: {
      idResena: 'resena_seed_v2',
      idOrden: 'orden_1002',
      idComprador: CLERK_BUYER_ID,
      tipoResena: 'VENDEDOR',
      idVendedor: 'seller_aromas_vip',
      calificacion: 1,
      comentario: 'Estafador, me mandó algo falso.',
      estado: 'PUBLICA'
    }
  });

  await prisma.reporteResena.create({
    data: {
      idResena: resenaMala.idResena,
      motivo: MotivoReporte.INAPROPIADO,
      idDenunciante: users[1].clerkUserId,
    }
  });

  console.log('Seed completado con éxito. Base de datos poblada.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
