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

const CLERK_BUYER_ID = process.env.CLERK_BUYER_ID || 'user_mock_buyer';
const CLERK_SELLER_ID = process.env.CLERK_SELLER_ID || 'user_mock_seller';

const MOCKED_ORDERS_DB: Order[] = [
  {
    id_orden: "orden_1001", id_comprador: CLERK_BUYER_ID, id_vendedor: CLERK_SELLER_ID, nombre_vendedor: "Seller Evaluador",
    items: [{ id_producto: "prod_chanel_5", nombre_producto: "Chanel No. 5", imagen: "https://placehold.co/150x150?text=Chanel+No.5" }],
    fecha_compra: "2026-05-10T14:00:00Z"
  },
  {
    id_orden: "orden_1002", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_aromas_vip", nombre_vendedor: "Aromas VIP",
    items: [{ id_producto: "prod_dior_sauvage", nombre_producto: "Dior Sauvage", imagen: "https://placehold.co/150x150?text=Dior+Sauvage" }],
    fecha_compra: "2026-05-12T10:30:00Z"
  },
  {
    id_orden: "orden_1003", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_esencias", nombre_vendedor: "Esencias Puras",
    items: [{ id_producto: "prod_armani_code", nombre_producto: "Armani Code", imagen: "https://placehold.co/150x150?text=Armani+Code" }],
    fecha_compra: "2026-05-15T09:15:00Z"
  },
  {
    id_orden: "orden_1004", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_fragancias_mundo", nombre_vendedor: "Fragancias del Mundo",
    items: [{ id_producto: "prod_paco_invictus", nombre_producto: "Paco Rabanne Invictus", imagen: "https://placehold.co/150x150?text=Invictus" }],
    fecha_compra: "2026-05-18T16:45:00Z"
  },
  {
    id_orden: "orden_1005", id_comprador: CLERK_BUYER_ID, id_vendedor: CLERK_SELLER_ID, nombre_vendedor: "Seller Evaluador",
    items: [{ id_producto: "prod_carolina_good_girl", nombre_producto: "Carolina Herrera Good Girl", imagen: "https://placehold.co/150x150?text=Good+Girl" }],
    fecha_compra: "2026-05-20T11:20:00Z"
  },
  {
    id_orden: "orden_1006", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_aromas_vip", nombre_vendedor: "Aromas VIP",
    items: [{ id_producto: "prod_ysl_libre", nombre_producto: "YSL Libre", imagen: "https://placehold.co/150x150?text=YSL+Libre" }],
    fecha_compra: "2026-05-21T14:10:00Z"
  },
  {
    id_orden: "orden_1007", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_esencias", nombre_vendedor: "Esencias Puras",
    items: [{ id_producto: "prod_hugo_boss", nombre_producto: "Hugo Boss Bottled", imagen: "https://placehold.co/150x150?text=Hugo+Boss" }],
    fecha_compra: "2026-05-22T08:05:00Z"
  },
  {
    id_orden: "orden_1008", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_fragancias_mundo", nombre_vendedor: "Fragancias del Mundo",
    items: [{ id_producto: "prod_versace_eros", nombre_producto: "Versace Eros", imagen: "https://placehold.co/150x150?text=Versace+Eros" }],
    fecha_compra: "2026-05-23T19:30:00Z"
  },
  {
    id_orden: "orden_1009", id_comprador: CLERK_BUYER_ID, id_vendedor: CLERK_SELLER_ID, nombre_vendedor: "Seller Evaluador",
    items: [{ id_producto: "prod_creed_aventus", nombre_producto: "Creed Aventus", imagen: "https://placehold.co/150x150?text=Creed+Aventus" }],
    fecha_compra: "2026-05-24T12:00:00Z"
  },
  {
    id_orden: "orden_1010", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_aromas_vip", nombre_vendedor: "Aromas VIP",
    items: [{ id_producto: "prod_tom_ford", nombre_producto: "Tom Ford Black Orchid", imagen: "https://placehold.co/150x150?text=Tom+Ford" }],
    fecha_compra: "2026-05-25T15:45:00Z"
  },
  
  // Órdenes nuevas para quedar PENDIENTES de reseña (No serán seedeables en seed.ts)
  {
    id_orden: "orden_9001", id_comprador: CLERK_BUYER_ID, id_vendedor: CLERK_SELLER_ID, nombre_vendedor: "Seller Evaluador",
    items: [{ id_producto: "prod_calvin_klein_one", nombre_producto: "Calvin Klein CK One", imagen: "https://placehold.co/150x150?text=CK+One" }],
    fecha_compra: "2026-05-26T10:00:00Z"
  },
  {
    id_orden: "orden_9002", id_comprador: CLERK_BUYER_ID, id_vendedor: CLERK_SELLER_ID, nombre_vendedor: "Seller Evaluador",
    items: [{ id_producto: "prod_terre_hermes", nombre_producto: "Terre d'Hermès", imagen: "https://placehold.co/150x150?text=Terre+d+Hermes" }],
    fecha_compra: "2026-05-27T11:00:00Z"
  },
  {
    id_orden: "orden_9003", id_comprador: CLERK_BUYER_ID, id_vendedor: "seller_aromas_vip", nombre_vendedor: "Aromas VIP",
    items: [{ id_producto: "prod_narciso_rodriguez", nombre_producto: "Narciso Rodriguez For Her", imagen: "https://placehold.co/150x150?text=Narciso+Rodriguez" }],
    fecha_compra: "2026-05-28T12:00:00Z"
  },
  
  // 5 Compras asignadas a otro usuario para que Seller Evaluador no tenga compras
  {
    id_orden: "orden_1011", id_comprador: "user_seed_2", id_vendedor: "seller_esencias", nombre_vendedor: "Esencias Puras",
    items: [{ id_producto: "prod_bleu_chanel", nombre_producto: "Bleu de Chanel", imagen: "https://placehold.co/150x150?text=Bleu+de+Chanel" }],
    fecha_compra: "2026-05-26T09:20:00Z"
  },
  {
    id_orden: "orden_1012", id_comprador: "user_seed_2", id_vendedor: "seller_fragancias_mundo", nombre_vendedor: "Fragancias del Mundo",
    items: [{ id_producto: "prod_acqua_gio", nombre_producto: "Acqua di Gio", imagen: "https://placehold.co/150x150?text=Acqua+di+Gio" }],
    fecha_compra: "2026-05-27T17:15:00Z"
  },
  {
    id_orden: "orden_1013", id_comprador: "user_seed_2", id_vendedor: "seller_aromas_vip", nombre_vendedor: "Aromas VIP",
    items: [{ id_producto: "prod_le_male", nombre_producto: "Jean Paul Gaultier Le Male", imagen: "https://placehold.co/150x150?text=Le+Male" }],
    fecha_compra: "2026-05-28T10:00:00Z"
  },
  {
    id_orden: "orden_1014", id_comprador: "user_seed_2", id_vendedor: "seller_aromas_vip", nombre_vendedor: "Aromas VIP",
    items: [{ id_producto: "prod_one_million", nombre_producto: "1 Million Paco Rabanne", imagen: "https://placehold.co/150x150?text=1+Million" }],
    fecha_compra: "2026-05-29T14:30:00Z"
  },
  {
    id_orden: "orden_1015", id_comprador: "user_seed_2", id_vendedor: "seller_esencias", nombre_vendedor: "Esencias Puras",
    items: [{ id_producto: "prod_light_blue", nombre_producto: "Dolce & Gabbana Light Blue", imagen: "https://placehold.co/150x150?text=Light+Blue" }],
    fecha_compra: "2026-05-30T11:45:00Z"
  }
];


// Exportamos las constantes para usarlas en otros mocks si es necesario
export { CLERK_BUYER_ID, CLERK_SELLER_ID, MOCKED_ORDERS_DB };

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
    // Filtramos las órdenes mockeadas para que solo se devuelvan las que le pertenecen al comprador actual.
    return MOCKED_ORDERS_DB.filter((o) => o.id_comprador === id_comprador);
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
