document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay un usuario logueado
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/'; // Redirigir al inicio si no hay usuario
        return;
    }

    // Obtener el factor de descuento del usuario
    const factorDescuento = user.factorDescuento;
    console.log('Factor de descuento del usuario:', factorDescuento);

    document.getElementById('calculatorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores
        const width = parseFloat(document.getElementById('width').value);
        const height = parseFloat(document.getElementById('height').value);
        const installationHours = parseFloat(document.getElementById('installationHours').value);
     
        // Inicializar variables
        let linearMeters;
        let areaUsed;
        let squareMeters;
        let utilization;
        let utilizationValue;

        // Cálculos para metros lineales
// Cálculos para metros lineales
        if (width < 1.5 || height < 1.5) {
            // Si ambos son menores a 1.5, usamos el valor menor
            linearMeters = Math.min(width, height);
            console.log(`Ambos < 1.5: usando el menor valor = ${linearMeters}`);
        } else if (width > 1.5 || height > 1.5) {
            // Si alguno es > 1.5, usamos el valor mayor
            linearMeters = Math.max(width, height);
            console.log(`Alguno > 1.5: usando el mayor valor = ${linearMeters}`);
        }
     
  
        // Convertir metros lineales a metros cuadrados
        squareMeters = linearMeters * 1.5;
     
        // Calcular el área utilizada
        utilization = width * height;
     
        // Calcular el aprovechamiento en metros cuadrados
        areaUsed = squareMeters - utilization;
     
        // Calcular el valor de aprovechamiento
        utilizationValue = areaUsed * 247000;
     
        // Cálculos de costos
        const materialCost = linearMeters * 370000;
        const risk = materialCost * 0.10;
        const labor = installationHours * 35000;
        const approximation = linearMeters * 50000;
        const discountOnUtilization = -utilizationValue * 0.70;
     
        // Usar el factor de descuento del usuario
        const totalPlantillaSinInstalar = (materialCost + risk + approximation + discountOnUtilization) / factorDescuento;
        const totalPlantillaInstalada = (materialCost + risk + labor + approximation + discountOnUtilization) / factorDescuento;
     
        // Mostrar resultados
        document.getElementById('results').classList.remove('d-none');
        document.getElementById('linearMeters').textContent = `${linearMeters.toFixed(2)} m`;
        document.getElementById('squareMeters').textContent = `${squareMeters.toFixed(2)} m²`;
        document.getElementById('areaUsed').textContent = `${utilization.toFixed(2)} m²`;
        document.getElementById('utilization').textContent = `${areaUsed.toFixed(2)} m²`;
        document.getElementById('utilizationValue').textContent = `$${utilizationValue.toLocaleString()}`;
        document.getElementById('materialPrice').textContent = `$${materialCost.toLocaleString()}`;
        document.getElementById('risk').textContent = `$${risk.toLocaleString()}`;
        document.getElementById('labor').textContent = `$${labor.toLocaleString()}`;
        document.getElementById('approximation').textContent = `$${approximation.toLocaleString()}`;
        document.getElementById('discountOnUtilization').textContent = `$${discountOnUtilization.toLocaleString()}`;
        document.getElementById('totalPlantillaSinInstalar').textContent = `$${totalPlantillaSinInstalar.toLocaleString()}`;
        document.getElementById('totalPlantillaInstalada').textContent = `$${totalPlantillaInstalada.toLocaleString()}`;
    });
});