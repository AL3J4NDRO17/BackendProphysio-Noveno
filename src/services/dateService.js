const { DateTime } = require('luxon');

// Zona horaria local (configurable)
const ZONA_HORARIA_LOCAL = 'America/Mexico_City';

// Convertir fecha de BD a DateTime UTC - CORREGIDO
exports.convertirFechaBDaUTC = (fechaBD) => {
    if (!fechaBD) return null;

    // Si ya es un objeto DateTime, devolverlo
    if (fechaBD instanceof DateTime) return fechaBD;

    // Si es un objeto Date, convertirlo a DateTime UTC
    if (fechaBD instanceof Date) return DateTime.fromJSDate(fechaBD, { zone: 'utc' });

    // Si es string, intentar diferentes formatos
    if (typeof fechaBD === 'string') {
        // Intentar formato SQL (YYYY-MM-DD HH:mm:ss.SSS)
        let dt = DateTime.fromSQL(fechaBD, { zone: 'utc' });

        // Si es inválido, intentar formato ISO
        if (!dt.isValid) {
            dt = DateTime.fromISO(fechaBD, { zone: 'utc' });
        }

        // Si sigue siendo inválido, intentar formato personalizado
        if (!dt.isValid) {
            // Formato: 2025-03-10 04:05:31.004
            const match = fechaBD.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
            if (match) {
                dt = DateTime.utc(
                    parseInt(match[1]), // año
                    parseInt(match[2]), // mes
                    parseInt(match[3]), // día
                    parseInt(match[4]), // hora
                    parseInt(match[5]), // minuto
                    parseInt(match[6]), // segundo
                    parseInt(match[7])  // milisegundo
                );
            }
        }

        // Verificar si la fecha es válida
        if (dt.isValid) {
            return dt;
        }

        // Loguear el error para depuración
        console.error(`Error al convertir fecha: "${fechaBD}" no es un formato válido`);
        return null;
    }

    // Si no es ninguno de los tipos anteriores, devolver null
    console.error(`Tipo de fecha no soportado: ${typeof fechaBD}`);
    return null;
};

// Formatear fecha para guardar en BD
exports.formatearFechaParaBD = (fecha) => {
    if (!fecha) return null;

    // Si es string, intentar convertirlo primero
    if (typeof fecha === 'string') {
        fecha = exports.convertirFechaBDaUTC(fecha);
        if (!fecha) return null;
    }

    // Si es Date, convertirlo a DateTime UTC
    if (fecha instanceof Date) {
        fecha = DateTime.fromJSDate(fecha, { zone: 'utc' });
    }

    // Asegurarse de que sea un objeto DateTime válido
    if (!(fecha instanceof DateTime) || !fecha.isValid) {
        console.error('Fecha inválida para formatear:', fecha);
        return null;
    }

    // Formatear como SQL sin offset
    return fecha.toFormat('yyyy-MM-dd HH:mm:ss.SSS');
};

// Mostrar fecha en zona horaria local - CORREGIDO
exports.mostrarFechaLocal = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    try {
        // Convertir a DateTime UTC si es necesario
        const fechaDateTime = exports.convertirFechaBDaUTC(fecha);

        // Verificar si la conversión fue exitosa
        if (!fechaDateTime || !fechaDateTime.isValid) {
            console.error('Error al convertir fecha para mostrar:', fecha);
            return "Fecha inválida";
        }
        console.log(fechaDateTime)
        // Convertir a zona horaria local y formatear
        return fechaDateTime
            .setZone(ZONA_HORARIA_LOCAL)  // Asegúrate de ajustar la zona horaria
            .toLocaleString(DateTime.DATETIME_FULL);
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return "Error al procesar fecha";
    }
};

// Obtener fecha actual en UTC
exports.obtenerFechaUTC = () => {
    console.log(DateTime.utc())
    return DateTime.utc();
};

// Calcular fecha de desbloqueo (actual + minutos)
exports.calcularFechaDesbloqueo = (minutos) => {
    return exports.obtenerFechaUTC().plus({ minutes: minutos });
};

// Verificar si una fecha ya pasó - CORREGIDO
exports.fechaHaPasado = (fecha) => {
    if (!fecha) return true;

    try {
        const fechaUTC = exports.convertirFechaBDaUTC(fecha);

        // Verificar si la conversión fue exitosa
        if (!fechaUTC || !fechaUTC.isValid) {
            console.error('Error al convertir fecha para verificar si ha pasado:', fecha);
            return false; // Por seguridad, si no podemos verificar, asumimos que no ha pasado
        }

        return exports.obtenerFechaUTC() >= fechaUTC;
    } catch (error) {
        console.error('Error al verificar si la fecha ha pasado:', error);
        return false; // Por seguridad
    }
};

// Función para depurar fechas (útil para diagnóstico)
exports.depurarFecha = (fecha, etiqueta = 'Fecha') => {
    console.log(`=== DEPURACIÓN: ${etiqueta} ===`);
    console.log('Valor original:', fecha);
    console.log('Tipo:', typeof fecha);

    if (fecha instanceof Date) {
        console.log('Es objeto Date:', fecha.toISOString());
    }

    if (fecha instanceof DateTime) {
        console.log('Es objeto DateTime:', fecha.toISO());
        console.log('¿Es válido?:', fecha.isValid);
    }

    const fechaConvertida = exports.convertirFechaBDaUTC(fecha);
    console.log('Convertida a DateTime:', fechaConvertida ? fechaConvertida.toISO() : 'Conversión fallida');
    console.log('Formato para BD:', exports.formatearFechaParaBD(fecha));
    console.log('Formato local:', exports.mostrarFechaLocal(fecha));
};
