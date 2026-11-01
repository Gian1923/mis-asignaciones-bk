import fs from 'fs';

// 1. Configuramos tus credenciales y tu identificador
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MI_LEGAJO = '91149';

// 2. Obtenemos la fecha de hoy en formato AAAA-MM-DD (Hora de Argentina)
// Usamos 'en-CA' porque Canadá formatea las fechas exactamente como YYYY-MM-DD
const hoyISO = new Date().toLocaleDateString('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires'
});

console.log(`🔎 Buscando planilla para la fecha: ${hoyISO}...`);

// 3. Leemos el archivo JSON de horarios
const textoArchivo = fs.readFileSync('./src/horariosPublicados.json', 'utf-8');
const datos = JSON.parse(textoArchivo);

// 4. Buscamos la planilla que coincida con el día de hoy
const planillaHoy = datos.planillas.find(p => p.fechaISO === hoyISO);

let mensaje = '';

if (!planillaHoy) {
  mensaje = `⚠️ Hola Gian! Revisé el sistema pero todavía no está cargada la planilla para hoy (${hoyISO}).`;
} else {
  // Buscamos tu legajo adentro de las asignaciones del día
  const miTurno = planillaHoy.asignaciones.find(a => a.legajo === MI_LEGAJO);

  if (miTurno && miTurno.trabaja.toLowerCase() === 'si') {
    mensaje = `🍔 ¡Hola Gian! Hoy (${planillaHoy.fechaEtiqueta}) te toca laburar.\n\n⏰ Entrada: ${miTurno.horaEntrada} hs\n🏁 Salida: ${miTurno.horaSalida} hs`;
  } else {
    mensaje = `🎉 ¡Hola Gian! Hoy (${planillaHoy.fechaEtiqueta}) tenés franco. ¡A descansar o meterle al estudio!`;
  }
}

// 5. Enviamos el resultado a Telegram
const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(mensaje)}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log('✅ Notificación enviada con éxito:\n', mensaje);
    } else {
      console.log('❌ Error de Telegram:', data);
    }
  })
  .catch(err => console.error('Error de red:', err));