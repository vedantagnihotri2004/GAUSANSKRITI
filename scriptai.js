document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-pane');
    
    // Check if user is authenticated
    if (window.api && !api.auth.isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = "loginpage.html?redirect=ai.html";
    }
    
    // Variables for chat functionality
    let currentConversationId = null;
    
    // Camera and image upload elements
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const previewPlaceholder = document.getElementById('preview-placeholder');
    const cameraStream = document.getElementById('camera-stream');
    let stream = null; // To hold the camera stream
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Connect to database and fetch dashboard data
    initDashboardData();
    
    // Handle file upload
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewPlaceholder.style.display = 'none';
                previewImage.src = event.target.result;
                previewImage.style.display = 'block';
                cameraStream.style.display = 'none';
                
                // Show the analyze button to proceed with analysis
                document.querySelector('.analyze-btn').classList.add('active');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle camera functionality
    cameraBtn.addEventListener('click', async () => {
        try {
            previewPlaceholder.style.display = 'none';
            previewImage.style.display = 'none';
            cameraStream.style.display = 'block';
            captureBtn.style.display = 'inline-block';
            cameraBtn.style.display = 'none';
            uploadBtn.style.display = 'none';
            
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream.srcObject = stream;
            await cameraStream.play();
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please check your permissions.');
            resetCameraUI();
        }
    });
    
    captureBtn.addEventListener('click', () => {
        // Create a canvas to capture the image
        const canvas = document.createElement('canvas');
        canvas.width = cameraStream.videoWidth;
        canvas.height = cameraStream.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraStream, 0, 0);
        
        // Get the data URL and display the image
        const imageDataURL = canvas.toDataURL('image/png');
        previewImage.src = imageDataURL;
        previewImage.style.display = 'block';
        cameraStream.style.display = 'none';
        
        // Stop the camera stream
        stopCameraStream();
        
        // Change buttons
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-block';
        
        // Show the analyze button
        document.querySelector('.analyze-btn').classList.add('active');
    });
    
    retakeBtn.addEventListener('click', async () => {
        try {
            previewImage.style.display = 'none';
            cameraStream.style.display = 'block';
            retakeBtn.style.display = 'none';
            captureBtn.style.display = 'inline-block';
            
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream.srcObject = stream;
            await cameraStream.play();
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please check your permissions.');
            resetCameraUI();
        }
    });
    
    // Handle analyze button click
    document.querySelector('.analyze-btn').addEventListener('click', () => {
        if (previewImage.style.display === 'block') {
            analyzeCowImage();
        } else {
            alert('Please upload or capture an image first.');
        }
    });
    
    // Initialize chat functionality
    initChat();
    
    function resetCameraUI() {
        previewPlaceholder.style.display = 'block';
        previewImage.style.display = 'none';
        cameraStream.style.display = 'none';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'none';
        cameraBtn.style.display = 'inline-block';
        uploadBtn.style.display = 'inline-block';
        
        // Stop any active stream
        stopCameraStream();
    }
    
    function stopCameraStream() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }
    
    // Function to initialize the dashboard with data from the database
    async function initDashboardData() {
        try {
            // Fetch cow health data
            const healthData = await api.dashboard.getCowHealth();
            updateHealthGauges(healthData);
            
            // Fetch milk production data
            const milkData = await api.dashboard.getMilkProduction(30); // Last 30 days
            createMilkProductionChart(milkData);
            
            // Fetch vaccination schedule
            const vaccineData = await api.dashboard.getVaccinationSchedule();
            updateVaccinationTimeline(vaccineData);
            
            // Create the genetics chart
            createGeneticsChart();
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            displayErrorMessage('Failed to load dashboard data. Please check your connection.');
        }
    }
    
    // Function to analyze cow image
    async function analyzeCowImage() {
        try {
            // Show loading indicator
            document.getElementById('loading-indicator').style.display = 'block';
            
            // Get the image data
            const imageData = previewImage.src;
            
            // Convert base64 to blob
            const response = await fetch(imageData);
            const blob = await response.blob();
            
            // Create file from blob
            const imageFile = new File([blob], 'cow_image.png', { type: 'image/png' });
            
            // Send image to API for analysis
            const analysisResult = await api.cows.analyzeCow(imageFile);
            
            // Update UI with results
            updateAnalysisResults(analysisResult);
            
        } catch (error) {
            console.error('Error analyzing cow image:', error);
            alert('Failed to analyze image. Please try again.');
        } finally {
            // Hide loading indicator
            document.getElementById('loading-indicator').style.display = 'none';
        }
    }
    
    // Function to initialize the chat
    async function initChat() {
        try {
            // Create a new conversation if none exists
            if (!currentConversationId) {
                const response = await api.ai.createConversation();
                currentConversationId = response.id;
            }
            
            // Set up send button click handler
            document.getElementById('send-button').addEventListener('click', sendChatMessage);
            
            // Allow Enter key to send message
            document.getElementById('chat-input').addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    sendChatMessage();
                }
            });
            
        } catch (error) {
            console.error('Error initializing chat:', error);
            displayChatError('Could not initialize chat. Please refresh the page.');
        }
    }
    
    // Function to send a chat message
    async function sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        const chatMessages = document.getElementById('chat-messages');
        
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Display user message
        chatMessages.innerHTML += `
            <div class="user-message">
                <div class="message-content">
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Display typing indicator
            chatMessages.innerHTML += `
                <div class="ai-message typing-indicator" id="typing-indicator">
                    <div class="message-content">
                        <div class="typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Send message to API
            const response = await api.ai.sendMessage(currentConversationId, message);
            
            // Remove typing indicator
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();
            
            // Display AI response
            chatMessages.innerHTML += `
                <div class="ai-message">
                    <div class="message-content">
                        <p>${response.message}</p>
                    </div>
                </div>
            `;
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Remove typing indicator
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();
            
            // Display error message
            chatMessages.innerHTML += `
                <div class="ai-message error">
                    <div class="message-content">
                        <p>Sorry, there was an error processing your message. Please try again.</p>
                    </div>
                </div>
            `;
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Function to update health gauges
    function updateHealthGauges(healthData) {
        createGauge('bodyConditionGauge', healthData.body_condition || 3.5, 'Body Condition Score', 5);
        createGauge('immunityGauge', healthData.immunity_status || 4.2, 'Immunity Status', 5);
    }
    
    // Function to create a gauge chart
    function createGauge(canvasId, value, label, max) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, max - value],
                    backgroundColor: [
                        value < max * 0.6 ? '#F44336' : value < max * 0.8 ? '#FFC107' : '#4CAF50',
                        '#E0E0E0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                cutout: '70%',
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `${label}: ${value}/${max}`,
                        position: 'bottom',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        });
    }
    
    // Function to create milk production chart
    function createMilkProductionChart(milkData) {
        const ctx = document.getElementById('milkProductionChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: milkData.dates || getLast30Days(),
                datasets: [{
                    label: 'Daily Milk Production (L)',
                    data: milkData.values || generateSampleMilkData(),
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Milk Production Trend'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Liters'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }
    
    // Function to create genetics chart
    function createGeneticsChart() {
        const ctx = document.getElementById('geneticsChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Pure Gir', 'Other Indigenous', 'Cross-breed'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: [
                        '#4CAF50',
                        '#2196F3',
                        '#FFC107'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Genetic Composition'
                    }
                }
            }
        });
    }
    
    // Function to update vaccination timeline
    function updateVaccinationTimeline(vaccineData) {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;
        
        // Clear existing items
        timeline.innerHTML = '';
        
        // If we have data, use it, otherwise use sample data
        const vaccinations = vaccineData || [
            { date: '2023-01-15', name: 'FMD Vaccine', status: 'completed' },
            { date: '2023-08-10', name: 'Brucellosis Vaccine', status: 'upcoming' },
            { date: '2023-11-05', name: 'Anthrax Vaccine', status: 'future' }
        ];
        
        // Add vaccination items to timeline
        vaccinations.forEach(vacc => {
            const date = new Date(vacc.date);
            const formattedDate = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
            
            const item = document.createElement('div');
            item.className = `timeline-item ${vacc.status}`;
            item.innerHTML = `
                <span class="date">${formattedDate}</span>
                <span class="event">${vacc.name}</span>
                <span class="status">${getStatusText(vacc.status)}</span>
            `;
            
            timeline.appendChild(item);
        });
    }
    
    // Function to update analysis results
    function updateAnalysisResults(results) {
        // Update breed identification
        const breedElement = document.querySelector('.breed-name');
        if (breedElement) breedElement.textContent = results.breed || 'Gir';
        
        // Update confidence level
        const confidenceBar = document.querySelector('.confidence-level');
        if (confidenceBar) {
            const confidence = results.confidence || 95;
            confidenceBar.style.width = `${confidence}%`;
            confidenceBar.textContent = `${confidence}%`;
        }
        
        // Update quick stats
        const weightStat = document.querySelector('.stat-item:nth-child(1) .stat-value');
        if (weightStat) weightStat.textContent = results.weight || '420kg';
        
        const milkStat = document.querySelector('.stat-item:nth-child(2) .stat-value');
        if (milkStat) milkStat.textContent = results.milk_yield || '8.5L';
        
        const purityStat = document.querySelector('.stat-item:nth-child(3) .stat-value');
        if (purityStat) purityStat.textContent = results.purity || '98%';
        
        // Add breed description
        const resultDetail = document.querySelector('.result-detail');
        if (resultDetail) resultDetail.textContent = results.description || 'Indigenous breed from Gujarat, India';
    }
    
    // Helper function to get status text
    function getStatusText(status) {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'upcoming':
                return 'Due in 2 weeks';
            case 'future':
                return 'Upcoming';
            default:
                return status;
        }
    }
    
    // Helper function to get last 30 days for chart
    function getLast30Days() {
        const result = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            result.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return result;
    }
    
    // Helper function to generate sample milk data
    function generateSampleMilkData() {
        return Array.from({ length: 30 }, () => Math.random() * 3 + 7); // Random values between 7 and 10
    }
    
    // Helper function to display error message
    function displayErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-banner';
        errorDiv.textContent = message;
        
        document.body.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.classList.add('fade-out');
            setTimeout(() => errorDiv.remove(), 500);
        }, 5000);
    }
    
    // Helper function to display chat error
    function displayChatError(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML += `
            <div class="system-message error">
                <p>${message}</p>
            </div>
        `;
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
