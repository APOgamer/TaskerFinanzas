function calcularBC(proyecto) {
    const flujos = proyecto.flujosPosteriores;
    const tasa = proyecto.tasa;
    const inversionAbsoluta = Math.abs(proyecto.flujoInicial);
    let sumaValoresPresentes = 0;
    
    // Calcular la suma de los valores presentes de los flujos
    flujos.forEach((flujo, index) => {
        const exponente = index + 1;
        const denominador = Math.pow(1 + tasa, exponente);
        const valorPresente = flujo / denominador;
        sumaValoresPresentes += valorPresente;
    });
    
    const bc = sumaValoresPresentes / inversionAbsoluta;
    
    // Construir el procedimiento
    let procedimiento = 'B/C = ( ';
    
    // Primera parte de la fórmula (numerador)
    flujos.forEach((flujo, index) => {
        if (index > 0) procedimiento += ' + ';
        procedimiento += `${flujo.toFixed(2)}/(1+${(tasa*100).toString()}%)^${index + 1}`;
    });
    
    procedimiento += ` ) / | ${proyecto.flujoInicial.toFixed(2)} |\n`;
    procedimiento += `B/C = ${sumaValoresPresentes.toFixed(2)} / ${inversionAbsoluta.toFixed(2)}\n`;
    procedimiento += `B/C = ${bc.toFixed(7)} ${bc > 1 ? '> 1' : '< 1'}\n`;
    procedimiento += `Como B/C es ${bc > 1 ? 'mayor' : 'menor'} a uno, entonces ${bc > 1 ? 'conviene' : 'no conviene'}`;
    
    return {
        bc: bc,
        procedimiento: procedimiento,
        conviene: bc > 1
    };
} 