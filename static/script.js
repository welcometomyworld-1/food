document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const predictBtn = document.getElementById('predictBtn');
    const dropZone = document.getElementById('dropZone');
    const resultContainer = document.getElementById('resultContainer');
    const loading = document.getElementById('loading');
    const resultContent = document.getElementById('resultContent');
    const resultBadge = document.getElementById('resultBadge');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const confidenceValue = document.getElementById('confidenceValue');
    const recommendationText = document.getElementById('recommendationText');

    // Handle Drop Zone click
    dropZone.addEventListener('click', () => {
        imageInput.click();
    });

    // Handle File Selection
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            updateImagePreview(file);
        }
    });

    // Drag and Drop Events
    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener('dragover', () => {
        dropZone.classList.add('drop-zone--over');
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drop-zone--over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            imageInput.files = e.dataTransfer.files;
            updateImagePreview(file);
        }
    });

    function updateImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
            dropZone.style.display = 'none';
            predictBtn.disabled = false;
            
            // Scroll to preview
            imagePreviewContainer.scrollIntoView({ behavior: 'smooth' });
        };
        reader.readAsDataURL(file);
    }

    // Handle Prediction
    predictBtn.addEventListener('click', async () => {
        const file = imageInput.files[0];
        if (!file) return;

        // Reset and Show Loading
        resultContainer.style.display = 'block';
        loading.style.display = 'block';
        resultContent.style.display = 'none';
        predictBtn.disabled = true;

        // Smooth scroll to loading
        resultContainer.scrollIntoView({ behavior: 'smooth' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Simulate network delay for better UX feeling
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                displayResult(data.result, data.confidence);
            } else {
                alert('Analysis Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error during prediction:', error);
            alert('Something went wrong. Please check your connection.');
        } finally {
            loading.style.display = 'none';
            predictBtn.disabled = false;
        }
    });

    function displayResult(result, confidence) {
        resultContent.style.display = 'block';
        resultText.textContent = result === 'Fresh' ? 'Optimal Freshness' : 'Spoilage Detected';
        
        // Confidence counter animation
        animateValue(confidenceValue, 0, (confidence * 100).toFixed(1), 1000);

        // Reset classes
        resultBadge.classList.remove('fresh', 'spoiled');
        resultIcon.classList.remove('fa-check-circle', 'fa-exclamation-triangle');

        if (result === 'Fresh') {
            resultBadge.classList.add('fresh');
            resultIcon.classList.add('fa-check-circle');
            recommendationText.textContent = "This item appears safe for consumption. Store in a cool, dry place to maintain quality.";
        } else {
            resultBadge.classList.add('spoiled');
            resultIcon.classList.add('fa-exclamation-triangle');
            recommendationText.textContent = "Warning: Indicators of spoilage found. We recommend not consuming this item. Check for unusual odors or mold.";
        }
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(1);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
