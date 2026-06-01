export interface OrderItem {
  id_producto: string;
  nombre_producto: string;
  imagen: string;
}

export interface Order {
  id_orden: string;
  id_comprador: string;
  id_vendedor: string;
  nombre_vendedor: string;
  items: OrderItem[];
  fecha_compra: string;
}

const MOCKED_ORDERS_DB: Order[] = [
  {
    id_orden: "orden_1001",
    id_comprador: "user_1_comprador_frecuente",
    id_vendedor: "seller_deportes_total",
    nombre_vendedor: "Deportes Total",
    items: [
      {
        id_producto: "prod_zapatillas_nike",
        nombre_producto: "Zapatillas Nike Air",
        imagen: "https://placehold.co/150x150?text=Zapatillas"
      }
    ],
    fecha_compra: "2026-05-10T14:00:00Z"
  },
  {
    id_orden: "orden_1002",
    id_comprador: "user_2_comprador_ocasional",
    id_vendedor: "seller_electronica_ya",
    nombre_vendedor: "Electrónica Ya",
    items: [
      {
        id_producto: "prod_reloj_casio",
        nombre_producto: "Reloj Casio Vintage",
        imagen: "https://placehold.co/150x150?text=Reloj"
      }
    ],
    fecha_compra: "2026-05-15T10:30:00Z"
  },
  {
    id_orden: "orden_1003",
    id_comprador: "user_1_comprador_frecuente",
    id_vendedor: "seller_electronica_ya",
    nombre_vendedor: "Electrónica Ya",
    items: [
      {
        id_producto: "prod_auriculares_sony",
        nombre_producto: "Auriculares Sony WH-1000XM4",
        imagen: "https://placehold.co/150x150?text=Auriculares"
      }
    ],
    fecha_compra: "2026-05-20T09:15:00Z"
  }
];


// Verifica que el usuario si compró esto para ver si puede darle una reseña o no
export async function verificarCompra(
  id_orden: string,
  id_comprador: string,
  id_producto?: string,
  id_vendedor?: string
): Promise<boolean> {
  const useMocks = process.env.USE_MOCKS !== "false";

  if (useMocks) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const orden = MOCKED_ORDERS_DB.find((o) => o.id_orden === id_orden);

    if (!orden) return false;
    // En modo mock, asumimos que cualquier usuario que prueba la app es el dueño de la orden
    if (id_vendedor && orden.id_vendedor !== id_vendedor) return false;
    if (id_producto && !orden.items.some((i) => i.id_producto === id_producto)) return false;

    return true;
  }

  // --- IMPLEMENTACIÓN REAL ---
  try {
    const BUYER_APP_URL = process.env.BUYER_APP_URL || "http://localhost:3001";
    
    const response = await fetch(`${BUYER_APP_URL}/api/ordenes/${id_orden}`, {
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) return false;

    const orden = await response.json();
    
    if (orden.id_comprador !== id_comprador) return false;
    if (id_producto && !orden.items.some((i: any) => i.id_producto === id_producto)) return false;

    return true;
  } catch (error) {
    console.error("Error verificando compra en la API real:", error);
    return false;
  }
}


// Obtiene todas las compras del comprador actual para popular la lista de productos a reseñar
export async function obtenerOrdenesDelComprador(id_comprador: string): Promise<Order[]> {
  const useMocks = process.env.USE_MOCKS !== "false";

  if (useMocks) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // En modo mock, le pasamos todas las órdenes de prueba al usuario actual
    // simulando que él las compró, para que pueda probar la app sin problemas.
    return MOCKED_ORDERS_DB.map((o) => ({
      ...o,
      id_comprador: id_comprador,
    }));
  }

  // --- IMPLEMENTACIÓN REAL ---
  try {
    const BUYER_APP_URL = process.env.BUYER_APP_URL || "http://localhost:3001";
    const response = await fetch(`${BUYER_APP_URL}/api/compras/me/entregadas?sin_resena=true`, {
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo órdenes en la API real:", error);
    return [];
  }
}
