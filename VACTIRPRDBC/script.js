let contadorFlujos = 0;
let proyectos = [];

document.getElementById('agregarFlujo').addEventListener('click', agregarFlujo);
document.getElementById('calcular').addEventListener('click', calcularVAN);
document.getElementById('nuevoProyecto').addEventListener('click', crearNuevoProyecto);

function agregarFlujo() {
    contadorFlujos++;
    const flujosContainer = document.getElementById('flujos-container');
    
    const flujoDiv = document.createElement('div');
    flujoDiv.className = 'flujo-input';
    flujoDiv.innerHTML = `
        <div class="input-group">
            <label>Flujo ${contadorFlujos}:</label>
            <input type="number" class="flujo" step="0.01" placeholder="5600">
        </div>
        <button class="eliminar-flujo" onclick="eliminarFlujo(this)">×</button>
    `;
    
    flujosContainer.appendChild(flujoDiv);
}

function eliminarFlujo(button) {
    button.parentElement.remove();
    actualizarNumeracionFlujos();
}

function actualizarNumeracionFlujos() {
    const flujos = document.querySelectorAll('.flujo-input');
    flujos.forEach((flujo, index) => {
        flujo.querySelector('label').textContent = `Flujo ${index + 1}:`;
    });
    contadorFlujos = flujos.length;
}

function calcularVAN() {
    const nombreProyecto = document.getElementById('nombre-proyecto').value;
    if (!nombreProyecto) {
        alert('Por favor, ingrese un nombre para el proyecto');
        return;
    }

    const flujo0 = parseFloat(document.getElementById('flujo0').value);
    const tasa = parseFloat(document.getElementById('tasa').value) / 100;
    const flujos = Array.from(document.getElementsByClassName('flujo'))
                       .map(input => parseFloat(input.value));
    
    if (isNaN(flujo0) || isNaN(tasa) || flujos.some(isNaN)) {
        alert('Por favor, complete todos los campos correctamente');
        return;
    }

    let procedimiento = `VAN = ${flujo0}`;
    let van = flujo0;
    let detalles = [`VAN = ${flujo0}`];
    let sumaValoresPresentes = 0;
    let valoresPresentes = [];

    flujos.forEach((flujo, index) => {
        const exponente = index + 1;
        const denominador = Math.pow(1 + tasa, exponente);
        const valorPresente = flujo / denominador;
        valoresPresentes.push(valorPresente);
        sumaValoresPresentes += valorPresente;
        
        procedimiento += ` + ${flujo}/(1+${(tasa*100)}%)^${exponente}`;
        detalles.push(`${flujo}/(1+${(tasa*100)}%)^${exponente} = ${valorPresente.toFixed(10)}`);
    });

    van = flujo0 + sumaValoresPresentes;

    detalles.push(`\nSuma de valores presentes = ${sumaValoresPresentes.toFixed(10)}`);
    detalles.push(`VAN = ${flujo0} + ${sumaValoresPresentes.toFixed(10)}`);

    proyectos.push({
        nombre: nombreProyecto,
        van: van,
        procedimiento: procedimiento,
        detalles: detalles,
        flujoInicial: flujo0,
        flujosPosteriores: flujos,
        tasa: tasa,
        valoresPresentes: valoresPresentes,
        sumaValoresPresentes: sumaValoresPresentes
    });

    actualizarComparacion();
    limpiarFormulario();
}

function actualizarComparacion() {
    const listaProyectos = document.getElementById('lista-proyectos');
    const mejorProyecto = document.getElementById('mejor-proyecto');
    
    listaProyectos.innerHTML = '';
    proyectos.forEach((proyecto, index) => {
        listaProyectos.innerHTML += `
            <div class="proyecto-resultado" onclick="mostrarProcedimiento(${index})">
                <strong>${proyecto.nombre}</strong>: VAN = ${proyecto.van.toFixed(10)}
                <div class="procedimiento-proyecto" id="procedimiento-${index}" style="display: none;">
                    <div class="procedimiento">
                        <h3>Procedimiento VAN:</h3>
                        <p>${proyecto.procedimiento}</p>
                        <h3>Desglose:</h3>
                        <p>${proyecto.detalles.join('<br>')}</p>
                        <h3>VAN Final = ${proyecto.van.toFixed(10)}</h3>
                        <div class="botones-calculo">
                            <button onclick="calcularTIRProyecto(${index}, event)" class="calcular-tir">Calcular TIR</button>
                            <button onclick="calcularBCProyecto(${index}, event)" class="calcular-bc">Calcular B/C</button>
                            <button onclick="calcularPRDProyecto(${index}, event)" class="calcular-prd">Calcular PRD</button>
                            <div class="grupo-analisis">
                                <button onclick="mostrarAnalisisSensibilidad(${index}, event)" class="calcular-sensibilidad">Análisis con Nueva Tasa</button>
                                <button onclick="mostrarTasaCorte(${index}, event)" class="calcular-tasa-corte">Tasa de Cambio de Decisión</button>
                            </div>
                        </div>
                        <div id="tir-resultado-${index}" class="tir-resultado"></div>
                        <div id="bc-resultado-${index}" class="bc-resultado"></div>
                        <div id="prd-resultado-${index}" class="prd-resultado"></div>
                        <div id="sensibilidad-resultado-${index}" class="sensibilidad-resultado"></div>
                        <div id="tasa-corte-resultado-${index}" class="tasa-corte-resultado"></div>
                    </div>
                </div>
            </div>
        `;
    });

    if (proyectos.length > 0) {
        const mejor = proyectos.reduce((prev, current) => 
            (prev.van > current.van) ? prev : current
        );
        
        mejorProyecto.innerHTML = `
            <p>El mejor proyecto es: ${mejor.nombre}</p>
            <p>VAN = ${mejor.van.toFixed(10)}</p>
        `;
    }
}

