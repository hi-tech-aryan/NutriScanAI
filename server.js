const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

// Rate limiting for free tier (5 requests per minute)
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many requests, please try again later'
});
const PORT = 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins (temporary for testing)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

// API Credentials
const NUTRITIONIX_APP_ID = '2ef55048';
const NUTRITIONIX_APP_KEY = '6c186265b323c44c378fb82197958e7e';

// Add a root route to handle GET requests
app.get('/', (req, res) => {
    res.send('Welcome to NutriScanAI! The server is running.');
});

// Local nutrition database
const localNutritionDB = {
    // Fruits
    'apple': {calories: 95, protein: 0.5, carbs: 25, fat: 0.3},
    'banana': {calories: 105, protein: 1.3, carbs: 27, fat: 0.3},
    'orange': {calories: 62, protein: 1.2, carbs: 15, fat: 0.2},
    'grapes': {calories: 62, protein: 0.6, carbs: 16, fat: 0.4},
    
    // Vegetables
    'carrot': {calories: 41, protein: 0.9, carbs: 10, fat: 0.2},
    'broccoli': {calories: 55, protein: 3.7, carbs: 11, fat: 0.6},
    
    // Proteins
    'chicken breast': {calories: 165, protein: 31, carbs: 0, fat: 3.6},
    'salmon': {calories: 206, protein: 22, carbs: 0, fat: 13},
    'eggs': {calories: 143, protein: 13, carbs: 0.7, fat: 9.5},
    
    // Carbs
    'rice': {calories: 130, protein: 2.7, carbs: 28, fat: 0.3},
    'pasta': {calories: 131, protein: 5, carbs: 25, fat: 1.1},
    
    // Default fallback
    '_default': {calories: 200, protein: 15, carbs: 25, fat: 8}
};

// Nutrition Analysis Endpoint
app.post('/analyze', limiter, async (req, res) => {
    console.log('Received analysis request for:', req.body.dish);
    try {
        if (!req.body.dish) {
            return res.status(400).json({ error: 'Dish name is required' });
        }

        const { dish } = req.body;
        const simpleQuery = dish.split(',')[0].split('(')[0].trim();
        
        console.log('Making request to Nutritionix for:', simpleQuery);
        const response = await axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients', {
            query: simpleQuery,
            timezone: "US/Eastern",
            aggregate: "item"
        }, {
            headers: {
                'x-app-id': NUTRITIONIX_APP_ID,
                'x-app-key': NUTRITIONIX_APP_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 second timeout
        });

        console.log('Received response from Nutritionix');
        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.message);
        // Try local fallback
        const localData = localNutritionDB[dish.toLowerCase()];
        if (localData) {
            res.json({
                foods: [{
                    food_name: dish,
                    nf_calories: localData.calories,
                    nf_protein: localData.protein,
                    nf_total_carbohydrate: localData.carbs,
                    nf_total_fat: localData.fat
                }]
            });
        } else {
            res.status(500).json({ 
                error: 'Analysis failed', 
                details: error.message,
                suggestion: 'Try common foods like apple, banana, or chicken breast'
            });
        }
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
