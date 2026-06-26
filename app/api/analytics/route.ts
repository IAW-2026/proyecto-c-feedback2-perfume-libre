import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 

export async function GET(request: Request) {
  const apiKey = request.headers.get("api_key");
  if (apiKey !== process.env.FEEDBACK_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const daysParam = searchParams.get("days") || "90";
    const days = parseInt(daysParam, 10);
    
    let dateFilter = {};
    if (days > 0) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - days);
      dateFilter = { createdAt: { gte: pastDate } };
    }

    const totalResenas = await db.resena.count({
      where: { estado: { in: ["PUBLICA", "OCULTA"] }, ...dateFilter }
    });

    // Promedio global y distribución
    const resenas = await db.resena.findMany({
      where: { estado: { in: ["PUBLICA", "OCULTA"] }, ...dateFilter },
      select: { calificacion: true, tipoResena: true }
    });

    let sumProduct = 0;
    let countProduct = 0;
    let sumSeller = 0;
    let countSeller = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    resenas.forEach(r => {
      distribution[r.calificacion as keyof typeof distribution] += 1;
      if (r.tipoResena === "PRODUCTO") {
        sumProduct += r.calificacion;
        countProduct++;
      } else if (r.tipoResena === "VENDEDOR") {
        sumSeller += r.calificacion;
        countSeller++;
      }
    });

    const avgProduct = countProduct > 0 ? (sumProduct / countProduct).toFixed(2) : 0;
    const avgSeller = countSeller > 0 ? (sumSeller / countSeller).toFixed(2) : 0;

    return NextResponse.json({
      totalReviews: totalResenas,
      averageProductRating: avgProduct,
      averageSellerRating: avgSeller,
      distribution
    });
  } catch (error) {
    console.error("Error en analytics API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
