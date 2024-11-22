function calcularPRD(proyecto) {
    const flujoInicial = proyecto.flujoInicial;
    const flujos = proyecto.flujosPosteriores;
    const tasa = proyecto.tasa;
    let procedimiento = '';
    let vanes = [];
    
    // Calcular los valores presentes de cada flujo
    let valoresPresentes = flujos.map((flujo, index) => {
        return flujo / Math.pow(1 + tasa, index + 1);
    });

    // Calcular VAN acumulado para cada periodo
    let vanAcumulado = flujoInicial; // Comenzamos con la inversión inicial
    vanes.push(vanAcumulado); // VAN en t=0
    procedimiento += `VAN en (t=0) = ${flujoInicial.toFixed(2)}`;
    
    for (let i = 0; i < valoresPresentes.length; i++) {
        procedimiento += ` + ${valoresPresentes[i].toFixed(2)}`;
    }
    procedimiento += ` = ${vanAcumulado.toFixed(2)}\n`;

    // Calcular VAN para cada periodo siguiente
    for (let t = 1; t <= flujos.length; t++) {
        vanAcumulado = flujoInicial; // Reiniciar con la inversión inicial
        for (let i = 0; i < t; i++) {
            vanAcumulado += valoresPresentes[i]; // Sumar valores presentes hasta el periodo t
        }
        vanes.push(vanAcumulado);
        
        procedimiento += `VAN en (t=${t}) = ${vanAcumulado.toFixed(2)}`;
        for (let i = t; i < valoresPresentes.length; i++) {
            procedimiento += ` + ${valoresPresentes[i].toFixed(2)}`;
        }
        procedimiento += ` = ${(vanAcumulado + valoresPresentes.slice(t).reduce((a, b) => a + b, 0)).toFixed(2)}\n`;
    }

    // Encontrar el punto de cambio de signo
    let puntoAntes, puntoDespues;
    for (let i = 0; i < vanes.length - 1; i++) {
        if (vanes[i] < 0 && vanes[i + 1] > 0) {
            puntoAntes = { x: i, y: vanes[i] };
            puntoDespues = { x: i + 1, y: vanes[i + 1] };
            break;
        }
    }

    if (!puntoAntes || !puntoDespues) {
        return {
            error: true,
            procedimiento: "No se encontró un punto de recuperación de la inversión\n" +
                         "VAN en cada periodo:\n" + 
                         vanes.map((van, i) => `t=${i}: ${van.toFixed(2)}`).join('\n')
        };
    }

    // Calcular PRD usando interpolación lineal
    procedimiento += `\nAhora usaremos la geometría descriptiva para el trazado de recta que une los puntos en donde existe el cambio de signo (recuperamos lo invertido)\n`;
    procedimiento += `Para ello, suponemos que el eje X es el eje del tiempo y el Y es el eje del VAN, por lo que:\n`;
    procedimiento += `P1 = (X1, Y1) = (${puntoAntes.x}, ${puntoAntes.y.toFixed(2)})\n`;
    procedimiento += `P2 = (X2, Y2) = (${puntoDespues.x}, ${puntoDespues.y.toFixed(2)})\n\n`;

    const pendiente = (puntoDespues.y - puntoAntes.y);
    procedimiento += `Luego, la pendiente de la recta que une los puntos extremos se podría expresar como:\n`;
    procedimiento += `m = (Y2 - Y1)/(X2 - X1)\n`;
    procedimiento += `m = (${puntoDespues.y.toFixed(2)} - (${puntoAntes.y.toFixed(2)}))/(${puntoDespues.x} - ${puntoAntes.x})\n`;
    procedimiento += `m = ${pendiente.toFixed(2)}\n\n`;

    procedimiento += `Ahora bien, como el punto P3 se define como:\n`;
    procedimiento += `P3 = (X3, Y3) = (PRD, 0)\n`;
    procedimiento += `m = (Y3 - Y2)/(X3 - X2) = (0 - (${puntoDespues.y.toFixed(2)}))/(PRD - ${puntoDespues.x}) = ${pendiente.toFixed(2)}\n`;
    procedimiento += `${pendiente.toFixed(2)} = (0 - (${puntoDespues.y.toFixed(2)}))/(PRD - ${puntoDespues.x})\n`;

    const prd = puntoDespues.x - (puntoDespues.y / pendiente);
    
    // Convertir PRD a años, meses y días con mayor precisión
    const años = Math.floor(prd);
    const mesesDecimal = (prd - años) * 12;
    const meses = Math.floor(mesesDecimal);
    // Usar 30.436875 días por mes (365.24/12) para mayor precisión
    const dias = Math.round((mesesDecimal - meses) * 30.436875);

    procedimiento += `\nDespejando encontramos que:\n`;
    procedimiento += `PRD = ${prd.toFixed(3)} años\n`;
    procedimiento += `PRD = ${años} años, ${meses} meses, ${dias} días`;

    return {
        prd: prd,
        procedimiento: procedimiento,
        años: años,
        meses: meses,
        dias: dias
    };
} 