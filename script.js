// Configuration - Replace with your published Google Sheets URLs
const AUTH_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRiuHWofyQmC1qtJFOjzvQTrplvxnCjHUTbKud5LBMwhX_1AS0afEEbbQNB1XqxkguEvYuyaHFsmYlq/pubhtml';
const ALUMNI_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRiuHWofyQmC1qtJFOjzvQTrplvxnCjHUTbKud5LBMwhX_1AS0afEEbbQNB1XqxkguEvYuyaHFsmYlq/pubhtml';

// Utility functions
function toUpperCase(str) {
    return str ? str.toUpperCase() : '';
}

function showError(message) {
    alert('Error: ' + message);
}

function showSuccess(message) {
    alert('Success: ' + message);
}

// Parse CSV data from Google Sheets
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        if (values.length === headers.length) {
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });
            data.push(entry);
        }
    }
    
    return data;
}

// Fetch data from Google Sheets
async function fetchSheetData(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        showError('Failed to load data. Please try again later.');
        return [];
    }
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const authData = await fetchSheetData(AUTH_SHEET_URL);
            const user = authData.find(u => 
                u.Email === email && u.Password === password
            );
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'dashboard.html';
            } else {
                showError('Invalid email or password');
            }
        });
    }
    
    // Verification form
    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) {
        verifyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const regNumber = toUpperCase(document.getElementById('regNumber').value);
            const firstName = toUpperCase(document.getElementById('firstName').value);
            const lastName = toUpperCase(document.getElementById('lastName').value);
            
            const authData = await fetchSheetData(AUTH_SHEET_URL);
            const user = authData.find(u => 
                toUpperCase(u.RegistrationNumber) === regNumber &&
                toUpperCase(u.FirstName) === firstName &&
                toUpperCase(u.LastName) === lastName
            );
            
            if (user) {
                document.getElementById('successMessage').classList.remove('hidden');
                document.getElementById('newEmail').value = user.Email || '';
            } else {
                showError('No matching record found. Please check your details.');
            }
        });
    }
    
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newEmail').value;
            const password = document.getElementById('newPassword').value;
            
            // In a real implementation, you would send this data to Google Sheets
            // For this demo, we'll just store in localStorage
            const regNumber = toUpperCase(document.getElementById('regNumber').value);
            const firstName = toUpperCase(document.getElementById('firstName').value);
            const lastName = toUpperCase(document.getElementById('lastName').value);
            
            // Store user data (in a real app, this would be saved to Google Sheets)
            const userData = {
                RegistrationNumber: regNumber,
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                Password: password
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            showSuccess('Registration successful! You can now login.');
            window.location.href = 'index.html';
        });
    }
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        // Load user data if available
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.Email) {
            document.getElementById('email').value = userData.Email;
        }
        
        // Branch selection handling
        const branchSelect = document.getElementById('branch');
        const otherBranch = document.getElementById('otherBranch');
        
        if (branchSelect) {
            branchSelect.addEventListener('change', function() {
                if (this.value === 'Others') {
                    otherBranch.classList.remove('hidden');
                } else {
                    otherBranch.classList.add('hidden');
                }
            });
        }
        
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const batch = document.getElementById('batch').value;
            let branch = document.getElementById('branch').value;
            if (branch === 'Others') {
                branch = document.getElementById('otherBranch').value;
            }
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const designation = document.getElementById('designation').value;
            const employer = document.getElementById('employer').value;
            const areaOfWork = document.getElementById('areaOfWork').value;
            const linkedin = document.getElementById('linkedin').value;
            
            const contributionsSelect = document.getElementById('contributions');
            const contributions = Array.from(contributionsSelect.selectedOptions)
                .map(option => option.value)
                .join(', ');
            
            // Handle image upload (simplified for this demo)
            const imageFile = document.getElementById('image').files[0];
            let imageUrl = '';
            if (imageFile) {
                // In a real implementation, you would upload to a server
                // For this demo, we'll just use a placeholder
                imageUrl = URL.createObjectURL(imageFile);
            }
            
            // Get current user data
            const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            // Prepare alumni data
            const alumniData = {
                RegistrationNumber: userData.RegistrationNumber || '',
                FirstName: userData.FirstName || '',
                LastName: userData.LastName || '',
                Batch: batch,
                Branch: branch,
                Email: email,
                Phone: phone,
                ImageURL: imageUrl,
                Designation: designation,
                Employer: employer,
                AreaOfWork: areaOfWork,
                LinkedIn: linkedin,
                Contributions: contributions
            };
            
            // In a real implementation, you would save this to Google Sheets
            // For this demo, we'll save to localStorage
            let alumniRecords = JSON.parse(localStorage.getItem('alumniRecords') || '[]');
            
            // Remove existing record if any
            alumniRecords = alumniRecords.filter(
                record => record.RegistrationNumber !== alumniData.RegistrationNumber
            );
            
            // Add new record
            alumniRecords.push(alumniData);
            localStorage.setItem('alumniRecords', JSON.stringify(alumniRecords));
            
            showSuccess('Profile updated successfully!');
        });
    }
    
    // Directory functionality
    const alumniList = document.getElementById('alumniList');
    if (alumniList) {
        loadAlumniDirectory();
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                filterAlumni(searchInput.value);
            });
            
            searchInput.addEventListener('keyup', function() {
                filterAlumni(searchInput.value);
            });
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Dashboard link
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.Email) {
            dashboardLink.href = 'dashboard.html';
        } else {
            dashboardLink.href = 'index.html';
        }
    }
});

