function calcularTIR(flujos, precision = 0.0000001) {
    let tirBajo = -0.99;
    let tirAlto = 10.0;
    let tirMedio;
    let van;
    
    // Método de bisección para encontrar la TIR
    while ((tirAlto - tirBajo) > precision) {
        tirMedio = (tirAlto + tirBajo) / 2;
        van = calcularVANconTasa(flujos, tirMedio);
        
        if (van > 0) {
            tirBajo = tirMedio;
        } else {
            tirAlto = tirMedio;
        }
    }
    
    return tirMedio;
}

function calcularVANconTasa(flujos, tasa) {
    return flujos.reduce((acc, flujo, index) => {
        return acc + flujo / Math.pow(1 + tasa, index);
    }, 0);
}

function mostrarCalculoTIR(proyecto) {
    const flujos = [proyecto.flujoInicial, ...proyecto.flujosPosteriores];
    const tir = calcularTIR(flujos);
    const tirPorcentaje = (tir * 100).toFixed(7);
    const cokPorcentaje = proyecto.tasa * 100;
    
    let procedimiento = 'Cálculo de la TIR:\n';
    procedimiento += 'VAN = ';
    
    // Construir la ecuación
    flujos.forEach((flujo, index) => {
        if (index === 0) {
            procedimiento += `${flujo.toFixed(2)}`;
        } else {
            procedimiento += ` + ${flujo.toFixed(2)}/(1+TIR)^${index}`;
        }
    });
    procedimiento += ' = 0.00\n\n';
    
    // Resultado y comparación
    procedimiento += `TIR = ${tirPorcentaje}% ${tirPorcentaje > cokPorcentaje ? '>' : '<'} ${cokPorcentaje.toFixed(7)}%\n`;
    procedimiento += `Como la TIR es ${tirPorcentaje > cokPorcentaje ? 'mayor' : 'menor'} al COK, entonces ${tirPorcentaje > cokPorcentaje ? 'conviene' : 'no conviene'} realizar el proyecto`;
    
    return {
        tir: tirPorcentaje,
        procedimiento: procedimiento,
        conviene: tirPorcentaje > cokPorcentaje
    };
} 