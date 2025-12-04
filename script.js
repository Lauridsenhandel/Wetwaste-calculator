document.addEventListener('DOMContentLoaded', function () {
    // Inputs
    const inputs = {
        wasteAmount: document.getElementById('waste-amount'),
        handlingTime: document.getElementById('handling-time'),
        hourlyWage: document.getElementById('hourly-wage'),
        hasCooling: document.getElementById('has-cooling'),
        hasFatSeparator: document.getElementById('has-fat-separator'),
        otherExpenses: document.getElementById('other-expenses'),
        address: document.getElementById('address'),

        // Cooling Details
        coolingKwh: document.getElementById('cooling-kwh'),
        coolingHours: document.getElementById('cooling-hours'),
        coolingDays: document.getElementById('cooling-days'),
        kwhPrice: document.getElementById('kwh-price'),

        // Disposal Details
        binVolume: document.getElementById('bin-volume'),
        binsEmptiedDaily: document.getElementById('bins-emptied-daily'),
        emptyingPrice: document.getElementById('emptying-price'),
        workingDays: document.getElementById('working-days')
    };

    // Sections to toggle
    const coolingDetailsSection = document.getElementById('cooling-details');
    const coolingCostRow = document.getElementById('cooling-cost-row');

    // Outputs
    const outputs = {
        totalAnnualCost: document.getElementById('total-annual-cost'),
        laborCost: document.getElementById('labor-cost'),
        disposalCost: document.getElementById('disposal-cost'),
        coolingCost: document.getElementById('cooling-cost'),
        otherCost: document.getElementById('other-cost'),
        co2Savings: document.getElementById('co2-savings'),
        transportInfo: document.getElementById('transport-co2-info'),
        transportDist: document.getElementById('transport-dist'),
        biogasName: document.getElementById('biogas-name')
    };

    // Biogas Plants (Representative list of major Danish plants)
    const biogasPlants = [
        { name: "Nature Energy Fyn", lat: 55.395, lon: 10.388 }, // Odense
        { name: "Nature Energy Korskro", lat: 55.518, lon: 8.578 }, // Esbjerg
        { name: "Nature Energy Månsson", lat: 55.955, lon: 9.135 }, // Brande
        { name: "Nature Energy Holsted", lat: 55.510, lon: 8.900 }, // Holsted
        { name: "Nature Energy Nordfyn", lat: 55.535, lon: 10.150 }, // Bogense
        { name: "Nature Energy Midtfyn", lat: 55.280, lon: 10.450 }, // Ringe
        { name: "Lemvig Biogas", lat: 56.535, lon: 8.285 }, // Lemvig
        { name: "Morsø Bioenergi", lat: 56.820, lon: 8.700 }, // Nykøbing Mors
        { name: "Solrød Biogas", lat: 55.530, lon: 12.180 }, // Solrød Strand
        { name: "Hashøj Biogas", lat: 55.350, lon: 11.350 }, // Dalmose
        { name: "Bornholms Bioenergi", lat: 55.070, lon: 14.920 } // Aakirkeby
    ];

    let transportDistanceKm = 0;
    let nearestPlantName = "";

    // Add event listeners to all inputs
    Object.values(inputs).forEach(input => {
        if (input) {
            input.addEventListener('input', calculate);
            input.addEventListener('change', calculate);
        }
    });

    // Address Geocoding with Debounce
    let timeoutId;
    inputs.address.addEventListener('input', function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(geocodeAddress, 1000); // Wait 1s after typing stops
    });

    async function geocodeAddress() {
        const address = inputs.address.value;
        if (address.length < 5) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Denmark")}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const userLat = parseFloat(data[0].lat);
                const userLon = parseFloat(data[0].lon);
                findNearestPlant(userLat, userLon);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    }

    async function findNearestPlant(lat, lon) {
        let minDist = Infinity;
        let nearest = null;

        // 1. First find the geometrically closest plant to minimize API calls
        biogasPlants.forEach(plant => {
            const dist = getDistanceFromLatLonInKm(lat, lon, plant.lat, plant.lon);
            if (dist < minDist) {
                minDist = dist;
                nearest = plant;
            }
        });

        if (nearest) {
            nearestPlantName = nearest.name;

            // 2. Get actual road distance using OSRM
            try {
                const roadDist = await getRoadDistance(lon, lat, nearest.lon, nearest.lat);
                transportDistanceKm = Math.round(roadDist / 1000); // Convert meters to km
            } catch (error) {
                console.warn("Routing failed, falling back to estimate:", error);
                transportDistanceKm = Math.round(minDist * 1.2); // Fallback
            }

            if (outputs.transportInfo) {
                outputs.transportInfo.style.display = 'block';
                outputs.transportDist.textContent = transportDistanceKm;
                outputs.biogasName.textContent = nearestPlantName;
            }
            calculate();
        }
    }

    async function getRoadDistance(lon1, lat1, lon2, lat2) {
        // Using OSRM public demo server
        const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            return data.routes[0].distance; // Returns distance in meters
        }
        throw new Error("No route found");
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function calculate() {
        // 1. Toggle Visibility
        if (inputs.hasCooling.checked) {
            coolingDetailsSection.style.display = 'block';
            coolingCostRow.style.display = 'flex';
        } else {
            coolingDetailsSection.style.display = 'none';
            coolingCostRow.style.display = 'none';
        }

        // 2. Get Values
        const wasteAmount = parseFloat(inputs.wasteAmount.value) || 0;
        const handlingTime = parseFloat(inputs.handlingTime.value) || 0;
        const hourlyWage = parseFloat(inputs.hourlyWage.value) || 0;
        const workingDays = parseFloat(inputs.workingDays.value) || 260;

        const otherExpenses = parseFloat(inputs.otherExpenses.value) || 0;

        // 3. Calculate Labor Cost
        const laborCost = handlingTime * workingDays * hourlyWage;

        // 4. Calculate Cooling Cost
        let coolingCost = 0;
        if (inputs.hasCooling.checked) {
            const kwh = parseFloat(inputs.coolingKwh.value) || 0;
            const hours = parseFloat(inputs.coolingHours.value) || 0;
            const days = parseFloat(inputs.coolingDays.value) || 0;
            const price = parseFloat(inputs.kwhPrice.value) || 0;

            coolingCost = kwh * hours * days * price;
        }

        // 5. Calculate Disposal Cost
        const binsDaily = parseFloat(inputs.binsEmptiedDaily.value) || 0;
        const pricePerEmptying = parseFloat(inputs.emptyingPrice.value) || 0;

        const disposalCost = binsDaily * pricePerEmptying * workingDays;

        // 6. Total
        const totalCost = laborCost + coolingCost + disposalCost + otherExpenses;

        // 7. Calculate CO2 Savings
        // Base Savings: 0.37 kg CO2 per kg waste
        let co2SavingsKg = wasteAmount * 0.37;

        // Transport Emissions Deduction
        // Factor: 100g CO2 per ton-km (0.1 kg CO2 / ton / km)
        if (transportDistanceKm > 0) {
            const transportEmissions = (wasteAmount / 1000) * transportDistanceKm * 0.1;
            co2SavingsKg -= transportEmissions;
        }

        const co2SavingsTons = co2SavingsKg / 1000;

        // 8. Update UI
        outputs.laborCost.textContent = formatCurrency(laborCost);
        outputs.coolingCost.textContent = formatCurrency(coolingCost);
        outputs.disposalCost.textContent = formatCurrency(disposalCost);
        outputs.otherCost.textContent = formatCurrency(otherExpenses);

        outputs.totalAnnualCost.textContent = formatNumber(totalCost);
        if (outputs.co2Savings) {
            outputs.co2Savings.textContent = co2SavingsTons.toFixed(2);
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(amount);
    }

    function formatNumber(number) {
        return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(number);
    }

    // Smart update for waste amount
    inputs.wasteAmount.addEventListener('change', function () {
        const amount = parseInt(this.value);
        const bins = (amount / 260) / 60;
        inputs.binsEmptiedDaily.value = Math.max(1, Math.round(bins * 10) / 10);
        calculate();
    });

    // Initial calculation
    calculate();
});
