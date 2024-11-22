function calcularTasaCorte(proyecto1, proyecto2) {
    if (!proyecto2) {
        return {
            error: true,
            procedimiento: "Se necesitan dos proyectos para realizar el análisis."
        };
    }

    let procedimiento = "Calculamos la TIR del flujo diferencial, de esta manera podemos encontrar la tasa de corte de la decisión:\n\n";
    
    // Mostrar la ecuación general
    procedimiento += "VAN = FC0 + FC1/(1+TIR)^1 + FC2/(1+TIR)^2 + FC3/(1+TIR)^3 + FC4/(1+TIR)^4 + FC5/(1+TIR)^5 = 0.00\n\n";
    
    // Mostrar la ecuación con la diferencia de flujos
    procedimiento += "VAN = ";
    procedimiento += `(${proyecto1.flujoInicial.toFixed(2)} - (${proyecto2.flujoInicial.toFixed(2)}))`;
    
    proyecto1.flujosPosteriores.forEach((flujo, index) => {
        const flujo2 = proyecto2.flujosPosteriores[index];
        procedimiento += ` + (${flujo.toFixed(2)} - (${flujo2.toFixed(2)}))/(1+TIR)^${index + 1}`;
    });
    procedimiento += " = 0.00\n\n";

    // Calcular y mostrar la ecuación simplificada
    const flujo0Diferencial = proyecto1.flujoInicial - proyecto2.flujoInicial;
    const flujosDiferenciales = proyecto1.flujosPosteriores.map((flujo, index) => 
        flujo - proyecto2.flujosPosteriores[index]
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
    
    procedimiento += `Es a partir de ese COK que podríamos cambiar de opinión`;

    return {
        procedimiento: procedimiento,
        tirDiferencial: tirDiferencial
    };
} 