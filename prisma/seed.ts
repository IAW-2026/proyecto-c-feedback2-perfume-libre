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

  // Identificadores de Clerk para los usuarios de prueba (Se pueden inyectar vía .env local)
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

  // Generar reseñas de productos
  let ordenCount = 1000;
  for (const prod of productos) {
    // 3 a 5 reseñas por producto
    const numResenas = Math.floor(Math.random() * 3) + 3;
    let sumaCalif = 0;

    for (let i = 0; i < numResenas; i++) {
      const calif = Math.random() > 0.3 ? (Math.floor(Math.random() * 2) + 4) : (Math.floor(Math.random() * 3) + 1);
      sumaCalif += calif;
      
      let comentario = "";
      if (calif >= 4) comentario = comentariosPositivos[Math.floor(Math.random() * comentariosPositivos.length)];
      else if (calif === 3) comentario = comentariosNeutros[Math.floor(Math.random() * comentariosNeutros.length)];
      else comentario = comentariosNegativos[Math.floor(Math.random() * comentariosNegativos.length)];

      await prisma.resena.create({
        data: {
          idOrden: `mock_order_${ordenCount++}`,
          idComprador: users[Math.floor(Math.random() * 6)].clerkUserId,
          tipoResena: TipoResena.PRODUCTO,
          idProducto: prod.id,
          calificacion: calif,
          comentario: comentario,
          estado: EstadoResena.PUBLICA,
        }
      });
    }

    await prisma.metricasProducto.upsert({
      where: { idProducto: prod.id },
      update: { promedioCalificacion: sumaCalif / numResenas, cantidadResenas: numResenas },
      create: { idProducto: prod.id, promedioCalificacion: sumaCalif / numResenas, cantidadResenas: numResenas }
    });
  }

  // Generar reseñas de vendedores
  for (const vend of vendedores) {
    const numResenas = Math.floor(Math.random() * 3) + 2;
    let sumaCalif = 0;

    for (let i = 0; i < numResenas; i++) {
      const calif = Math.floor(Math.random() * 3) + 3; // 3 a 5
      sumaCalif += calif;
      
      await prisma.resena.create({
        data: {
          idOrden: `mock_order_${ordenCount++}`,
          idComprador: users[Math.floor(Math.random() * 6)].clerkUserId,
          tipoResena: TipoResena.VENDEDOR,
          idVendedor: vend.id,
          calificacion: calif,
          comentario: calif >= 4 ? "Excelente atención y envío rápido." : "Tardó un poco en responder pero llegó bien.",
          estado: EstadoResena.PUBLICA,
        }
      });
    }

    await prisma.metricasVendedor.upsert({
      where: { idVendedor: vend.id },
      update: { promedioCalificacion: sumaCalif / numResenas, cantidadResenas: numResenas },
      create: { idVendedor: vend.id, promedioCalificacion: sumaCalif / numResenas, cantidadResenas: numResenas }
    });
  }

  // Reseña problemática y reporte
  const resenaMala = await prisma.resena.create({
    data: {
      idOrden: `mock_order_${ordenCount++}`,
      idComprador: users[0].clerkUserId,
      tipoResena: TipoResena.PRODUCTO,
      idProducto: "prod_chanel_5",
      calificacion: 1,
      comentario: "El vendedor es un estafador y este perfume es agua pintada. IDIOTA.",
      estado: EstadoResena.PUBLICA,
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
