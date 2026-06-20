function promedio(valores) {
  if (!valores.length) return null;
  const suma = valores.reduce((a, b) => a + b, 0);
  return Math.round((suma / valores.length) * 100) / 100;
}

// Calcula la nota final de UNA materia en UN trimestre según la fórmula:
// (promedio diarias + promedio apreciación + promedio examen) / 3
function calcularNotaMateria(notas) {
  const diarias = notas.filter(n => n.tipo === 'diaria').map(n => n.valor);
  const apreciacion = notas.filter(n => n.tipo === 'apreciacion').map(n => n.valor);
  const examen = notas.filter(n => n.tipo === 'examen').map(n => n.valor);

  const promDiaria = promedio(diarias);
  const promApreciacion = promedio(apreciacion);
  const promExamen = promedio(examen);

  const completo = promDiaria !== null && promApreciacion !== null && promExamen !== null;
  const notaFinal = completo
    ? Math.round(((promDiaria + promApreciacion + promExamen) / 3) * 100) / 100
    : null;

  return {
    promDiaria,
    promApreciacion,
    promExamen,
    notaFinal,
    completo,
    cantidadDiarias: diarias.length,
    cantidadApreciacion: apreciacion.length,
    cantidadExamen: examen.length
  };
}

// Promedio general del trimestre = suma de notas finales de cada materia / cantidad de materias
function calcularPromedioGeneral(notasFinalesPorMateria) {
  const validas = notasFinalesPorMateria.filter(n => n !== null && n !== undefined);
  return promedio(validas);
}

module.exports = { promedio, calcularNotaMateria, calcularPromedioGeneral };
