// Power consumption data in watts
const powerConsumption = {
    ac: {
        '0.5': 400,
        '1': 750,
        '1.5': 1100,
        '2': 1500
    },
    fan: 50,
    computer: 400,
    refrigerator: 100,
    tv: 100,
    lamp: 10
};

// Carbon emission factor (kg CO2 per kWh)
const carbonFactor = 0.87;

// Global accumulator for total emissions
let totalEmissions = {
    daily: 0,
    monthly: 0,
    yearly: 0,
    powerUsage: 0
};

// Array to store calculation history
let calculationHistory = [];

// Device counter
let deviceCount = {};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculatorForm');
    const applianceSelect = document.getElementById('appliance');
    const acOptions = document.getElementById('acOptions');
    const resultDiv = document.getElementById('result');
    const totalDiv = document.getElementById('total');
    const resetButton = document.getElementById('resetTotal');

    applianceSelect.addEventListener('change', () => {
        acOptions.classList.toggle('d-none', applianceSelect.value !== 'ac');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateEmission();
    });

    resetButton.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mereset semua perhitungan?')) {
            resetTotalEmissions();
        }
    });
});

function calculateEmission() {
    const appliance = document.getElementById('appliance').value;
    const hours = parseFloat(document.getElementById('hours').value);
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    let power;
    let applianceName = document.getElementById('appliance').options[document.getElementById('appliance').selectedIndex].text;

    if (appliance === 'ac') {
        const pk = document.getElementById('acPK').value;
        power = powerConsumption.ac[pk];
        applianceName += ` ${pk} PK`;
    } else {
        power = powerConsumption[appliance];
    }

    // Calculate daily power usage in kWh for all devices
    const dailyPowerUsage = (power * hours * quantity) / 1000;
    
    // Calculate emissions for different periods
    const dailyCarbonEmission = dailyPowerUsage * carbonFactor;
    const monthlyCarbonEmission = dailyCarbonEmission * 30;
    const yearlyCarbonEmission = monthlyCarbonEmission * 12;

    // Update device count
    deviceCount[applianceName] = (deviceCount[applianceName] || 0) + quantity;

    // Add to history
    calculationHistory.push({
        id: Date.now(),
        appliance: applianceName,
        applianceType: appliance,
        pk: appliance === 'ac' ? document.getElementById('acPK').value : null,
        quantity: quantity,
        hours: hours,
        power: power,
        powerUsage: dailyPowerUsage,
        dailyEmission: dailyCarbonEmission,
        monthlyEmission: monthlyCarbonEmission,
        yearlyEmission: yearlyCarbonEmission,
        timestamp: new Date().toLocaleString()
    });

    // Update total emissions
    updateTotalEmissions();
    displayResults(dailyPowerUsage, dailyCarbonEmission, monthlyCarbonEmission, yearlyCarbonEmission);
    displayTotalEmissions();
    displayHistory();
    displayDeviceCount();

    // Reset form for next calculation
    document.getElementById('appliance').value = '';
    document.getElementById('hours').value = '';
    document.getElementById('quantity').value = '1';
    document.getElementById('acOptions').classList.add('d-none');
}

function displayResults(powerUsage, carbonEmission, monthlyEmission, yearlyEmission) {
    document.getElementById('result').classList.remove('d-none');
    document.getElementById('powerUsage').textContent = powerUsage.toFixed(2);
    document.getElementById('carbonEmission').textContent = carbonEmission.toFixed(2);
    document.getElementById('monthlyEmission').textContent = monthlyEmission.toFixed(2);
    document.getElementById('yearlyEmission').textContent = yearlyEmission.toFixed(2);
}

function displayTotalEmissions() {
    document.getElementById('total').classList.remove('d-none');
    document.getElementById('totalPowerUsage').textContent = totalEmissions.powerUsage.toFixed(2);
    document.getElementById('totalDailyEmission').textContent = totalEmissions.daily.toFixed(2);
    document.getElementById('totalMonthlyEmission').textContent = totalEmissions.monthly.toFixed(2);
    document.getElementById('totalYearlyEmission').textContent = totalEmissions.yearly.toFixed(2);
}

function displayHistory() {
    const historyDiv = document.getElementById('history');
    historyDiv.classList.remove('d-none');
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    calculationHistory.slice().reverse().forEach((calc, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${calculationHistory.length - index}</td>
            <td>${calc.timestamp}</td>
            <td>${calc.appliance}</td>
            <td>${calc.quantity}</td>
            <td>${calc.hours}</td>
            <td>${calc.powerUsage.toFixed(2)}</td>
            <td>${calc.dailyEmission.toFixed(2)}</td>
            <td>${calc.monthlyEmission.toFixed(2)}</td>
            <td>${calc.yearlyEmission.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editCalculation(${calc.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger " onclick="deleteCalculation(${calc.id})">
                    <i class="bi bi-trash"></i> Hapus
                </button>
            </td>
        `;
        historyList.appendChild(row);
    });
}

function displayDeviceCount() {
    const deviceCountDiv = document.getElementById('deviceCount');
    deviceCountDiv.classList.remove('d-none');
    const deviceList = document.getElementById('deviceList');
    deviceList.innerHTML = '';

    for (const [device, count] of Object.entries(deviceCount)) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            ${device}
            <span class="badge bg-primary rounded-pill">${count}</span>
        `;
        deviceList.appendChild(li);
    }
}

function editCalculation(id) {
    const calc = calculationHistory.find(c => c.id === id);
    if (!calc) return;

    document.getElementById('appliance').value = calc.applianceType;
    document.getElementById('hours').value = calc.hours;
    document.getElementById('quantity').value = calc.quantity;
    
    if (calc.applianceType === 'ac') {
        document.getElementById('acOptions').classList.remove('d-none');
        document.getElementById('acPK').value = calc.pk;
    } else {
        document.getElementById('acOptions').classList.add('d-none');
    }

    // Remove the old calculation
    deleteCalculation(id);
    
    // Scroll to form
    document.getElementById('calculatorForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteCalculation(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus perhitungan ini?')) return;

    const index = calculationHistory.findIndex(c => c.id === id);
    if (index === -1) return;

    const calc = calculationHistory[index];
    
    // Update device count
    deviceCount[calc.appliance] -= calc.quantity;
    if (deviceCount[calc.appliance] <= 0) {
        delete deviceCount[calc.appliance];
    }

    // Remove calculation
    calculationHistory.splice(index, 1);
    
    // Update totals and display
    updateTotalEmissions();
    displayTotalEmissions();
    displayHistory();
    displayDeviceCount();
}

function updateTotalEmissions() {
    totalEmissions = {
        daily: 0,
        monthly: 0,
        yearly: 0,
        powerUsage: 0
    };

    calculationHistory.forEach(calc => {
        totalEmissions.daily += calc.dailyEmission;
        totalEmissions.monthly += calc.monthlyEmission;
        totalEmissions.yearly += calc.yearlyEmission;
        totalEmissions.powerUsage += calc.powerUsage;
    });
}

function resetTotalEmissions() {
    totalEmissions = {
        daily: 0,
        monthly: 0,
        yearly: 0,
        powerUsage: 0
    };
    calculationHistory = [];
    deviceCount = {};
    document.getElementById('total').classList.add('d-none');
    document.getElementById('result').classList.add('d-none');
    document.getElementById('history').classList.add('d-none');
    document.getElementById('deviceCount').classList.add('d-none');
}
