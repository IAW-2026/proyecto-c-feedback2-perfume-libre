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

  const comprador1 = await prisma.usuarioLocal.upsert({
    where: { clerkUserId: 'user_1_comprador_frecuente' },
    update: {},
    create: {
      clerkUserId: 'user_1_comprador_frecuente',
      email: 'comprador1@example.com',
      nombre: 'Juan Comprador',
    },
  });

  const comprador2 = await prisma.usuarioLocal.upsert({
    where: { clerkUserId: 'user_2_comprador_ocasional' },
    update: {},
    create: {
      clerkUserId: 'user_2_comprador_ocasional',
      email: 'comprador2@example.com',
      nombre: 'María Compradora',
    },
  });

  const denunciante = await prisma.usuarioLocal.upsert({
    where: { clerkUserId: 'user_3_denunciante' },
    update: {},
    create: {
      clerkUserId: 'user_3_denunciante',
      email: 'denunciante@example.com',
      nombre: 'Carlos Denunciante',
    },
  });

  const admin = await prisma.usuarioLocal.upsert({
    where: { clerkUserId: 'user_4_admin' },
    update: {},
    create: {
      clerkUserId: 'user_4_admin',
      email: 'admin@example.com',
      nombre: 'Super Admin',
    },
  });

  // Reseña 1: Excelente reseña de producto
  const resenaProducto1 = await prisma.resena.create({
    data: {
      idOrden: 'orden_1001',
      idComprador: comprador1.clerkUserId,
      tipoResena: TipoResena.PRODUCTO,
      idProducto: 'prod_zapatillas_nike',
      calificacion: 5,
      comentario: 'Excelentes zapatillas, muy cómodas y llegaron rápido.',
      estado: EstadoResena.PUBLICA,
      imagenes: {
        create: [
          { url: 'https://placehold.co/800x600?text=Zapatillas1' },
        ],
      },
    },
  });

  // Reseña 2: Mala reseña de vendedor
  const resenaVendedor1 = await prisma.resena.create({
    data: {
      idOrden: 'orden_1001',
      idComprador: comprador1.clerkUserId,
      tipoResena: TipoResena.VENDEDOR,
      idVendedor: 'seller_deportes_total',
      calificacion: 2,
      comentario: 'El vendedor tardó mucho en despachar el producto. No lo recomiendo.',
      estado: EstadoResena.PUBLICA,
    },
  });

  // Reseña 3: Reseña inapropiada (Para generar un reporte)
  const resenaOfensiva = await prisma.resena.create({
    data: {
      idOrden: 'orden_1002',
      idComprador: comprador2.clerkUserId,
      tipoResena: TipoResena.PRODUCTO,
      idProducto: 'prod_reloj_casio',
      calificacion: 1,
      comentario: 'Este producto es una completa estafa y el vendedor es un IDIOTA. Peor compra de mi vida.',
      estado: EstadoResena.PUBLICA, // Inicia pública hasta ser moderada
    },
  });

  // Reseña 4: Reseña que será eliminada
  const resenaEliminada = await prisma.resena.create({
    data: {
      idOrden: 'orden_1003',
      idComprador: comprador1.clerkUserId,
      tipoResena: TipoResena.VENDEDOR,
      idVendedor: 'seller_electronica_ya',
      calificacion: 1,
      comentario: 'Comentario falso que ya fue moderado.',
      estado: EstadoResena.ELIMINADA,
    },
  });

  // Reporte de la reseña ofensiva
  const reporte1 = await prisma.reporteResena.create({
    data: {
      idResena: resenaOfensiva.idResena,
      motivo: MotivoReporte.INAPROPIADO,
      idDenunciante: denunciante.clerkUserId,
    },
  });

  // Moderación sobre una reseña falsa previa
  const reporte2 = await prisma.reporteResena.create({
    data: {
      idResena: resenaEliminada.idResena,
      motivo: MotivoReporte.FALSO_NO_APLICA,
      idDenunciante: denunciante.clerkUserId,
      archivos: {
        create: [
          { url: 'https://placehold.co/800x600?text=Falso' },
        ],
      },
      moderaciones: {
        create: [
          {
            decision: DecisionModeracion.ELIMINAR,
            idModerador: admin.clerkUserId,
            motivoAdmin: 'Se comprobó mediante el chat interno que la reseña era un intento de extorsión.',
          },
        ],
      },
    },
  });

  // Métricas Iniciales (Cálculos pre-generados)
  await prisma.metricasProducto.upsert({
    where: { idProducto: 'prod_zapatillas_nike' },
    update: {},
    create: {
      idProducto: 'prod_zapatillas_nike',
      promedioCalificacion: 5.0,
      cantidadResenas: 1,
    },
  });

  await prisma.metricasProducto.upsert({
    where: { idProducto: 'prod_reloj_casio' },
    update: {},
    create: {
      idProducto: 'prod_reloj_casio',
      promedioCalificacion: 1.0, // Solo la ofensiva cuenta hasta que se oculte/elimine
      cantidadResenas: 1,
    },
  });

  await prisma.metricasVendedor.upsert({
    where: { idVendedor: 'seller_deportes_total' },
    update: {},
    create: {
      idVendedor: 'seller_deportes_total',
      promedioCalificacion: 2.0,
      cantidadResenas: 1,
    },
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
