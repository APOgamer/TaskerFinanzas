function calcularAnalisisSensibilidad(proyecto1, proyecto2, nuevaTasa) {
    if (!proyecto2) {
        return {
            error: true,
            procedimiento: "Se necesitan dos proyectos para realizar el análisis de sensibilidad."
        };
    }

    // Asegurarnos de que proyecto1 tenga la mayor inversión inicial (en valor absoluto)
    let proyectoMayor, proyectoMenor;
    if (Math.abs(proyecto1.flujoInicial) > Math.abs(proyecto2.flujoInicial)) {
        proyectoMayor = proyecto1;
        proyectoMenor = proyecto2;
    } else {
        proyectoMayor = proyecto2;
        proyectoMenor = proyecto1;
    }

    let procedimiento = "Calculamos la TIR del flujo diferencial para encontrar la tasa de corte de la decisión:\n\n";
    
    // Mostrar la ecuación general
    procedimiento += "VAN = FC0 + FC1/(1+TIR)^1 + FC2/(1+TIR)^2 + FC3/(1+TIR)^3 + FC4/(1+TIR)^4 + FC5/(1+TIR)^5 = 0.00\n\n";
    
    // Mostrar la ecuación con la diferencia de flujos
    procedimiento += "VAN = ";
    procedimiento += `(${proyectoMayor.flujoInicial.toFixed(2)} - (${proyectoMenor.flujoInicial.toFixed(2)}))`;
    
    proyectoMayor.flujosPosteriores.forEach((flujo, index) => {
        const flujo2 = proyectoMenor.flujosPosteriores[index];
        procedimiento += ` + (${flujo.toFixed(2)} - (${flujo2.toFixed(2)}))/(1+TIR)^${index + 1}`;
    });
    procedimiento += " = 0.00\n\n";

    // Calcular y mostrar la ecuación simplificada
    const flujo0Diferencial = proyectoMayor.flujoInicial - proyectoMenor.flujoInicial;
    const flujosDiferenciales = proyectoMayor.flujosPosteriores.map((flujo, index) => 
        flujo - proyectoMenor.flujosPosteriores[index]
    );

    procedimiento += "VAN = ";
    procedimiento += `${flujo0Diferencial.toFixed(2)}`;
    flujosDiferenciales.forEach((flujo, index) => {
        procedimiento += ` + ${flujo.toFixed(2)}/(1+TIR)^${index + 1}`;
    });
    procedimiento += " = 0.00\n\n";

    // Calcular TIR del flujo diferencial
    const flujosTotales = [flujo0Diferencial, ...flujosDiferenciales];
    const tirDiferencial = calcularTIR(flujosTotales);
    
    procedimiento += `Utilizando el algoritmo de iteraciones sucesivas encontramos que la TIR es:\n`;
    procedimiento += `TIR = ${(tirDiferencial * 100).toFixed(7)}%\n\n`;
    
    procedimiento += `Es a partir de ese COK que podríamos cambiar de opinión.\n\n`;
    
    // Comparar con la nueva tasa
    const tasaPorcentaje = (nuevaTasa * 100).toFixed(7);
    const tirPorcentaje = (tirDiferencial * 100).toFixed(7);
    
    if (nuevaTasa > tirDiferencial) {
        procedimiento += `Como la tasa de descuento equivalente es COK = ${tasaPorcentaje}% > Tasa de corte = ${tirPorcentaje}%, `;
        procedimiento += `SÍ cambiaríamos de opinión y deberíamos elegir el proyecto ${proyectoMenor.nombre} que tiene menor inversión inicial.`;
    } else {
        procedimiento += `Como la tasa de descuento equivalente es COK = ${tasaPorcentaje}% < Tasa de corte = ${tirPorcentaje}%, `;
        procedimiento += `NO cambiaríamos de opinión y mantendríamos la decisión de elegir el proyecto ${proyectoMayor.nombre}.`;
    }

    return {
        procedimiento: procedimiento,
        tirDiferencial: tirDiferencial,
        cambiaria: nuevaTasa > tirDiferencial
    };
} 