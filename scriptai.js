document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-pane');
    
    // Built-in API key (replace with your actual API key in a production environment)
    // In a real application, this should be securely managed server-side
    const GEMINI_API_KEY = "YOUR_HARDCODED_API_KEY"; 
    
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
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // File upload functionality
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check if the file is an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // Stop camera stream if it's active
            stopCameraStream();
            
            // Display the selected image
            const reader = new FileReader();
            reader.onload = function(e) {
                previewPlaceholder.style.display = 'none';
                cameraStream.style.display = 'none';
                previewImage.style.display = 'block';
                previewImage.src = e.target.result;
                
                // Show retake button, hide capture button
                captureBtn.style.display = 'none';
                retakeBtn.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Camera functionality
    cameraBtn.addEventListener('click', function() {
        // First check if we have camera access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Prefer back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 } 
                } 
            })
            .then(function(mediaStream) {
                // Store stream to stop it later
                stream = mediaStream;
                
                // Show video stream
                previewPlaceholder.style.display = 'none';
                previewImage.style.display = 'none';
                cameraStream.style.display = 'block';
                
                // Connect the stream to the video element
                cameraStream.srcObject = mediaStream;
                cameraStream.play()
                    .then(() => {
                        // Show capture button, hide retake button
                        captureBtn.style.display = 'inline-block';
                        retakeBtn.style.display = 'none';
                    })
                    .catch(error => {
                        console.error("Error starting video:", error);
                    });
            })
            .catch(function(error) {
                console.error("Error accessing camera:", error);
                alert('Could not access camera. Please make sure you have granted camera permissions.');
            });
        } else {
            alert('Your browser does not support camera access');
        }
    });
    
    // Capture photo functionality
    captureBtn.addEventListener('click', function() {
        if (cameraStream.style.display === 'block') {
            // Create canvas to capture frame from video
            const canvas = document.createElement('canvas');
            canvas.width = cameraStream.videoWidth;
            canvas.height = cameraStream.videoHeight;
            
            // Draw video frame to canvas
            canvas.getContext('2d').drawImage(cameraStream, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to image and display
            const imgUrl = canvas.toDataURL('image/png');
            previewImage.src = imgUrl;
            
            // Hide video, show image
            cameraStream.style.display = 'none';
            previewImage.style.display = 'block';
            
            // Stop camera stream
            stopCameraStream();
            
            // Hide capture button, show retake button
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-block';
        }
    });
    
    // Retake photo button
    retakeBtn.addEventListener('click', function() {
        // Clear current image/video
        previewImage.src = '';
        previewImage.style.display = 'none';
        
        // Show placeholder again
        previewPlaceholder.style.display = 'block';
        
        // Hide retake button
        retakeBtn.style.display = 'none';
    });
    
    // Function to stop camera stream
    function stopCameraStream() {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            stream = null;
            cameraStream.srcObject = null;
        }
    }

    // Analyze button functionality
    const analyzeBtn = document.querySelector('.analyze-btn');
    analyzeBtn.addEventListener('click', function() {
        // Check if an image is selected or captured
        if (previewImage.style.display !== 'block') {
            alert('Please upload or capture an image first');
            return;
        }
        
        const loadingIndicator = document.getElementById('loading-indicator');
        const tabContent = document.querySelector('.tab-content');
        
        // Show loading indicator
        loadingIndicator.style.display = 'flex';
        tabContent.style.opacity = '0.3';
        
        // Generate analysis results
        const analysisResults = generateAnalysisResults();
        
        // Simulate analysis completion after 2 seconds
        setTimeout(() => {
            // Update UI with analysis results
            updateResultsDashboard(analysisResults);
            
            loadingIndicator.style.display = 'none';
            tabContent.style.opacity = '1';
            
            // Automatically select overview tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            document.querySelector('[data-tab="overview"]').classList.add('active');
            document.getElementById('overview').classList.add('active');
            
            // Add results to chat
            const resultSummary = `Analysis complete! Identified as ${analysisResults.breed} breed with ${analysisResults.confidence}% confidence. Weight: ${analysisResults.weight}, Daily milk: ${analysisResults.milkProduction}, Health status: ${analysisResults.healthStatus}.`;
            addMessageToChat('system', resultSummary);
            
            // Initialize charts with the new data
            initCharts(analysisResults);
        }, 2000);
    });

    // Function to generate random analysis results
    function generateAnalysisResults() {
        // Define possible breeds and their details
        const cattleBreeds = [
            { 
                name: 'Gir', 
                origin: 'Gujarat, India',
                milkRange: [7, 11],
                weightRange: [400, 450],
                pureBreedRange: [92, 99],
                confidence: [88, 97],
                traits: {
                    heatTolerance: 'high',
                    diseaseResistance: 'high',
                    milkFatContent: 'high'
                }
            },
            { 
                name: 'Sahiwal', 
                origin: 'Punjab region, India and Pakistan',
                milkRange: [8, 12],
                weightRange: [380, 420],
                pureBreedRange: [90, 98],
                confidence: [85, 95],
                traits: {
                    heatTolerance: 'high',
                    diseaseResistance: 'high',
                    milkFatContent: 'medium'
                }
            },
            { 
                name: 'Red Sindhi', 
                origin: 'Sindh, Pakistan',
                milkRange: [6, 9.5],
                weightRange: [340, 390],
                pureBreedRange: [87, 96],
                confidence: [82, 94],
                traits: {
                    heatTolerance: 'high',
                    diseaseResistance: 'medium',
                    milkFatContent: 'high'
                }
            },
            { 
                name: 'Tharparkar', 
                origin: 'Rajasthan, India',
                milkRange: [7, 10],
                weightRange: [360, 410],
                pureBreedRange: [89, 97],
                confidence: [84, 93],
                traits: {
                    heatTolerance: 'high',
                    diseaseResistance: 'medium',
                    milkFatContent: 'medium'
                }
            },
            { 
                name: 'Kankrej', 
                origin: 'Gujarat and Rajasthan, India',
                milkRange: [6.5, 10.5],
                weightRange: [420, 480],
                pureBreedRange: [91, 98],
                confidence: [83, 94],
                traits: {
                    heatTolerance: 'high',
                    diseaseResistance: 'high',
                    milkFatContent: 'medium'
                }
            }
        ];

        // Pick a random breed
        const selectedBreed = cattleBreeds[Math.floor(Math.random() * cattleBreeds.length)];
        
        // Generate random values within the breed's ranges
        const getRandomInRange = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
        
        // Generate health metrics
        const bodyCondition = getRandomInRange(65, 95);
        const immunityStatus = getRandomInRange(60, 90);
        
        // Generate monthly milk production data (with a slight upward trend)
        const baseProduction = getRandomInRange(selectedBreed.milkRange[0], selectedBreed.milkRange[1]);
        const milkProductionData = Array.from({length: 6}, (_, i) => {
            return {
                month: i,
                value: baseProduction * (1 + (i * 0.03) + (Math.random() * 0.04 - 0.02))
            };
        });
        
        // Generate genetic composition
        const pureBreedPercentage = getRandomInRange(selectedBreed.pureBreedRange[0], selectedBreed.pureBreedRange[1]);
        const otherMainBreed = cattleBreeds.filter(breed => breed.name !== selectedBreed.name)[Math.floor(Math.random() * (cattleBreeds.length - 1))];
        const otherBreedPercentage = getRandomInRange(0, 100 - pureBreedPercentage);
        const miscPercentage = 100 - pureBreedPercentage - otherBreedPercentage;
        
        return {
            breed: selectedBreed.name,
            origin: selectedBreed.origin,
            confidence: getRandomInRange(selectedBreed.confidence[0], selectedBreed.confidence[1]),
            weight: getRandomInRange(selectedBreed.weightRange[0], selectedBreed.weightRange[1]) + "kg",
            milkProduction: getRandomInRange(selectedBreed.milkRange[0], selectedBreed.milkRange[1]) + "L/day",
            pureBreed: pureBreedPercentage + "%",
            healthStatus: bodyCondition > 80 ? "Excellent" : bodyCondition > 70 ? "Good" : "Fair",
            bodyCondition: bodyCondition,
            immunity: immunityStatus,
            milkProductionData: milkProductionData,
            geneticComposition: [
                { breed: selectedBreed.name, percentage: pureBreedPercentage },
                { breed: otherMainBreed.name, percentage: otherBreedPercentage },
                { breed: "Other", percentage: miscPercentage }
            ],
            traits: selectedBreed.traits,
            nextVaccination: {
                name: "Foot and Mouth Disease",
                dueIn: Math.floor(Math.random() * 30) + 1
            }
        };
    }

    // Function to update results dashboard with analysis data
    function updateResultsDashboard(results) {
        // Update Overview tab
        document.querySelector('.breed-name').textContent = results.breed;
        document.querySelector('.confidence-level').textContent = results.confidence + "%";
        document.querySelector('.confidence-level').style.width = results.confidence + "%";
        document.querySelector('.result-detail').textContent = results.origin;
        
        // Update stats
        document.querySelectorAll('.stat-value')[0].textContent = results.weight;
        document.querySelectorAll('.stat-value')[1].textContent = results.milkProduction;
        document.querySelectorAll('.stat-value')[2].textContent = results.pureBreed;
        
        // Update genetic traits
        const traitBars = document.querySelectorAll('.trait-bar');
        traitBars[0].className = `trait-bar ${results.traits.heatTolerance}`;
        traitBars[1].className = `trait-bar ${results.traits.diseaseResistance}`;
        traitBars[2].className = `trait-bar ${results.traits.milkFatContent}`;
        
        // Update the vaccination timeline
        const upcomingVaccination = document.querySelector('.timeline-item.upcoming .event');
        const upcomingStatus = document.querySelector('.timeline-item.upcoming .status');
        upcomingVaccination.textContent = results.nextVaccination.name;
        upcomingStatus.textContent = `Due in ${results.nextVaccination.dueIn} days`;
    }

    // Initialize charts with analysis data
    function initCharts(results = null) {
        // Default data if no results are provided
        if (!results) {
            results = {
                bodyCondition: 85,
                immunity: 70,
                milkProductionData: [
                    {month: 0, value: 7.2},
                    {month: 1, value: 7.5},
                    {month: 2, value: 8.0},
                    {month: 3, value: 8.2},
                    {month: 4, value: 8.5},
                    {month: 5, value: 8.4}
                ],
                geneticComposition: [
                    {breed: "Gir", percentage: 78},
                    {breed: "Sahiwal", percentage: 20},
                    {breed: "Other", percentage: 2}
                ]
            };
        }

        // Body Condition Gauge
        const bodyConditionCtx = document.getElementById('bodyConditionGauge').getContext('2d');
        new Chart(bodyConditionCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [results.bodyCondition, 100 - results.bodyCondition],
                    backgroundColor: ['#4CAF50', '#f3f3f3'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            }
        });
        
        // Immunity Gauge
        const immunityCtx = document.getElementById('immunityGauge').getContext('2d');
        new Chart(immunityCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [results.immunity, 100 - results.immunity],
                    backgroundColor: ['#2196F3', '#f3f3f3'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            }
        });
        
        // Milk Production Chart
        const milkProductionCtx = document.getElementById('milkProductionChart').getContext('2d');
        new Chart(milkProductionCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Milk Production (L/day)',
                    data: results.milkProductionData.map(item => item.value),
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: Math.min(...results.milkProductionData.map(item => item.value)) - 1,
                        title: {
                            display: true,
                            text: 'Liters'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
        
        // Genetics Chart
        const geneticsCtx = document.getElementById('geneticsChart').getContext('2d');
        new Chart(geneticsCtx, {
            type: 'pie',
            data: {
                labels: results.geneticComposition.map(item => item.breed),
                datasets: [{
                    data: results.geneticComposition.map(item => item.percentage),
                    backgroundColor: ['#E91E63', '#9C27B0', '#CDDC39'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        align: 'start'
                    }
                }
            }
        });
    }
    
    // Download report button
    document.querySelector('.download-btn').addEventListener('click', function() {
        alert('Generating PDF report... This feature would download a comprehensive report with all analysis data.');
    });
    
    // Share results button
    document.querySelector('.share-btn').addEventListener('click', function() {
        alert('Share via: Email | WhatsApp | Farm Management System\n(This would open sharing options)');
    });
    
    // Recommendation action buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent;
            alert(`Action '${action}' would be integrated with your farm management system.`);
        });
    });
    
    // Chat functionality - Simplified without API key input
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    
    // Enable chat functionality right away
    chatInput.disabled = false;
    sendButton.disabled = false;
    
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessageToChat('user', message);
        chatInput.value = '';
        
        // Show loading indicator
        const loadingMessage = addMessageToChat('loading', 'Thinking...');
        
        // Option 1: Make real API call if you have a valid API key
        if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_HARDCODED_API_KEY") {
            // Make actual API call
            fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            })
            .then(response => response.json())
            .then(data => {
                loadingMessage.remove();
                
                let responseText;
                try {
                    responseText = data.candidates[0].content.parts[0].text;
                } catch (e) {
                    responseText = "Sorry, I couldn't generate a response. Please try again.";
                    if (data.error) {
                        responseText = `Error: ${data.error.message}`;
                    }
                }
                
                addMessageToChat('ai', responseText);
            })
            .catch(error => {
                loadingMessage.remove();
                simulateAIResponse(message, loadingMessage);
            });
        } else {
            // Option 2: Simulate AI responses if no valid API key
            setTimeout(() => {
                loadingMessage.remove();
                simulateAIResponse(message);
            }, 1000);
        }
    }
    
    function simulateAIResponse(userMessage) {
        // Simple response logic based on user message keywords
        let response = '';
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('breed')) {
            response = "Indigenous cattle breeds in India include Gir, Sahiwal, Red Sindhi, Tharparkar and Kankrej. These breeds are known for their heat tolerance, disease resistance and ability to thrive on low-quality feed. Would you like specific information about any of these breeds?";
        } else if (lowerMessage.includes('milk') || lowerMessage.includes('production')) {
            response = "Indigenous cows typically produce 6-12 liters of milk per day. The milk from indigenous breeds has a higher fat content (4-7%) and contains A2 beta casein protein which is considered healthier than A1 protein found in milk from exotic breeds.";
        } else if (lowerMessage.includes('feed') || lowerMessage.includes('feeding')) {
            response = "For indigenous cattle, a balanced diet should include roughage (green fodder, dry fodder) and concentrates. A typical adult cow requires 25-30 kg of green fodder, 5-7 kg of dry fodder, and 2-3 kg of concentrate feed daily, adjusted based on milk production and body weight.";
        } else if (lowerMessage.includes('health') || lowerMessage.includes('disease')) {
            response = "Indigenous cattle are known for their disease resistance but still require regular vaccinations for Foot and Mouth Disease, Hemorrhagic Septicemia, and Black Quarter. Regular deworming every 3-6 months and external parasite control are also important health management practices.";
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = "Hello! How can I assist you with indigenous cattle management today?";
        } else {
            response = "Thank you for your question about indigenous cattle. To provide specific information, could you please ask about breeding, health, feeding practices, milk production, or other specific aspects of indigenous cattle management?";
        }
        
        addMessageToChat('ai', response);
    }
    
    function addMessageToChat(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        if (type === 'loading') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar ${type}-avatar"></div>
                <div class="message-content">${text}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }
});
