// User profile management and authentication
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profile-form');
    
    // Load saved profile data
    loadProfileData();
    
    // Handle form submission
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileData();
    });
});

function loadProfileData() {
    const savedProfile = localStorage.getItem('nutriscanProfile');
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        
        // Populate form fields
        document.getElementById('age').value = profileData.age || '';
        
        if (profileData.goal) {
            document.querySelector(`input[name="goal"][value="${profileData.goal}"]`).checked = true;
        }
        
        if (profileData.diet) {
            document.getElementById('diet').value = profileData.diet;
        }
        
        if (profileData.allergens) {
            profileData.allergens.forEach(allergen => {
                const checkbox = document.querySelector(`input[name="allergens"][value="${allergen}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
}

function saveProfileData() {
    const profileData = {
        age: document.getElementById('age').value,
        goal: document.querySelector('input[name="goal"]:checked')?.value,
        diet: document.getElementById('diet').value,
        allergens: Array.from(document.querySelectorAll('input[name="allergens"]:checked'))
                    .map(el => el.value)
    };
    
    // Save to localStorage
    localStorage.setItem('nutriscanProfile', JSON.stringify(profileData));
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = 'Profile saved successfully!';
    document.querySelector('.profile-container').appendChild(successMsg);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

// Function to get current user profile (for use in other parts of the app)
function getCurrentProfile() {
    const savedProfile = localStorage.getItem('nutriscanProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
}
