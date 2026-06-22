export interface ResenaDB {
  idResena: string;
  calificacion: number;
  comentario: string | null;
  createdAt: string;
  imagenes?: { idImagen: string; url: string }[];
}

export interface ReviewBundle {
  idResenaBundle: string;
  productoInfo: {
    nombre_producto: string;
    imagen: string;
  };
  resenaProducto: ResenaDB | null;
  resenaVendedor: ResenaDB | null;
}

export type SortKey = 'nombre' | 'vendedor' | 'producto' | 'fecha';
export type SortDirection = 'asc' | 'desc';
