// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Configura el transporte de correo.
 * Usa Gmail como ejemplo (recomendado: APP PASSWORD).
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Ruta para recibir el reporte diario y enviarlo por correo
app.post("/api/enviar-reporte-diario", async (req, res) => {
  const reporte = req.body;

  try {
    const folioStr = String(reporte.folio).padStart(3, "0");
    const asunto = `Reporte de ventas ${folioStr} - ${reporte.fechaTexto}`;

    let cuerpo = `Reporte diario de ventas Della Panthera\n\n`;
    cuerpo += `Folio: ${folioStr}\n`;
    cuerpo += `Fecha: ${reporte.fechaTexto}\n\n`;
    cuerpo += `Detalle de ventas:\n\n`;

    (reporte.productos || []).forEach((p) => {
      cuerpo += `• ${p.nombre} - Cant: ${p.cantidad} - Total: $${p.total}\n`;
    });

    cuerpo += `\nTOTAL DEL DÍA: $${reporte.totalDia}\n`;

    await transporter.sendMail({
      from: `"Della Panthera POS" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO, // Correo de destino definido en .env
      subject: asunto,
      text: cuerpo,
    });

    console.log("Reporte enviado por correo correctamente.");
    res.json({ ok: true });
  } catch (error) {
    console.error("Error enviando correo:", error);
    res.status(500).json({ ok: false, error: "No se pudo enviar el correo" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor POS escuchando en http://localhost:${PORT}`);
});
