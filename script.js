// Phase mapping to match Python implementation
const PHASE_MAPPING = {
    0: 'follicular',
    1: 'luteal',
    2: 'menstrual',
    3: 'ovulation'
};

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    const cycleForm = document.getElementById('cycleForm');
    const backButton = document.getElementById('backButton');
    const inputSection = document.getElementById('inputSection');
    const resultsSection = document.getElementById('resultsSection');

    // Initialize sections
    inputSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    // Form submit handler
    cycleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Form submitted");
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            age: parseInt(document.getElementById('age').value),
            cycleLength: parseInt(document.getElementById('cycleLength').value),
            mensesLength: parseInt(document.getElementById('mensesLength').value),
            mensesScore: parseInt(document.getElementById('mensesScore').value),
            lastPeriod: document.getElementById('lastPeriod').value,
            dietType: document.getElementById('dietType').value
        };

        console.log("Form data:", formData);

        // Basic validation
        if (!formData.name || !formData.age || !formData.cycleLength || 
            !formData.mensesLength || !formData.mensesScore || 
            !formData.lastPeriod || !formData.dietType) {
            alert('Please fill in all fields');
            return;
        }

        // Process the data
        const results = analyzePhase(formData);
        
        // Show results section and hide input section
        inputSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Display the results
        displayResults(results);
    });

    // Back button handler
    backButton.addEventListener('click', function() {
        console.log("Back button clicked");
        resultsSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    });
});

function analyzePhase(data) {
    const today = new Date();
    const lastPeriod = new Date(data.lastPeriod);
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    const currentCycleDay = daysSinceLastPeriod % data.cycleLength;

    // Generate predictions for entire cycle
    const predictions = [];
    for (let day = 0; day < data.cycleLength; day++) {
        // Simplified phase prediction logic
        let phase;
        const normalizedDay = (day / data.cycleLength) * 100; // Convert to percentage of cycle

        if (day < data.mensesLength) {
            phase = 2; // menstrual
        } else if (normalizedDay < 45) {
            phase = 0; // follicular
        } else if (normalizedDay >= 45 && normalizedDay < 55) {
            phase = 3; // ovulation
        } else {
            phase = 1; // luteal
        }

        predictions.push({
            day: day + 1,
            phase: PHASE_MAPPING[phase]
        });
    }

    const currentPhase = predictions[currentCycleDay].phase;

    return {
        currentPhase,
        currentCycleDay: currentCycleDay + 1,
        cycleLength: data.cycleLength,
        predictions,
        dietType: data.dietType
    };
}

function generateCycleGraph(results) {
    const ctx = document.getElementById('cycleGraph').getContext('2d');
    
    // Convert phases to numerical values for plotting
    const phaseToNumber = {
        'menstrual': 0,
        'follicular': 1,
        'ovulation': 2,
        'luteal': 3
    };
    
    const data = results.predictions.map(pred => ({
        x: pred.day,
        y: phaseToNumber[pred.phase]
    }));

    // Highlight current day
    const currentDayDataPoint = {
        x: results.currentCycleDay,
        y: phaseToNumber[results.currentPhase]
    };

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Cycle Phases',
                    data: data,
                    borderColor: '#4CAF50',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Current Day',
                    data: [currentDayDataPoint],
                    backgroundColor: '#FF4081',
                    borderColor: '#FF4081',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    type: 'scatter'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Day of Cycle'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                y: {
                    min: -0.5,
                    max: 3.5,
                    ticks: {
                        callback: function(value) {
                            return ['Menstrual', 'Follicular', 'Ovulation', 'Luteal'][value];
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const phase = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal'][context.parsed.y];
                            return `Day ${context.parsed.x}: ${phase} Phase`;
                        }
                    }
                }
            }
        }
    });
}

function displayResults(results) {
    document.getElementById('currentPhase').innerText = results.currentPhase.charAt(0).toUpperCase() + 
        results.currentPhase.slice(1);
    document.getElementById('daysInfo').innerText = `Current Cycle Day: ${results.currentCycleDay}`;

    generateCycleGraph(results);

    // Update recommendations based on current phase
    updateRecommendations(results.currentPhase, results.dietType);
}

function updateRecommendations(phase, dietType) {
    // Define phase-specific recommendations
    const recommendations = {
        menstrual: {
            foods: {
                non_veg: ["Iron-rich meats", "Fish", "Eggs"],
                veg: ["Leafy greens", "Beans", "Lentils"],
                vegan: ["Quinoa", "Tofu", "Fortified cereals"]
            },
            avoid: ["Caffeine", "Alcohol", "Salty foods"],
            hydration: "Increase water intake and include warm herbal teas"
        },
        follicular: {
            foods: {
                non_veg: ["Chicken", "Turkey", "Fish"],
                veg: ["Greek yogurt", "Chickpeas", "Nuts"],
                vegan: ["Tempeh", "Seitan", "Hemp seeds"]
            },
            avoid: ["Processed foods", "Refined sugars"],
            hydration: "Regular water intake with lemon or mint"
        },
        ovulation: {
            foods: {
                non_veg: ["Salmon", "Lean meats", "Eggs"],
                veg: ["Avocados", "Seeds", "Dairy"],
                vegan: ["Chia seeds", "Nuts", "Legumes"]
            },
            avoid: ["Excessive salt", "Spicy foods"],
            hydration: "Include coconut water and fresh fruit juices"
        },
        luteal: {
            foods: {
                non_veg: ["Fatty fish", "Turkey", "Eggs"],
                veg: ["Sweet potatoes", "Yogurt", "Cheese"],
                vegan: ["Brown rice", "Bananas", "Dark chocolate"]
            },
            avoid: ["Caffeine", "Alcohol", "Processed snacks"],
            hydration: "Focus on maintaining steady hydration"
        }
    };

    const phaseRecs = recommendations[phase];
    const foodsList = phaseRecs.foods[dietType];

    document.getElementById('recommendedFoods').innerHTML = 
        foodsList.map(food => `<li>${food}</li>`).join('');
    document.getElementById('foodsToAvoid').innerHTML = 
        phaseRecs.avoid.map(food => `<li>${food}</li>`).join('');
    document.getElementById('hydrationTip').innerText = phaseRecs.hydration;
}