import { z } from "zod";

export const crearResenaSchema = z.object({
  id_usuario: z.string().optional(),
  id_producto: z.string().optional(),
  id_vendedor: z.string().optional(),
  puntuacion: z.number().int().min(1, "La puntuación debe ser mínimo 1").max(5, "La puntuación debe ser máximo 5"),
  comentario: z.string().optional(),
  id_orden: z.string().min(1, "El id de la orden es obligatorio"),
  imagenes: z.array(z.string().url("URL de imagen inválida")).optional(),
}).refine(data => {
  // Regla de negocio: Si puntaje < 3, comentario obligatorio
  if (data.puntuacion < 3 && (!data.comentario || data.comentario.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "El comentario es obligatorio para calificaciones menores a 3 estrellas",
  path: ["comentario"]
}).refine(data => {
  if (!data.id_producto && !data.id_vendedor) {
    return false;
  }
  return true;
}, {
  message: "Debe especificar id_producto o id_vendedor",
  path: ["id_producto"]
});

export const actualizarResenaSchema = z.object({
  id_usuario: z.string().optional(),
  id_resena: z.string().min(1, "El id de la reseña es obligatorio"),
  puntuacion: z.number().int().min(1, "La puntuación debe ser mínimo 1").max(5, "La puntuación debe ser máximo 5"),
  comentario: z.string().optional(),
  imagenes: z.array(z.string().url("URL de imagen inválida")).optional(),
  imagenesEliminar: z.array(z.string().url("URL de imagen inválida")).optional(),
}).refine(data => {
  if (data.puntuacion < 3 && (!data.comentario || data.comentario.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "El comentario es obligatorio para calificaciones menores a 3 estrellas",
  path: ["comentario"]
});

export const crearReporteSchema = z.object({
  idResena: z.string().min(1, "El id de la reseña es obligatorio"),
  motivo: z.enum(["INAPROPIADO", "FALSO_NO_APLICA"], {
    message: "Motivo de reporte inválido"
  }),
  archivos: z.array(z.string().url("URL de archivo inválida")).optional()
});

export const moderarReporteSchema = z.object({
  idReporte: z.string().min(1, "El id del reporte es obligatorio"),
  decision: z.enum(["RECHAZAR", "OCULTAR", "ELIMINAR"], {
    message: "Decisión de moderación inválida"
  }),
  motivoAdmin: z.string().optional()
});
