export interface OrderItem {
  id_producto: string;
  nombre_producto: string;
  imagen: string;
}

export interface Order {
  id_orden: string;
  id_vendedor: string;
  nombre_vendedor: string;
  fecha_compra: string;
  items: OrderItem[];
}

export interface Resena {
  idResena: string;
  idProducto?: string;
  idOrden: string;
  calificacion: number;
  comentario: string | null;
  tipoResena: "PRODUCTO" | "VENDEDOR";
  imagenes?: { idImagen: string, url: string }[];
}
