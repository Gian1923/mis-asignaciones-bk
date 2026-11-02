import { useState } from 'react';
import './BorradorPlanilla.css';

export default function BorradorPlanilla({ imagenUrl, datosExtraidosIA, alGuardar }) {
  // 1. Guardamos la fecha y la lista completa de los 48 empleados para poder editar a cualquiera
  const [fecha, setFecha] = useState(datosExtraidosIA?.fechaISO || '');
  const [asignaciones, setAsignaciones] = useState(() =>
    Array.isArray(datosExtraidosIA?.asignaciones) ? datosExtraidosIA.asignaciones : []
  );

  // 2. Estado del selector: arranca en tu legajo 91149 por defecto (o en el primero de la lista)
  const [legajoSeleccionado, setLegajoSeleccionado] = useState(() => {
    const lista = Array.isArray(datosExtraidosIA?.asignaciones) ? datosExtraidosIA.asignaciones : [];
    const existeMio = lista.some((a) => String(a.legajo).trim() === '91149');
    return existeMio ? '91149' : String(lista[0]?.legajo || '').trim();
  });

  // Buscamos los datos del empleado que tenés elegido en el selector en este momento
  const empleadoActual = asignaciones.find(
    (a) => String(a.legajo).trim() === legajoSeleccionado
  ) || {};

  // Detectar cómo nombró Gemini a las propiedades de entrada y salida
  const campoEntrada =
    'entrada' in empleadoActual ? 'entrada' :
    'horaEntrada' in empleadoActual ? 'horaEntrada' :
    'inicio' in empleadoActual ? 'inicio' : 'entrada';

  const campoSalida =
    'salida' in empleadoActual ? 'salida' :
    'horaSalida' in empleadoActual ? 'horaSalida' :
    'fin' in empleadoActual ? 'fin' : 'salida';

  const horaEntradaActual = empleadoActual[campoEntrada] || '';
  const horaSalidaActual = empleadoActual[campoSalida] || '';

  // 3. Función que actualiza la hora del empleado seleccionado sin perder los cambios de los demás
  const manejarCambioHora = (campo, nuevoValor) => {
    setAsignaciones((prev) =>
      prev.map((item) => {
        if (String(item.legajo).trim() === legajoSeleccionado) {
          const nuevaEntrada = campo === 'entrada' ? nuevoValor : (item[campoEntrada] || '');
          const nuevaSalida = campo === 'salida' ? nuevoValor : (item[campoSalida] || '');
          return {
            ...item,
            [campoEntrada]: nuevaEntrada,
            [campoSalida]: nuevaSalida,
            trabaja: nuevaEntrada && nuevaSalida ? 'Si' : item.trabaja
          };
        }
        return item;
      })
    );
  };

  // Regla de validación matemática
  const esHoraSospechosa = (horaEntrada, horaSalida) => {
    if (!horaEntrada || !horaSalida) return true;

    const formatoInvalido = (hora) => !hora.endsWith(':00') && !hora.endsWith(':30');
    if (formatoInvalido(horaEntrada) || formatoInvalido(horaSalida)) return true;

    const convertirAMinutos = (hora) => {
      const [horas, minutos] = hora.split(':').map(Number);
      return (horas * 60) + minutos;
    };

    let minEntrada = convertirAMinutos(horaEntrada);
    let minSalida = convertirAMinutos(horaSalida);

    if (minSalida <= minEntrada) minSalida += (24 * 60);

    const duracionHoras = (minSalida - minEntrada) / 60;
    if (duracionHoras < 4 || duracionHoras > 8) return true;

    return false;
  };

  // Evalúa si un empleado específico tiene una alerta o está todo en orden
  const tieneAlertaEmpleado = (emp) => {
    const ent = emp[campoEntrada] || '';
    const sal = emp[campoSalida] || '';
    const trab = String(emp.trabaja || '').toLowerCase();
    const franco = trab === 'off' || trab === 'no' || (!ent && !sal && emp.trabaja !== 'Si');
    return franco ? false : esHoraSospechosa(ent, sal);
  };

  const esDiaFranco =
    String(empleadoActual.trabaja || '').toLowerCase() === 'off' ||
    String(empleadoActual.trabaja || '').toLowerCase() === 'no' ||
    (!horaEntradaActual && !horaSalidaActual && empleadoActual.trabaja !== 'Si');

  const semaforoRojo = tieneAlertaEmpleado(empleadoActual);

  // 4. Al confirmar, guardamos toda la planilla con todas las correcciones que hayas hecho
  const confirmarYGuardarTodo = () => {
    const planillaCompletaCorregida = {
      ...datosExtraidosIA,
      id: fecha || datosExtraidosIA.id,
      fechaISO: fecha || datosExtraidosIA.fechaISO,
      asignaciones: asignaciones
    };

    alGuardar(planillaCompletaCorregida);
  };

  return (
    <div className="contenedor-borrador">
      <div className="mitad-imagen">
        <h3>Planilla Original</h3>
        {imagenUrl && <img src={imagenUrl} alt="Planilla" />}
      </div>

      <div className="mitad-formulario">
        <h3>Revisión de IA</h3>

        <div className="grupo-input">
          <label>Empleado a revisar:</label>
          <select
            value={legajoSeleccionado}
            onChange={(e) => setLegajoSeleccionado(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '15px',
              borderRadius: '4px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: '1px solid #475569'
            }}
          >
            {asignaciones.map((emp, idx) => {
              const leg = String(emp.legajo).trim();
              const nombre = emp.nombre || emp.empleado || emp.nombreApellido || 'Sin nombre';
              const alerta = tieneAlertaEmpleado(emp);
              return (
                <option key={leg || idx} value={leg}>
                  {alerta ? '⚠️' : '🟢'} {leg} - {nombre} {leg === '91149' ? '(Vos)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grupo-input">
          <label>Fecha del Turno (General):</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="grupo-input">
          <label>Hora de Entrada:</label>
          <input
            type="time"
            value={horaEntradaActual}
            onChange={(e) => manejarCambioHora('entrada', e.target.value)}
            style={{ border: `3px solid ${semaforoRojo ? 'red' : 'green'}` }}
          />
        </div>

        <div className="grupo-input">
          <label>Hora de Salida:</label>
          <input
            type="time"
            value={horaSalidaActual}
            onChange={(e) => manejarCambioHora('salida', e.target.value)}
            style={{ border: `3px solid ${semaforoRojo ? 'red' : 'green'}` }}
          />
        </div>

        {esDiaFranco && (
          <p style={{ color: '#38bdf8', marginBottom: '12px' }}>
            ℹ️ Este legajo figura como Franco / Off en la planilla (o sin horario asignado).
          </p>
        )}

        {semaforoRojo && (
          <p style={{ color: '#f87171', marginBottom: '12px' }}>
            ⚠️ Revisá los horarios de este legajo. El formato o la duración no coinciden con un turno normal.
          </p>
        )}

        <button
          type="button"
          onClick={confirmarYGuardarTodo}
          style={{
            padding: '10px 16px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ✅ Confirmar y Guardar Planilla Completa
        </button>
      </div>
    </div>
  );
}