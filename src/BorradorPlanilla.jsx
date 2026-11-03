import { useState } from 'react';
import './BorradorPlanilla.css';
import materias from "./materias.json";

// Función auxiliar para convertir "HH:MM" a minutos totales desde las 00:00
function horaAMinutos(horaString) {
  if (!horaString || !horaString.includes(":")) return null;
  const partes = horaString.split(":");
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);
  if (isNaN(horas) || isNaN(minutos)) return null;
  return (horas * 60) + minutos;
}

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

  // --- INICIO LÓGICA DE CHOQUE CON MATERIAS ---
  const materiasChocadas = [];
  const legajoLimpio = String(legajoSeleccionado).trim();
  const cursadaEmpleado = materias[legajoLimpio];

  // ⚠️ AJUSTE NECESARIO: Asegurate de que 'empleadoActual.fecha' sea el nombre real 
  // de la variable o propiedad donde tenés guardada la fecha del turno (ej: "2026-11-02")
  const fechaString = fecha; 

  if (cursadaEmpleado && horaEntradaActual && horaSalidaActual && fechaString) {
    // Si tu fecha viene en formato YYYY-MM-DD, agregamos T00:00:00 para evitar desfases de zona horaria
    const objetoFecha = fechaString.includes("T") 
      ? new Date(fechaString) 
      : new Date(fechaString + "T00:00:00");
      
    const diaSemanaTurno = objetoFecha.getDay(); // Devuelve de 0 (Domingo) a 6 (Sábado)

    let tim = horaAMinutos(horaEntradaActual);
    let tfm = horaAMinutos(horaSalidaActual);

    if (tim !== null && tfm !== null) {
      // Parche matemático para turnos rotativos que cruzan la medianoche (ej: 23:00 a 04:00)
      if (tim > tfm) {
        tfm += 1440;
      }

      // Recorremos las materias del empleado
      for (let i = 0; i < cursadaEmpleado.length; i++) {
        if (cursadaEmpleado[i].dia === diaSemanaTurno) {
          let cim = horaAMinutos(cursadaEmpleado[i].inicio);
          let cfm = horaAMinutos(cursadaEmpleado[i].fin);
          if (cim > cfm) cfm += 1440;

          // Aplicamos la lógica inversa: si NO estamos a salvo, hay choque
          if (!(tfm <= cim || cfm <= tim)) {
            materiasChocadas.push(
              `${cursadaEmpleado[i].materia} (${cursadaEmpleado[i].inicio} a ${cursadaEmpleado[i].fin})`
            );
          }
        }
      }
    }
  }
  // --- FIN LÓGICA DE CHOQUE CON MATERIAS ---

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

        {materiasChocadas.length > 0 && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '6px',
            marginTop: '10px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            ⚠️ <strong>¡Choque con la facultad!</strong> Este turno se superpone con:
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              {materiasChocadas.map((choque, index) => (
                <li key={index}>{choque}</li>
              ))}
            </ul>
          </div>
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