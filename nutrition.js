// Nutrition analysis and chart rendering
document.addEventListener('DOMContentLoaded', function() {
    // Initialize nutrition chart
    const ctx = document.getElementById('nutrition-chart').getContext('2d');
    const nutritionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fats'],
            datasets: [{
                data: [32, 45, 28],
                backgroundColor: [
                    '#4CAF50',  // Green for protein
                    '#2196F3',  // Blue for carbs
                    '#FFC107'   // Yellow for fats
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}g`;
                        }
                    }
                }
            }
        }
    });

    // Local nutrition database
    const localNutritionDB = {
        'apple': {calories: 95, protein: 0.5, carbs: 25, fat: 0.3},
        'banana': {calories: 105, protein: 1.3, carbs: 27, fat: 0.3},
        'chicken breast': {calories: 165, protein: 31, carbs: 0, fat: 3.6},
        'pasta': {calories: 131, protein: 5, carbs: 25, fat: 1.1},
        'salmon': {calories: 206, protein: 22, carbs: 0, fat: 13},
        // Default fallback values
        '_default': {calories: 200, protein: 15, carbs: 25, fat: 8}
    };

    async function testApiConnection() {
        try {
            const testResponse = await fetch('http://localhost:3001', {
                method: 'GET'
            });
            return testResponse.ok;
        } catch (error) {
            console.error('Backend Connection Failed:', error.message);
            return false;
        }
    }

    async function loadDishAnalysis(dishName) {
        try {
            if (!dishName || dishName.trim() === '') {
                throw new Error('Please enter a valid dish name');
            }

            const response = await fetch('http://localhost:3001/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dish: dishName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'API request failed');
            }

            const data = await response.json();
            updateNutritionDisplay(data.foods[0]);
            return data;
        } catch (error) {
            console.error('Nutrition API error:', error);
            const messageElement = document.getElementById('nutrition-message');
            if (!messageElement) return;
            
            if (error.message.includes('Too many requests')) {
                messageElement.textContent = 
                    'Please wait a minute before making more requests';
                messageElement.style.color = '#FF5722';
                return;
            }
            
            // Fallback to local data
            const dishKey = dishName.toLowerCase();
            const nutritionData = localNutritionDB[dishKey] || localNutritionDB['_default'];
            const foodData = {
                food_name: dishName,
                nf_calories: nutritionData.calories,
                nf_protein: nutritionData.protein,
                nf_total_carbohydrate: nutritionData.carbs,
                nf_total_fat: nutritionData.fat
            };
            
            updateNutritionDisplay(foodData);
            // Update UI to show we're using local data
            document.getElementById('nutrition-message').textContent = 
                'Using local nutrition data for: ' + dishName;
            document.getElementById('nutrition-message').style.color = '#4CAF50';
            return { foods: [foodData] };
        }
    }

    function updateNutritionDisplay(foodData) {
        document.getElementById('dish-title').textContent = foodData.food_name;
        nutritionChart.data.datasets[0].data = [
            foodData.nf_protein,
            foodData.nf_total_carbohydrate,
            foodData.nf_total_fat
        ];
        nutritionChart.update();
        
        document.getElementById('calories').textContent = foodData.nf_calories;
        document.getElementById('protein').textContent = `${foodData.nf_protein}g`;
        document.getElementById('carbs').textContent = `${foodData.nf_total_carbohydrate}g`;
        document.getElementById('fats').textContent = `${foodData.nf_total_fat}g`;
    }

    // Get dish name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dishName = urlParams.get('dish');
    
    if (dishName) {
        loadDishAnalysis(dishName);
    } else {
        console.warn('No dish specified in URL parameters');
    }
});