function mostrarProcedimiento(index) {
    const procedimiento = document.getElementById(`procedimiento-${index}`);
    
    const estaVisible = procedimiento.style.display === 'block';
    
    document.querySelectorAll('.procedimiento-proyecto').forEach(elem => {
        elem.style.display = 'none';
    });
    
    if (!estaVisible) {
        procedimiento.style.display = 'block';
    }
}

function limpiarFormulario() {
    document.getElementById('nombre-proyecto').value = '';
    document.getElementById('flujo0').value = '';
    document.getElementById('tasa').value = '';
    document.getElementById('flujos-container').innerHTML = '';
    contadorFlujos = 0;
}

function crearNuevoProyecto() {
    limpiarFormulario();
}

function calcularTIRProyecto(index, event) {
    event.stopPropagation();
    const proyecto = proyectos[index];
    const resultado = mostrarCalculoTIR(proyecto);
    
    const tirResultado = document.getElementById(`tir-resultado-${index}`);
    tirResultado.innerHTML = `
        <div class="tir-calculo">
            <h3>Cálculo de TIR:</h3>
            <pre>${resultado.procedimiento}</pre>
        </div>
    `;
}

function calcularBCProyecto(index, event) {
    event.stopPropagation();
    const proyecto = proyectos[index];
    const resultado = calcularBC(proyecto);
    
    const bcResultado = document.getElementById(`bc-resultado-${index}`);
    bcResultado.innerHTML = `
        <div class="bc-calculo">
            <h3>Cálculo de B/C:</h3>
            <pre>${resultado.procedimiento}</pre>
        </div>
    `;
}

function calcularPRDProyecto(index, event) {
    event.stopPropagation();
    const proyecto = proyectos[index];
    const resultado = calcularPRD(proyecto);
    
    const prdResultado = document.getElementById(`prd-resultado-${index}`);
    prdResultado.innerHTML = `
        <div class="prd-calculo">
            <h3>Cálculo de PRD:</h3>
            <pre>${resultado.procedimiento}</pre>
        </div>
    `;
}

function mostrarAnalisisSensibilidad(index, event) {
    event.stopPropagation();
    
    // Primero, mostrar lista de proyectos para comparar
    const proyecto1 = proyectos[index];
    const otrosProyectos = proyectos.filter((p, i) => i !== index);
    
    if (otrosProyectos.length === 0) {
        alert("Necesita tener al menos otro proyecto para realizar el análisis de sensibilidad");
        return;
    }

    let seleccionHTML = "Seleccione el proyecto para comparar:\n\n";
    otrosProyectos.forEach((proyecto, i) => {
        seleccionHTML += `${i + 1}) ${proyecto.nombre}\n`;
    });

    const seleccion = prompt(seleccionHTML + "\nIngrese el número del proyecto:");
    if (!seleccion || isNaN(seleccion) || seleccion < 1 || seleccion > otrosProyectos.length) {
        return;
    }

    const proyecto2 = otrosProyectos[seleccion - 1];
    
    // Luego pedir la nueva tasa
    const nuevaTasa = prompt("Ingrese la nueva tasa de descuento (%):");
    if (!nuevaTasa) return;

    const resultado = calcularAnalisisSensibilidad(
        proyecto1, 
        proyecto2, 
        parseFloat(nuevaTasa) / 100
    );
    
    const sensibilidadResultado = document.getElementById(`sensibilidad-resultado-${index}`);
    sensibilidadResultado.innerHTML = `
        <div class="sensibilidad-calculo">
            <h3>Análisis de Sensibilidad entre ${proyecto1.nombre} y ${proyecto2.nombre}:</h3>
            <pre>${resultado.procedimiento}</pre>
        </div>
    `;
}

function mostrarTasaCorte(index, event) {
    event.stopPropagation();
    
    const proyecto1 = proyectos[index];
    const otrosProyectos = proyectos.filter((p, i) => i !== index);
    
    if (otrosProyectos.length === 0) {
        alert("Necesita tener al menos otro proyecto para realizar el análisis");
        return;
    }

    let seleccionHTML = "Seleccione el proyecto para comparar:\n\n";
    otrosProyectos.forEach((proyecto, i) => {
        seleccionHTML += `${i + 1}) ${proyecto.nombre}\n`;
    });

    const seleccion = prompt(seleccionHTML + "\nIngrese el número del proyecto:");
    if (!seleccion || isNaN(seleccion) || seleccion < 1 || seleccion > otrosProyectos.length) {
        return;
    }

    const proyecto2 = otrosProyectos[seleccion - 1];
    const resultado = calcularTasaCorte(proyecto1, proyecto2);
    
    const tasaCorteResultado = document.getElementById(`tasa-corte-resultado-${index}`);
    tasaCorteResultado.innerHTML = `
        <div class="tasa-corte-calculo">
            <h3>Análisis de Tasa de Corte entre ${proyecto1.nombre} y ${proyecto2.nombre}:</h3>
            <pre>${resultado.procedimiento}</pre>
        </div>
    `;
} 