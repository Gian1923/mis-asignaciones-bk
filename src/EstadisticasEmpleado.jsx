import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { parseISO, isAfter, startOfDay } from 'date-fns';

// ============================================================================
// 💰 CONFIGURACIÓN DE SUELDO (Actualizalo acá arriba cuando haya aumentos)
// Datos calibrados según Recibo 1Q Octubre 2026
// ============================================================================

// 1. Valores Oficiales de Recibo
const VALOR_HORA_NORMAL = 6443.12;        // Hora Normal base en recibo
const ADICIONAL_NO_REM_POR_HORA = 514.93; // Proporcional Asignación No Remunerativa ($29618.96 / 57.52 hs)
const PORCENTAJE_NETO = 0.7946;           // Te queda en mano el 79.46% (20.54% de descuentos totales)

// 2. Fórmula General (Para compañeros en Vercel: Hora Normal + No Remunerativo)
const VALOR_HORA_BRUTO_GENERAL = VALOR_HORA_NORMAL + ADICIONAL_NO_REM_POR_HORA; // ~$6,958.05 brutos

// 3. Fórmula Privada Gian (Solo visible en localhost: suma 8% Antigüedad + Nocturnidad Art. 200 y Art. 54)
const VALOR_HORA_BRUTO_GIAN = 8885.00; // Rinde ~$7,060 netos en mano por hora trabajada

export default function EstadisticasEmpleado({ quincenaActivaObj, resumenQuincenasEmpleado = [] }) {
  if (!quincenaActivaObj) return null;

  // Detectamos automáticamente si estás en tu PC (localhost) o en la web pública de Vercel
  const esLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const hoy = startOfDay(new Date());

  let horasCumplidas = 0;
  let horasPendientes = 0;

  // 1. Separamos los turnos de la quincena seleccionada entre Cumplidas (hoy o antes) y Pendientes (futuras)
  (quincenaActivaObj.turnos || []).forEach((t) => {
    const hs = parseFloat(t.horas) || 0;
    try {
      const fechaTurno = parseISO(t.fechaISO);
      if (isAfter(fechaTurno, hoy)) {
        horasPendientes += hs;
      } else {
        horasCumplidas += hs;
      }
    } catch {
      horasCumplidas += hs;
    }
  });

  horasCumplidas = Number(horasCumplidas.toFixed(2));
  horasPendientes = Number(horasPendientes.toFixed(2));
  const totalHoras = Number((horasCumplidas + horasPendientes).toFixed(2));

  // 2. Cálculos de Sueldo Neto Estimado
  const sueldoNetoGeneral = totalHoras * VALOR_HORA_BRUTO_GENERAL * PORCENTAJE_NETO;
  const sueldoNetoGian = totalHoras * VALOR_HORA_BRUTO_GIAN * PORCENTAJE_NETO;

  // 3. Datos para Gráfico 1: Barra Apilada (2 tonos de azul)
  const datosBarraActual = [
    {
      name: quincenaActivaObj.esPrimera ? '1° Quincena' : '2° Quincena',
      Cumplidas: horasCumplidas,
      Pendientes: horasPendientes,
    }
  ];

  // 4. Datos para Gráfico 2: Evolución Histórica por Quincena
  const datosHistorial = [...resumenQuincenasEmpleado]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((q) => ({
      periodo: `${q.esPrimera ? '1Q' : '2Q'} ${q.id.slice(5, 7)}/${q.id.slice(2, 4)}`,
      totalHoras: Number((q.totalHoras || 0).toFixed(2)),
    }));

  return (
    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
      {/* ================================================================= */}
      {/* PANEL DE SUELDO QUINCENAL ESTIMADO (PÚBLICO + PRIVADO LOCALHOST)  */}
      {/* ================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: esLocalhost ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Tarjeta 1: Pública */}
        <div style={{ padding: '14px', backgroundColor: '#090d16', borderRadius: '10px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '2px' }}>
              Proyección Sueldo Base (<strong>{totalHoras} hs</strong>)
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Valor Hora Base: <strong>${VALOR_HORA_NORMAL.toLocaleString('es-AR')}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#475569' }}>
              (+ ${ADICIONAL_NO_REM_POR_HORA.toLocaleString('es-AR')} No Rem. • Desc: 20,54%)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Neto Estimado (Base Día)</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#34d399', fontFamily: 'monospace' }}>
              ${sueldoNetoGeneral.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Privada (Solo en Localhost) */}
        {esLocalhost && (
          <div style={{ padding: '14px', backgroundColor: '#172554', borderRadius: '10px', border: '1px solid #1e40af', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#93c5fd', marginBottom: '2px' }}>
                🌙 Tu Cálculo Real (Solo en tu PC)
              </div>
              <div style={{ fontSize: '12px', color: '#bfdbfe' }}>
                Nocturnidad + 8% Antigüedad
              </div>
              <div style={{ fontSize: '11px', color: '#60a5fa' }}>
                Prom. Bruto: ${VALOR_HORA_BRUTO_GIAN.toLocaleString('es-AR')}/h (~$7.060 netos/h)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Tu Bolsillo Estimado</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace' }}>
                ${sueldoNetoGian.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* GRÁFICOS: 1. BARRAS APILADAS | 2. LÍNEA HISTÓRICA                  */}
      {/* ================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {/* Gráfico 1: Barra Apilada */}
        <div style={{ padding: '14px', backgroundColor: '#090d16', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px', display: 'flex', justifyContent: 'between' }}>
            <span>📊 Progreso de Horas ({quincenaActivaObj.titulo})</span>
          </div>
          <div style={{ width: '100%', height: 110 }}>
            <ResponsiveContainer>
              <BarChart data={datosBarraActual} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" style={{ fontSize: '11px' }} />
                <YAxis dataKey="name" type="category" width={85} stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`${value} hs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Cumplidas" name="Cumplidas" stackId="a" fill="#2563eb" />
                <Bar dataKey="Pendientes" name="Pendientes" stackId="a" fill="#93c5fd" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Línea Histórica */}
        <div style={{ padding: '14px', backgroundColor: '#090d16', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>
            📈 Evolución Histórica por Quincena
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={datosHistorial} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" angle={-45} textAnchor="end" height={45} stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`${value} hs`, 'Total Quincena']}
                />
                <Line
                  type="monotone"
                  dataKey="totalHoras"
                  name="Horas Quincena"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}