// Load alumni directory
async function loadAlumniDirectory() {
    // In a real implementation, you would fetch from Google Sheets
    // For this demo, we'll use localStorage data
    let alumniData = JSON.parse(localStorage.getItem('alumniRecords') || '[]');
    
    // If no data in localStorage, create some sample data
    if (alumniData.length === 0) {
        alumniData = [
            {
                RegistrationNumber: 'ABC123',
                FirstName: 'John',
                LastName: 'Doe',
                Batch: '1994',
                Branch: 'CSE',
                Email: 'john.doe@example.com',
                Phone: '123-456-7890',
                ImageURL: 'https://via.placeholder.com/100',
                Designation: 'Senior Developer',
                Employer: 'Tech Company',
                AreaOfWork: 'Web Development, JavaScript',
                LinkedIn: 'https://linkedin.com/in/johndoe',
                Contributions: 'Job Referrals, Career Guidance'
            },
            {
                RegistrationNumber: 'DEF456',
                FirstName: 'Jane',
                LastName: 'Smith',
                Batch: '1995',
                Branch: 'ECE',
                Email: 'jane.smith@example.com',
                Phone: '098-765-4321',
                ImageURL: 'https://via.placeholder.com/100',
                Designation: 'Project Manager',
                Employer: 'Software Inc',
                AreaOfWork: 'Project Management, Agile',
                LinkedIn: 'https://linkedin.com/in/janesmith',
                Contributions: 'Train on technologies, Financial Planning'
            }
        ];
        localStorage.setItem('alumniRecords', JSON.stringify(alumniData));
    }
    
    displayAlumni(alumniData);
}

// Display alumni in directory
function displayAlumni(alumniData) {
    const alumniList = document.getElementById('alumniList');
    if (!alumniList) return;
    
    alumniList.innerHTML = '';
    
    alumniData.forEach(alumni => {
        const card = document.createElement('div');
        card.className = 'alumni-card';
        
        card.innerHTML = `
            <img src="${alumni.ImageURL || 'https://via.placeholder.com/100'}" 
                 alt="${alumni.FirstName} ${alumni.LastName}" 
                 class="alumni-image">
            <div class="alumni-name">${alumni.FirstName} ${alumni.LastName}</div>
            <div class="alumni-details">
                <p><strong>Batch:</strong> ${alumni.Batch}</p>
                <p><strong>Branch:</strong> ${alumni.Branch}</p>
                <p><strong>Designation:</strong> ${alumni.Designation}</p>
                <p><strong>Employer:</strong> ${alumni.Employer}</p>
                <p><strong>Area of Work:</strong> ${alumni.AreaOfWork}</p>
                <p><strong>Contributions:</strong> ${alumni.Contributions}</p>
                <p><strong>LinkedIn:</strong> <a href="${alumni.LinkedIn}" target="_blank">View Profile</a></p>
            </div>
        `;
        
        alumniList.appendChild(card);
    });
}

// Filter alumni based on search term
function filterAlumni(searchTerm) {
    const alumniData = JSON.parse(localStorage.getItem('alumniRecords') || '[]');
    
    if (!searchTerm) {
        displayAlumni(alumniData);
        return;
    }
    
    const term = searchTerm.toLowerCase();
    const filteredData = alumniData.filter(alumni => {
        return (
            alumni.FirstName.toLowerCase().includes(term) ||
            alumni.LastName.toLowerCase().includes(term) ||
            alumni.Batch.toLowerCase().includes(term) ||
            alumni.Branch.toLowerCase().includes(term) ||
            alumni.Designation.toLowerCase().includes(term) ||
            alumni.Employer.toLowerCase().includes(term) ||
            alumni.AreaOfWork.toLowerCase().includes(term) ||
            alumni.Contributions.toLowerCase().includes(term)
        );
    });
    
    displayAlumni(filteredData);
}
