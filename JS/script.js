'use strict';

/* ── NAVEGACIÓN DE ESCENARIOS ── */

function activarEscenario(letraEscenario) {
  const todosLosPaneles = document.querySelectorAll('.form-panel');
  todosLosPaneles.forEach(function(panel) {
    panel.classList.remove('active');
  });

  const todosLosBotones = document.querySelectorAll('.esc-btn');
  todosLosBotones.forEach(function(boton) {
    boton.classList.remove('active');
  });

  const panelSeleccionado = document.getElementById('form-' + letraEscenario);
  const botonSeleccionado = document.querySelector('[data-escenario="' + letraEscenario + '"]');

  if (panelSeleccionado) panelSeleccionado.classList.add('active');
  if (botonSeleccionado) botonSeleccionado.classList.add('active');

  limpiarResultados();
}

/* ── VALIDACIÓN Y FORMATEO ── */

function esNumeroPositivo(valor) {
  return valor !== '' && !isNaN(valor) && Number(valor) >= 0;
}

function esNumeroMayorQueCero(valor) {
  return valor !== '' && !isNaN(valor) && Number(valor) > 0;
}

function formatearNumero(numero, decimales) {
  if (decimales === undefined) decimales = 2;
  return Number(numero).toLocaleString('es-BO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  });
}

function calcularNivelEstado(porcentaje) {
  if (porcentaje <= 20) return 'critico';
  if (porcentaje <= 50) return 'advertencia';
  return 'normal';
}

function obtenerMetadatosEstado(estado) {
  var mapa = {
    normal:      { icono: '✓', texto: 'Situación Normal' },
    advertencia: { icono: '⚠', texto: 'Advertencia' },
    critico:     { icono: '✕', texto: 'Nivel Crítico' }
  };
  return mapa[estado] || mapa.normal;
}

/* ── CONSTRUCCIÓN DEL DOM ── */

function mostrarErrorValidacion(mensaje) {
  var contenedor = document.getElementById('resultados-container');
  contenedor.innerHTML = '';
  var banner = document.createElement('div');
  banner.className = 'alerta-banner critico';
  banner.innerHTML = '<span class="alerta-icono">⚠</span><span>' + mensaje + '</span>';
  contenedor.appendChild(banner);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function crearBannerEstado(estado, mensajeExtra) {
  var meta = obtenerMetadatosEstado(estado);
  var banner = document.createElement('div');
  banner.className = 'alerta-banner ' + estado;
  banner.innerHTML =
    '<span class="alerta-icono">' + meta.icono + '</span>' +
    '<span><strong>' + meta.texto + '</strong>' + (mensajeExtra ? ' — ' + mensajeExtra : '') + '</span>';
  return banner;
}

function crearTarjetaResultado(etiqueta, valor, estado, grande) {
  var tarjeta = document.createElement('div');
  tarjeta.className = 'resultado-card' + (estado ? ' estado-' + estado : '');

  var labelEl = document.createElement('div');
  labelEl.className = 'card-label';
  labelEl.textContent = etiqueta;

  var valorEl = document.createElement('div');
  valorEl.className = 'card-valor' + (grande ? ' valor-grande' : '');
  valorEl.textContent = valor;

  tarjeta.appendChild(labelEl);
  tarjeta.appendChild(valorEl);
  return tarjeta;
}

function iniciarZonaResultados(tituloTexto) {
  var contenedor = document.getElementById('resultados-container');
  contenedor.innerHTML = '';
  var titulo = document.createElement('p');
  titulo.className = 'resultado-titulo';
  titulo.textContent = tituloTexto;
  contenedor.appendChild(titulo);
  return contenedor;
}

/* ── ESCENARIO A — CARBURANTE ── */

function calcularEscenarioA() {
  var reservaInicial   = Number(document.getElementById('a-reserva-inicial').value);
  var consumoDiario    = Number(document.getElementById('a-consumo-diario').value);
  var reabastecimiento = Number(document.getElementById('a-reabastecimiento').value);
  var nivelCritico     = Number(document.getElementById('a-nivel-critico').value);

  if (!esNumeroMayorQueCero(document.getElementById('a-reserva-inicial').value)) {
    mostrarErrorValidacion('La reserva inicial debe ser mayor a cero.');
    return;
  }
  if (reservaInicial > 10000000) { mostrarErrorValidacion('La reserva inicial no puede superar 10.000.000 litros.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('a-consumo-diario').value)) {
    mostrarErrorValidacion('El consumo diario debe ser mayor a cero.');
    return;
  }
  if (consumoDiario > 1000000) { mostrarErrorValidacion('El consumo diario no puede superar 1.000.000 litros.'); return; }
  if (!esNumeroPositivo(document.getElementById('a-reabastecimiento').value)) {
    mostrarErrorValidacion('El reabastecimiento no puede estar vacío. Ingresa 0 si no hay.');
    return;
  }
  if (!esNumeroPositivo(document.getElementById('a-nivel-critico').value)) {
    mostrarErrorValidacion('El nivel crítico no puede estar vacío. Ingresa 0 si no aplica.');
    return;
  }

  var balanceNeto = reabastecimiento - consumoDiario;
  var reservaActual = reservaInicial;
  var diaAlcanzaNivelCritico = null;
  var diaSeAgota = null;

  for (var dia = 1; dia <= 365; dia++) {
    reservaActual = reservaActual + balanceNeto;
    if (reservaActual <= 0) {
      diaSeAgota = dia;
      reservaActual = 0;
      break;
    }
    if (diaAlcanzaNivelCritico === null && reservaActual <= nivelCritico) {
      diaAlcanzaNivelCritico = dia;
    }
  }

  var estadoGeneral, mensajeBanner;
  if (diaSeAgota !== null) {
    estadoGeneral = 'critico';
    mensajeBanner = 'La reserva se agota en el día ' + diaSeAgota + '.';
  } else if (diaAlcanzaNivelCritico !== null) {
    estadoGeneral = 'advertencia';
    mensajeBanner = 'Nivel crítico alcanzado en el día ' + diaAlcanzaNivelCritico + '.';
  } else {
    estadoGeneral = 'normal';
    mensajeBanner = 'La reserva se mantiene estable en el período simulado (365 días).';
  }

  var contenedor = iniciarZonaResultados('▸ ESCENARIO A — Reserva de carburante');
  contenedor.appendChild(crearBannerEstado(estadoGeneral, mensajeBanner));

  var grilla = document.createElement('div');
  grilla.className = 'resultado-grid';
  grilla.appendChild(crearTarjetaResultado('Reserva inicial', formatearNumero(reservaInicial, 0) + ' L', '', false));
  grilla.appendChild(crearTarjetaResultado('Balance neto diario', (balanceNeto >= 0 ? '+' : '') + formatearNumero(balanceNeto, 0) + ' L/día', balanceNeto >= 0 ? 'normal' : 'advertencia', false));
  grilla.appendChild(crearTarjetaResultado('Día en que llega al nivel crítico', diaAlcanzaNivelCritico !== null ? 'Día ' + diaAlcanzaNivelCritico : 'No alcanza', diaAlcanzaNivelCritico !== null ? 'advertencia' : 'normal', true));
  grilla.appendChild(crearTarjetaResultado('Día en que se agota la reserva', diaSeAgota !== null ? 'Día ' + diaSeAgota : 'No se agota (≤365 días)', diaSeAgota !== null ? 'critico' : 'normal', true));
  contenedor.appendChild(grilla);

  var diasAMostrar = Math.min(15, diaSeAgota !== null ? diaSeAgota : 15);
  var tablaWrapper = document.createElement('div');
  tablaWrapper.className = 'resultado-tabla-wrapper';
  var tabla = document.createElement('table');
  tabla.className = 'resultado-tabla';
  tabla.innerHTML = '<thead><tr><th>Día</th><th>Reserva al final del día (L)</th><th>Estado</th></tr></thead>';
  var tbody = document.createElement('tbody');
  var reservaSim = reservaInicial;

  for (var d = 1; d <= diasAMostrar; d++) {
    reservaSim = Math.max(0, reservaSim + balanceNeto);
    var porcentaje = (reservaSim / reservaInicial) * 100;
    var estadoFila = calcularNivelEstado(porcentaje);
    var textoEstado = obtenerMetadatosEstado(estadoFila).texto;
    var fila = document.createElement('tr');
    fila.innerHTML =
      '<td>Día ' + d + '</td>' +
      '<td class="neutro">' + formatearNumero(reservaSim, 0) + ' L</td>' +
      '<td class="' + (estadoFila === 'normal' ? 'negativo' : estadoFila === 'advertencia' ? 'neutro' : 'positivo') + '">' + textoEstado + ' (' + formatearNumero(porcentaje, 1) + '%)</td>';
    tbody.appendChild(fila);
  }

  tabla.appendChild(tbody);
  tablaWrapper.appendChild(tabla);
  contenedor.appendChild(tablaWrapper);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ESCENARIO B — PRECIOS ── */

function agregarProducto() {
  var contenedor = document.getElementById('b-productos-container');
  var nuevaFila = document.createElement('div');
  nuevaFila.className = 'producto-row';
  nuevaFila.innerHTML =
    '<div class="field-group"><label>Producto</label><input type="text" class="b-producto" placeholder="ej. Pan" /></div>' +
    '<div class="field-group"><label>Precio anterior (Bs)</label><input type="number" class="b-precio-anterior" placeholder="ej. 5" min="0" step="0.01" /></div>' +
    '<div class="field-group"><label>Precio actual (Bs)</label><input type="number" class="b-precio-actual" placeholder="ej. 8" min="0" step="0.01" /></div>' +
    '<div class="field-group"><label>Cantidad mensual</label><input type="number" class="b-cantidad" placeholder="ej. 6" min="0" /></div>';
  contenedor.appendChild(nuevaFila);
}

function calcularEscenarioB() {
  var nombresProductos  = document.querySelectorAll('#form-B .b-producto');
  var preciosAnteriores = document.querySelectorAll('#form-B .b-precio-anterior');
  var preciosActuales   = document.querySelectorAll('#form-B .b-precio-actual');
  var cantidades        = document.querySelectorAll('#form-B .b-cantidad');

  if (nombresProductos.length === 0) { mostrarErrorValidacion('Agrega al menos un producto.'); return; }

  var filas = [];
  var totalGastoAnterior = 0;
  var totalGastoActual   = 0;

  for (var i = 0; i < nombresProductos.length; i++) {
    var nombreProducto = nombresProductos[i].value.trim();
    var precioAnterior = Number(preciosAnteriores[i].value);
    var precioActual   = Number(preciosActuales[i].value);
    var cantidad       = Number(cantidades[i].value);

    if (!nombreProducto) { mostrarErrorValidacion('El nombre del producto en la fila ' + (i + 1) + ' está vacío.'); return; }
    if (!esNumeroMayorQueCero(preciosAnteriores[i].value)) { mostrarErrorValidacion('El precio anterior de "' + nombreProducto + '" debe ser mayor a cero.'); return; }
    if (!esNumeroMayorQueCero(preciosActuales[i].value))   { mostrarErrorValidacion('El precio actual de "' + nombreProducto + '" debe ser mayor a cero.'); return; }
    if (!esNumeroMayorQueCero(cantidades[i].value))        { mostrarErrorValidacion('La cantidad de "' + nombreProducto + '" debe ser mayor a cero.'); return; }

    var gastoAnterior     = precioAnterior * cantidad;
    var gastoActual       = precioActual * cantidad;
    var diferencia        = gastoActual - gastoAnterior;
    var porcentajeAumento = ((precioActual - precioAnterior) / precioAnterior) * 100;

    totalGastoAnterior += gastoAnterior;
    totalGastoActual   += gastoActual;
    filas.push({ nombreProducto, precioAnterior, precioActual, cantidad, gastoAnterior, gastoActual, diferencia, porcentajeAumento });
  }

  var totalDiferencia        = totalGastoActual - totalGastoAnterior;
  var totalPorcentajeAumento = ((totalGastoActual - totalGastoAnterior) / totalGastoAnterior) * 100;
  var estadoGeneral = totalPorcentajeAumento >= 30 ? 'critico' : totalPorcentajeAumento >= 15 ? 'advertencia' : 'normal';

  var contenedor = iniciarZonaResultados('▸ ESCENARIO B — Impacto del aumento de precios');
  contenedor.appendChild(crearBannerEstado(estadoGeneral, 'Aumento total del gasto: ' + formatearNumero(totalPorcentajeAumento, 1) + '%'));

  var grilla = document.createElement('div');
  grilla.className = 'resultado-grid';
  grilla.appendChild(crearTarjetaResultado('Gasto anterior total', formatearNumero(totalGastoAnterior, 2) + ' Bs', '', true));
  grilla.appendChild(crearTarjetaResultado('Gasto actual total', formatearNumero(totalGastoActual, 2) + ' Bs', estadoGeneral, true));
  grilla.appendChild(crearTarjetaResultado('Diferencia mensual', '+' + formatearNumero(totalDiferencia, 2) + ' Bs', 'critico', true));
  grilla.appendChild(crearTarjetaResultado('% de aumento total', formatearNumero(totalPorcentajeAumento, 1) + '%', estadoGeneral, true));
  contenedor.appendChild(grilla);

  var tablaWrapper = document.createElement('div');
  tablaWrapper.className = 'resultado-tabla-wrapper';
  var tabla = document.createElement('table');
  tabla.className = 'resultado-tabla';
  tabla.innerHTML = '<thead><tr><th>Producto</th><th>Precio ant.</th><th>Precio act.</th><th>Cantidad</th><th>Gasto ant.</th><th>Gasto act.</th><th>Diferencia</th><th>% Aumento</th></tr></thead>';
  var tbody = document.createElement('tbody');

  filas.forEach(function(f) {
    var fila = document.createElement('tr');
    fila.innerHTML =
      '<td>' + f.nombreProducto + '</td>' +
      '<td>' + formatearNumero(f.precioAnterior, 2) + ' Bs</td>' +
      '<td>' + formatearNumero(f.precioActual, 2) + ' Bs</td>' +
      '<td>' + f.cantidad + '</td>' +
      '<td>' + formatearNumero(f.gastoAnterior, 2) + ' Bs</td>' +
      '<td class="neutro">' + formatearNumero(f.gastoActual, 2) + ' Bs</td>' +
      '<td class="positivo">+' + formatearNumero(f.diferencia, 2) + ' Bs</td>' +
      '<td class="positivo">+' + formatearNumero(f.porcentajeAumento, 1) + '%</td>';
    tbody.appendChild(fila);
  });

  var filaTotales = document.createElement('tr');
  filaTotales.style.fontWeight = '700';
  filaTotales.innerHTML =
    '<td colspan="4">TOTAL</td>' +
    '<td>' + formatearNumero(totalGastoAnterior, 2) + ' Bs</td>' +
    '<td class="neutro">' + formatearNumero(totalGastoActual, 2) + ' Bs</td>' +
    '<td class="positivo">+' + formatearNumero(totalDiferencia, 2) + ' Bs</td>' +
    '<td class="positivo">+' + formatearNumero(totalPorcentajeAumento, 1) + '%</td>';
  tbody.appendChild(filaTotales);

  tabla.appendChild(tbody);
  tablaWrapper.appendChild(tabla);
  contenedor.appendChild(tablaWrapper);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ESCENARIO C — TRANSPORTE ── */

function calcularEscenarioC() {
  var distanciaNormal = Number(document.getElementById('c-distancia-normal').value);
  var distanciaDesvio = Number(document.getElementById('c-distancia-desvio').value);
  var costoKm         = Number(document.getElementById('c-costo-km').value);
  var viajesSemana    = Number(document.getElementById('c-viajes-semana').value);

  if (!esNumeroMayorQueCero(document.getElementById('c-distancia-normal').value)) { mostrarErrorValidacion('La distancia normal debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('c-distancia-desvio').value)) { mostrarErrorValidacion('La distancia con desvío debe ser mayor a cero.'); return; }
  if (distanciaDesvio <= distanciaNormal) { mostrarErrorValidacion('La distancia con desvío debe ser mayor que la distancia normal.'); return; }
  if (distanciaNormal > 10000) { mostrarErrorValidacion('La distancia normal no puede superar los 10.000 km.'); return; }
  if (distanciaDesvio > 10000) { mostrarErrorValidacion('La distancia con desvío no puede superar los 10.000 km.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('c-costo-km').value))         { mostrarErrorValidacion('El costo por kilómetro debe ser mayor a cero.'); return; }
  if (costoKm > 1000) { mostrarErrorValidacion('El costo por km parece demasiado alto. Revisa el valor ingresado.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('c-viajes-semana').value))    { mostrarErrorValidacion('El número de viajes por semana debe ser mayor a cero.'); return; }
  if (viajesSemana > 100) { mostrarErrorValidacion('El número de viajes por semana no puede superar 100.'); return; }

  var costoNormal            = distanciaNormal * costoKm;
  var costoConDesvio         = distanciaDesvio * costoKm;
  var costoAdicional         = costoConDesvio - costoNormal;
  var gastoAdicionalSemanal  = costoAdicional * viajesSemana;
  var gastoAdicionalMensual  = gastoAdicionalSemanal * 4;
  var porcentajeAumentoRuta  = ((distanciaDesvio - distanciaNormal) / distanciaNormal) * 100;

  var estadoGeneral = porcentajeAumentoRuta >= 50 ? 'critico' : porcentajeAumentoRuta >= 20 ? 'advertencia' : 'normal';

  var contenedor = iniciarZonaResultados('▸ ESCENARIO C — Impacto del desvío en el transporte');
  contenedor.appendChild(crearBannerEstado(estadoGeneral, 'La ruta es ' + formatearNumero(porcentajeAumentoRuta, 1) + '% más larga con el desvío.'));

  var grilla = document.createElement('div');
  grilla.className = 'resultado-grid';
  grilla.appendChild(crearTarjetaResultado('Costo viaje normal', formatearNumero(costoNormal, 2) + ' Bs', 'normal', false));
  grilla.appendChild(crearTarjetaResultado('Costo viaje con desvío', formatearNumero(costoConDesvio, 2) + ' Bs', estadoGeneral, false));
  grilla.appendChild(crearTarjetaResultado('Costo adicional por viaje', '+' + formatearNumero(costoAdicional, 2) + ' Bs', 'advertencia', false));
  grilla.appendChild(crearTarjetaResultado('Km extra por viaje', formatearNumero(distanciaDesvio - distanciaNormal, 1) + ' km', 'advertencia', false));
  grilla.appendChild(crearTarjetaResultado('Gasto adicional semanal', '+' + formatearNumero(gastoAdicionalSemanal, 2) + ' Bs', estadoGeneral, true));
  grilla.appendChild(crearTarjetaResultado('Gasto adicional mensual', '+' + formatearNumero(gastoAdicionalMensual, 2) + ' Bs', estadoGeneral, true));
  contenedor.appendChild(grilla);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ESCENARIO D — PRESUPUESTO ── */

function agregarItem() {
  var contenedor = document.getElementById('d-items-container');
  var nuevaFila = document.createElement('div');
  nuevaFila.className = 'item-row';
  nuevaFila.innerHTML =
    '<div class="field-group"><label>Producto</label><input type="text" class="d-item-nombre" placeholder="ej. Leche" /></div>' +
    '<div class="field-group"><label>Precio unitario (Bs)</label><input type="number" class="d-item-precio" placeholder="ej. 7" min="0" step="0.01" /></div>' +
    '<div class="field-group"><label>Cantidad</label><input type="number" class="d-item-cantidad" placeholder="ej. 4" min="0" /></div>';
  contenedor.appendChild(nuevaFila);
}

function calcularEscenarioD() {
  var presupuesto = Number(document.getElementById('d-presupuesto').value);

  if (!esNumeroMayorQueCero(document.getElementById('d-presupuesto').value)) { mostrarErrorValidacion('El presupuesto disponible debe ser mayor a cero.'); return; }

  var nombresItems   = document.querySelectorAll('#form-D .d-item-nombre');
  var preciosItems   = document.querySelectorAll('#form-D .d-item-precio');
  var cantidadesItems = document.querySelectorAll('#form-D .d-item-cantidad');

  if (nombresItems.length === 0) { mostrarErrorValidacion('Agrega al menos un producto a la lista de compras.'); return; }

  var items = [];
  var totalCompra = 0;

  for (var i = 0; i < nombresItems.length; i++) {
    var nombre   = nombresItems[i].value.trim();
    var precio   = Number(preciosItems[i].value);
    var cantidad = Number(cantidadesItems[i].value);

    if (!nombre)                                   { mostrarErrorValidacion('El nombre del producto en la fila ' + (i + 1) + ' está vacío.'); return; }
    if (!esNumeroMayorQueCero(preciosItems[i].value))   { mostrarErrorValidacion('El precio de "' + nombre + '" debe ser mayor a cero.'); return; }
    if (!esNumeroMayorQueCero(cantidadesItems[i].value)) { mostrarErrorValidacion('La cantidad de "' + nombre + '" debe ser mayor a cero.'); return; }

    var subtotal = precio * cantidad;
    totalCompra += subtotal;
    items.push({ nombre, precio, cantidad, subtotal });
  }

  var porcentajeGasto = (totalCompra / presupuesto) * 100;
  var clasificacionGasto =
    porcentajeGasto <= 60  ? 'Bajo (≤ 60% del presupuesto)' :
    porcentajeGasto <= 90  ? 'Medio (61–90% del presupuesto)' :
    porcentajeGasto <= 100 ? 'Alto (91–100% del presupuesto)' :
                             'Insuficiente (supera el presupuesto)';

  var presupuestoAlcanza = totalCompra <= presupuesto;
  var saldoRestante      = presupuesto - totalCompra;
  var montoFaltante      = totalCompra - presupuesto;
  var estadoGeneral      = presupuestoAlcanza ? (porcentajeGasto >= 90 ? 'advertencia' : 'normal') : 'critico';

  var contenedor = iniciarZonaResultados('▸ ESCENARIO D — Presupuesto familiar de compras');
  contenedor.appendChild(crearBannerEstado(estadoGeneral,
    presupuestoAlcanza
      ? 'El presupuesto alcanza. Saldo restante: ' + formatearNumero(saldoRestante, 2) + ' Bs.'
      : '¡El presupuesto NO alcanza! Faltan ' + formatearNumero(montoFaltante, 2) + ' Bs.'
  ));

  var grilla = document.createElement('div');
  grilla.className = 'resultado-grid';
  grilla.appendChild(crearTarjetaResultado('Presupuesto disponible', formatearNumero(presupuesto, 2) + ' Bs', 'normal', false));
  grilla.appendChild(crearTarjetaResultado('Total de la compra', formatearNumero(totalCompra, 2) + ' Bs', estadoGeneral, true));
  grilla.appendChild(crearTarjetaResultado(
    presupuestoAlcanza ? 'Saldo restante' : 'Monto faltante',
    formatearNumero(presupuestoAlcanza ? saldoRestante : montoFaltante, 2) + ' Bs',
    presupuestoAlcanza ? 'normal' : 'critico', true
  ));
  grilla.appendChild(crearTarjetaResultado('Clasificación del gasto', clasificacionGasto, estadoGeneral, false));
  contenedor.appendChild(grilla);

  var tablaWrapper = document.createElement('div');
  tablaWrapper.className = 'resultado-tabla-wrapper';
  var tabla = document.createElement('table');
  tabla.className = 'resultado-tabla';
  tabla.innerHTML = '<thead><tr><th>Producto</th><th>Precio unit.</th><th>Cantidad</th><th>Subtotal</th></tr></thead>';
  var tbody = document.createElement('tbody');

  items.forEach(function(item) {
    var fila = document.createElement('tr');
    fila.innerHTML =
      '<td>' + item.nombre + '</td>' +
      '<td>' + formatearNumero(item.precio, 2) + ' Bs</td>' +
      '<td>' + item.cantidad + '</td>' +
      '<td class="neutro">' + formatearNumero(item.subtotal, 2) + ' Bs</td>';
    tbody.appendChild(fila);
  });

  var filaTotalRow = document.createElement('tr');
  filaTotalRow.style.fontWeight = '700';
  filaTotalRow.innerHTML =
    '<td colspan="3">TOTAL</td>' +
    '<td class="' + (presupuestoAlcanza ? 'negativo' : 'positivo') + '">' + formatearNumero(totalCompra, 2) + ' Bs</td>';
  tbody.appendChild(filaTotalRow);

  tabla.appendChild(tbody);
  tablaWrapper.appendChild(tabla);
  contenedor.appendChild(tablaWrapper);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ESCENARIO E — ESCASEZ ── */

function calcularEscenarioE() {
  var nombreProducto    = document.getElementById('e-producto').value.trim();
  var demandaNormal     = Number(document.getElementById('e-demanda-normal').value);
  var aumentoPorcentaje = Number(document.getElementById('e-aumento-porcentaje').value);
  var stockDisponible   = Number(document.getElementById('e-stock').value);
  var numeroDeFamilias  = Number(document.getElementById('e-familias').value);

  if (!nombreProducto)                                                              { mostrarErrorValidacion('Especifica el producto del que circula el rumor (ej. Azúcar, Aceite, Harina).'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('e-demanda-normal').value))    { mostrarErrorValidacion('La demanda normal debe ser mayor a cero.'); return; }
  if (!esNumeroPositivo(document.getElementById('e-aumento-porcentaje').value))    { mostrarErrorValidacion('El porcentaje de aumento por rumor no puede estar vacío.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('e-stock').value))             { mostrarErrorValidacion('El stock disponible debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('e-familias').value))          { mostrarErrorValidacion('El número de familias o personas debe ser mayor a cero.'); return; }

  var incrementoDemanda  = demandaNormal * (aumentoPorcentaje / 100);
  var nuevaDemanda       = demandaNormal + incrementoDemanda;
  var stockRestante      = stockDisponible - nuevaDemanda;
  var stockAlcanza       = stockRestante >= 0;
  var unidadesPorFamilia = stockAlcanza ? (stockDisponible / numeroDeFamilias) : (nuevaDemanda / numeroDeFamilias);
  var estadoGeneral      = stockAlcanza ? (stockRestante / stockDisponible < 0.15 ? 'advertencia' : 'normal') : 'critico';

  var contenedor = iniciarZonaResultados('▸ ESCENARIO E — Rumor de escasez: ' + nombreProducto.toUpperCase());
  contenedor.appendChild(crearBannerEstado(estadoGeneral,
    stockAlcanza
      ? 'El stock de ' + nombreProducto + ' alcanza. Restante: ' + formatearNumero(stockRestante, 0) + ' unidades.'
      : '¡Stock de ' + nombreProducto + ' insuficiente! Déficit de ' + formatearNumero(Math.abs(stockRestante), 0) + ' unidades.'
  ));

  var grilla = document.createElement('div');
  grilla.className = 'resultado-grid';
  grilla.appendChild(crearTarjetaResultado('Producto del rumor', nombreProducto, '', false));
  grilla.appendChild(crearTarjetaResultado('Demanda normal de ' + nombreProducto, formatearNumero(demandaNormal, 0) + ' und.', 'normal', false));
  grilla.appendChild(crearTarjetaResultado('Incremento por rumor', '+' + formatearNumero(incrementoDemanda, 0) + ' und.', 'advertencia', false));
  grilla.appendChild(crearTarjetaResultado('Nueva demanda total', formatearNumero(nuevaDemanda, 0) + ' und.', estadoGeneral, true));
  grilla.appendChild(crearTarjetaResultado('Stock disponible', formatearNumero(stockDisponible, 0) + ' und.', '', false));
  grilla.appendChild(crearTarjetaResultado(
    stockAlcanza ? 'Stock restante' : 'Déficit de ' + nombreProducto,
    (stockAlcanza ? '' : '-') + formatearNumero(Math.abs(stockRestante), 0) + ' und.',
    estadoGeneral, true
  ));
  grilla.appendChild(crearTarjetaResultado('Demanda por familia (' + numeroDeFamilias + ' familias)', formatearNumero(unidadesPorFamilia, 1) + ' und./familia', '', false));
  contenedor.appendChild(grilla);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ESCENARIO F — PODER ADQUISITIVO ── */

function calcularEscenarioF() {
  var ingresoFamiliar        = Number(document.getElementById('f-ingreso').value);
  var gastoAnterior          = Number(document.getElementById('f-gasto-anterior').value);
  var gastoActual            = Number(document.getElementById('f-gasto-actual').value);
  var precioBasicoAnterior   = Number(document.getElementById('f-precio-basico-anterior').value);
  var precioBasicoActual     = Number(document.getElementById('f-precio-basico-actual').value);

  if (!esNumeroMayorQueCero(document.getElementById('f-ingreso').value))               { mostrarErrorValidacion('El ingreso familiar mensual debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-gasto-anterior').value))        { mostrarErrorValidacion('El gasto mensual anterior debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-gasto-actual').value))          { mostrarErrorValidacion('El gasto mensual actual debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-precio-basico-anterior').value)){ mostrarErrorValidacion('El precio de canasta básica anterior debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-precio-basico-actual').value))  { mostrarErrorValidacion('El precio de canasta básica actual debe ser mayor a cero.'); return; }

  var aumentoDelGasto          = gastoActual - gastoAnterior;
  var saldoAntes               = ingresoFamiliar - gastoAnterior;
  var saldoDespues             = ingresoFamiliar - gastoActual;
  var porcentajePerdida        = ((gastoActual - gastoAnterior) / ingresoFamiliar) * 100;
  var aumentoPrecioCanasta     = ((precioBasicoActual - precioBasicoAnterior) / precioBasicoAnterior) * 100;
  var canastasCompradasAntes   = ingresoFamiliar / precioBasicoAnterior;
  var canastasCompradasAhora   = ingresoFamiliar / precioBasicoActual;
  var canastasPerdidasGeneral  = canastasCompradasAntes - canastasCompradasAhora;

  var nivelAfectacion =
    saldoDespues < 0        ? 'Crítico — El ingreso no cubre los gastos' :
    porcentajePerdida >= 20 ? 'Alto — Se pierde más del 20% del ingreso en gastos adicionales' :
    porcentajePerdida >= 10 ? 'Medio — Pérdida significativa del poder de compra' :
                              'Bajo — Impacto moderado aún manejable';

  var estadoGeneral = saldoDespues < 0 ? 'critico' : porcentajePerdida >= 10 ? 'advertencia' : 'normal';

  var contenedor = iniciarZonaResultados('▸ ESCENARIO F — Pérdida del poder adquisitivo');
  contenedor.appendChild(crearBannerEstado(estadoGeneral, nivelAfectacion));

  var grilla = document.createElement('div');
  grilla.className = 'resultado-grid';
  grilla.appendChild(crearTarjetaResultado('Ingreso familiar', formatearNumero(ingresoFamiliar, 2) + ' Bs', '', false));
  grilla.appendChild(crearTarjetaResultado('Aumento del gasto mensual', '+' + formatearNumero(aumentoDelGasto, 2) + ' Bs', 'critico', false));
  grilla.appendChild(crearTarjetaResultado('Saldo anterior', formatearNumero(saldoAntes, 2) + ' Bs', 'normal', true));
  grilla.appendChild(crearTarjetaResultado('Saldo actual', formatearNumero(saldoDespues, 2) + ' Bs', estadoGeneral, true));
  grilla.appendChild(crearTarjetaResultado('% pérdida del poder adquisitivo', formatearNumero(porcentajePerdida, 1) + '%', estadoGeneral, true));
  grilla.appendChild(crearTarjetaResultado('Aumento precio canasta básica', '+' + formatearNumero(aumentoPrecioCanasta, 1) + '%', 'advertencia', false));
  grilla.appendChild(crearTarjetaResultado('Canastas que se compraban', formatearNumero(canastasCompradasAntes, 1), 'normal', false));
  grilla.appendChild(crearTarjetaResultado('Canastas que se compran ahora', formatearNumero(canastasCompradasAhora, 1), estadoGeneral, false));
  grilla.appendChild(crearTarjetaResultado('Canastas perdidas por inflación', '-' + formatearNumero(canastasPerdidasGeneral, 1), 'critico', true));
  contenedor.appendChild(grilla);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── LIMPIEZA ── */

function limpiarFormulario(letraEscenario) {
  var panel = document.getElementById('form-' + letraEscenario);
  if (!panel) return;

  panel.querySelectorAll('input').forEach(function(input) { input.value = ''; });

  if (letraEscenario === 'B') {
    var filasB = document.getElementById('b-productos-container').querySelectorAll('.producto-row');
    filasB.forEach(function(fila, i) { i === 0 ? fila.querySelectorAll('input').forEach(function(inp) { inp.value = ''; }) : fila.remove(); });
  }
  if (letraEscenario === 'D') {
    var filasD = document.getElementById('d-items-container').querySelectorAll('.item-row');
    filasD.forEach(function(fila, i) { i === 0 ? fila.querySelectorAll('input').forEach(function(inp) { inp.value = ''; }) : fila.remove(); });
  }

  limpiarResultados();
}

function limpiarResultados() {
  document.getElementById('resultados-container').innerHTML =
    '<div class="resultado-placeholder">' +
      '<span class="placeholder-icon" aria-hidden="true">▶</span>' +
      '<p>Ingresa datos en el simulador y presiona <strong>Calcular</strong> para ver los resultados aquí.</p>' +
    '</div>';
}

/* ── CARGADORES DE CASOS DE ESTUDIO ── */

function cargarCasoA() {
  activarEscenario('A');
  document.getElementById('a-reserva-inicial').value  = 10000;
  document.getElementById('a-consumo-diario').value   = 1200;
  document.getElementById('a-reabastecimiento').value = 300;
  document.getElementById('a-nivel-critico').value    = 2000;
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cargarCasoB() {
  activarEscenario('B');
  limpiarFormulario('B');
  var datos = [
    { nombre: 'Arroz',  precioAnt: 8,  precioAct: 11, cantidad: 10 },
    { nombre: 'Papa',   precioAnt: 7,  precioAct: 10, cantidad: 8  },
    { nombre: 'Aceite', precioAnt: 12, precioAct: 18, cantidad: 4  }
  ];
  for (var i = 1; i < datos.length; i++) agregarProducto();
  var filas = document.getElementById('b-productos-container').querySelectorAll('.producto-row');
  datos.forEach(function(d, idx) {
    filas[idx].querySelector('.b-producto').value        = d.nombre;
    filas[idx].querySelector('.b-precio-anterior').value = d.precioAnt;
    filas[idx].querySelector('.b-precio-actual').value   = d.precioAct;
    filas[idx].querySelector('.b-cantidad').value        = d.cantidad;
  });
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cargarCasoC() {
  activarEscenario('C');
  document.getElementById('c-distancia-normal').value = 10;
  document.getElementById('c-distancia-desvio').value = 16;
  document.getElementById('c-costo-km').value         = 2;
  document.getElementById('c-viajes-semana').value    = 5;
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cargarCasoD() {
  activarEscenario('D');
  limpiarFormulario('D');
  document.getElementById('d-presupuesto').value = 500;
  var primera = document.getElementById('d-items-container').querySelector('.item-row');
  primera.querySelector('.d-item-nombre').value    = 'Compra total (caso de estudio)';
  primera.querySelector('.d-item-precio').value    = 580;
  primera.querySelector('.d-item-cantidad').value  = 1;
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cargarCasoE() {
  activarEscenario('E');
  document.getElementById('e-producto').value           = 'Azúcar';
  document.getElementById('e-demanda-normal').value     = 100;
  document.getElementById('e-aumento-porcentaje').value = 40;
  document.getElementById('e-stock').value              = 120;
  document.getElementById('e-familias').value           = 50;
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cargarCasoF() {
  activarEscenario('F');
  document.getElementById('f-ingreso').value                = 3000;
  document.getElementById('f-gasto-anterior').value         = 1800;
  document.getElementById('f-gasto-actual').value           = 2400;
  document.getElementById('f-precio-basico-anterior').value = 500;
  document.getElementById('f-precio-basico-actual').value   = 680;
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── INICIALIZACIÓN ── */

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.esc-btn').forEach(function(boton) {
    boton.addEventListener('click', function() {
      activarEscenario(boton.getAttribute('data-escenario'));
    });
  });
});