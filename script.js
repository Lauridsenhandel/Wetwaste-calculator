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
        emptyingPrice: document.getElementById('emptying-price'),
        workingDays: document.getElementById('working-days'),
        annualPickups: document.getElementById('annual-pickups')
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
        const workingDays = parseFloat(inputs.workingDays.value) || 260; // Now from General section

        const otherExpenses = parseFloat(inputs.otherExpenses.value) || 0;

        // 3. Calculate Labor Cost
        // Labor cost depends on working days
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
        // Disposal cost now depends on # of pickups per year, NOT working days
        // User requested formula: Price per emptying * annual pickups
        // We do NOT multiply by bins here (assuming price is per pickup event)
        const pricePerEmptying = parseFloat(inputs.emptyingPrice.value) || 0;
        const annualPickups = parseFloat(inputs.annualPickups.value) || 52;

        // const binsPerPickup = parseFloat(inputs.binsEmptiedDaily.value) || 0;
        // The user explicitly stated: "Pris pr. tømning * antal tømninger"

        const disposalCost = pricePerEmptying * annualPickups;

        // 6. Total
        const totalCost = laborCost + coolingCost + disposalCost + otherExpenses;
        currentTotalAnnualCost = totalCost; // Store for offer calculation

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

    // Global variable to store current calculation
    let currentTotalAnnualCost = 0;

    // Smart update for waste amount
    // Removed bin calculation logic as per user request
    inputs.wasteAmount.addEventListener('change', function () {
        calculate();
    });

    // Initial calculation
    calculate();


    // --- Offer & Break-Even Logic ---

    const offerInputs = {
        investment: document.getElementById('investment-cost'),
        newAnnualCost: document.getElementById('new-annual-cost'),
        calcBtn: document.getElementById('calc-offer-btn'),
        resultText: document.getElementById('breakeven-result')
    };

    let breakEvenChart = null;

    if (offerInputs.calcBtn) {
        offerInputs.calcBtn.addEventListener('click', calculateOffer);
    }

    function calculateOffer() {
        // 1. Validate Inputs
        const investment = parseFloat(offerInputs.investment.value);
        const newAnnualCost = parseFloat(offerInputs.newAnnualCost.value);

        if (isNaN(investment) || investment < 0) {
            alert("Indtast venligst en gyldig engangsinvestering.");
            return;
        }
        if (isNaN(newAnnualCost) || newAnnualCost < 0) {
            alert("Indtast venligst gyldige årlige omkostninger for ny løsning.");
            return;
        }

        // 2. Determine Timeline
        // If current > new, we have a break-even point
        // BreakEvenYear = Investment / (Current - New)
        let breakEvenYear = 0;
        let maxYear = 10;
        let hasBreakEven = false;

        const savingsPerYear = currentTotalAnnualCost - newAnnualCost;

        if (savingsPerYear > 0) {
            breakEvenYear = investment / savingsPerYear;
            hasBreakEven = true;
            // Show at least up to break-even + 3 years, max 20 years
            maxYear = Math.min(25, Math.max(10, Math.ceil(breakEvenYear) + 3));
        } else {
            hasBreakEven = false;
            maxYear = 10; // Default view if no savings
        }

        // 3. Generate Data Series
        const labels = [];
        const currentData = [];
        const newData = [];
        const currentYear = new Date().getFullYear();

        for (let i = 0; i <= maxYear; i++) {
            labels.push(currentYear + i);

            // Current Solution: 0 start cost, grows by currentTotalAnnualCost/year
            currentData.push(i * currentTotalAnnualCost);

            // New Solution: Investment start cost, grows by newAnnualCost/year
            newData.push(investment + (i * newAnnualCost));
        }

        // 4. Update UI Text
        if (hasBreakEven) {
            offerInputs.resultText.textContent = `Skæringspunkt / break-even: ca. ${breakEvenYear.toFixed(1)} år`;
            offerInputs.resultText.style.color = "#2e7d32"; // Green success
        } else {
            offerInputs.resultText.textContent = "Ingen break-even med de angivne tal (Ny løsning er dyrere i drift).";
            offerInputs.resultText.style.color = "#c0392b"; // Red warning
        }

        // 5. Render Chart
        renderChart(labels, currentData, newData);

        // 6. Calculate & Render Difference Chart
        const diffData = currentData.map((val, idx) => val - newData[idx]);
        const finalSavings = diffData[diffData.length - 1]; // Net result at end of period

        let summaryText = "";
        if (finalSavings > 0) {
            summaryText = `Samlet besparelse efter ${maxYear} år: ${new Intl.NumberFormat('da-DK').format(finalSavings)} kr.`;
            document.getElementById('savings-summary').style.color = "#2e7d32";
        } else {
            summaryText = `Ingen besparelse efter ${maxYear} år. Meromkostning: ${new Intl.NumberFormat('da-DK').format(Math.abs(finalSavings))} kr.`;
            document.getElementById('savings-summary').style.color = "#c0392b";
        }
        document.getElementById('savings-summary').textContent = summaryText;

        renderDifferenceChart(labels, diffData);
    }

    let differenceChart = null;

    function renderDifferenceChart(labels, diffData) {
        const ctx = document.getElementById('difference-chart').getContext('2d');

        if (differenceChart) {
            differenceChart.destroy();
        }

        // Color logic: Green if > 0, Red if < 0.
        const backgroundColors = diffData.map(val => val >= 0 ? '#007E48' : '#e74c3c');

        differenceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nettobesparelse (akkumuleret)',
                    data: diffData,
                    backgroundColor: backgroundColors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Hide legend as color implies meaning
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.parsed.y >= 0 ? "Besparelse: " : "Meromkostning: ";
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return new Intl.NumberFormat('da-DK').format(value) + ' kr';
                            }
                        }
                    }
                }
            }
        });
    }

    function renderChart(labels, currentData, newData) {
        const ctx = document.getElementById('breakeven-chart').getContext('2d');

        if (breakEvenChart) {
            breakEvenChart.destroy();
        }

        breakEvenChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Nuværende løsning (akkumuleret)',
                        data: currentData,
                        borderColor: '#95a5a6', // Gray/Silver
                        backgroundColor: '#95a5a6',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 3
                    },
                    {
                        label: 'Ny løsning (akkumuleret)',
                        data: newData,
                        borderColor: '#007E48', // Green
                        backgroundColor: '#007E48',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return new Intl.NumberFormat('da-DK').format(value) + ' kr';
                            }
                        }
                    }
                }
            }
        });
    }
});
