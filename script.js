window.selectedIngredients = {
    top: [],
    heart: [],
    base: []
};

window.cart = {
    samples: [],
    bottles: []
};

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeIngredientSelection();
    updateSamplePricing();
});

function initializeAnimations() {
    const typingTexts = document.querySelectorAll('.typing-text');
    
    typingTexts.forEach(text => {
        const delay = parseInt(text.dataset.delay) || 0;
        setTimeout(() => {
            typeText(text, text.dataset.text);
        }, delay);
    });

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(element => {
        const delay = parseInt(element.dataset.delay) || 0;
        setTimeout(() => {
            element.style.animationDelay = '0s';
            element.classList.add('fade-in-up');
        }, delay);
    });
}

function typeText(element, text) {
    element.style.opacity = '1';
    let index = 0;
    element.textContent = '';
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, 50);
        }
    }
    
    type();
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    const offsetTop = element.offsetTop - 80;
    
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
}

function initializeIngredientSelection() {
    // Direct approach with force event attachment
    const ingredientCards = document.querySelectorAll('.ingredient-card');
    console.log('Initializing ingredient selection for', ingredientCards.length, 'cards');
    
    ingredientCards.forEach((card, index) => {
        console.log(`Setting up card ${index}:`, card.dataset.ingredient);
        
        // Remove any existing onclick
        card.removeAttribute('onclick');
        
        // Add click listener with capture and immediate handling
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Card clicked:', this.dataset.ingredient);
            toggleIngredient(this);
        }, { capture: true });
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            showIngredientTooltip(this);
        });
        
        card.addEventListener('mouseleave', function() {
            hideIngredientTooltip();
        });
    });
}

function toggleIngredient(element) {
    const ingredient = element.dataset.ingredient;
    const category = element.closest('.pyramid-section').dataset.category;
    
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        removeIngredient(category, ingredient);
        animateDeselection(element);
    } else {
        element.classList.add('selected');
        addIngredient(category, ingredient);
        animateSelection(element);
    }
    
    updateBlendSummary();
    updateIntensityMeter();
}

function animateSelection(element) {
    element.style.transform = 'scale(1.05)';
    setTimeout(() => {
        element.style.transform = '';
    }, 200);
}

function animateDeselection(element) {
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = '';
    }, 200);
}

function addIngredient(category, ingredient) {
    if (!window.selectedIngredients[category].includes(ingredient)) {
        window.selectedIngredients[category].push(ingredient);
    }
}

function removeIngredient(category, ingredient) {
    const index = window.selectedIngredients[category].indexOf(ingredient);
    if (index > -1) {
        window.selectedIngredients[category].splice(index, 1);
    }
}

function updateBlendSummary() {
    const summaryElement = document.getElementById('selected-ingredients');
    const totalSelected = getTotalSelectedCount();
    
    if (totalSelected === 0) {
        summaryElement.innerHTML = `
            <div class="empty-state">
                <p>Select ingredients to create your unique scent</p>
            </div>
        `;
    } else {
        let summaryHTML = '<div class="blend-details">';
        
        if (window.selectedIngredients.top.length > 0) {
            summaryHTML += `
                <div class="note-group top">
                    <div class="note-header">
                        <span class="note-type">Top Notes</span>
                        <span class="note-count">${window.selectedIngredients.top.length}</span>
                    </div>
                    <div class="note-ingredients">${window.selectedIngredients.top.join(' • ')}</div>
                </div>
            `;
        }
        
        if (window.selectedIngredients.heart.length > 0) {
            summaryHTML += `
                <div class="note-group heart">
                    <div class="note-header">
                        <span class="note-type">Heart Notes</span>
                        <span class="note-count">${window.selectedIngredients.heart.length}</span>
                    </div>
                    <div class="note-ingredients">${window.selectedIngredients.heart.join(' • ')}</div>
                </div>
            `;
        }
        
        if (window.selectedIngredients.base.length > 0) {
            summaryHTML += `
                <div class="note-group base">
                    <div class="note-header">
                        <span class="note-type">Base Notes</span>
                        <span class="note-count">${window.selectedIngredients.base.length}</span>
                    </div>
                    <div class="note-ingredients">${window.selectedIngredients.base.join(' • ')}</div>
                </div>
            `;
        }
        
        summaryHTML += '</div>';
        summaryElement.innerHTML = summaryHTML;
    }
}

function getTotalSelectedCount() {
    return window.selectedIngredients.top.length + 
           window.selectedIngredients.heart.length + 
           window.selectedIngredients.base.length;
}

function updateIntensityMeter() {
    const totalSelected = getTotalSelectedCount();
    const maxIngredients = 15;
    const intensity = Math.min((totalSelected / maxIngredients) * 100, 100);
    
    const intensityFill = document.getElementById('intensity-fill');
    if (intensityFill) {
        intensityFill.style.width = intensity + '%';
    }
}

function updateSamplePricing() {
    const sampleSelect = document.getElementById('sample-count');
    sampleSelect.addEventListener('change', function() {
        updateSamplePrice();
    });
}

function updateSamplePrice() {
    const sampleCount = parseInt(document.getElementById('sample-count').value);
    let price;
    
    if (sampleCount <= 5) {
        price = 6.99;
    } else {
        price = 6.99 + ((sampleCount - 5) * 1.99);
    }
    
    const options = document.getElementById('sample-count').options;
    for (let option of options) {
        const count = parseInt(option.value);
        let optionPrice;
        if (count <= 5) {
            optionPrice = 6.99;
        } else {
            optionPrice = 6.99 + ((count - 5) * 1.99);
        }
        option.text = `${count} samples - $${optionPrice.toFixed(2)}`;
    }
}

function orderSamples() {
    const totalSelected = getTotalSelectedCount();
    
    if (totalSelected === 0) {
        showNotification('Please select at least one ingredient to create your sample.', 'warning');
        return;
    }
    
    const sampleCount = parseInt(document.getElementById('sample-count').value);
    let price = sampleCount <= 5 ? 6.99 : 6.99 + ((sampleCount - 5) * 1.99);
    
    const blend = {
        top: [...window.selectedIngredients.top],
        heart: [...window.selectedIngredients.heart],
        base: [...window.selectedIngredients.base]
    };
    
    const sampleOrder = {
        type: 'samples',
        count: sampleCount,
        price: price,
        blend: blend,
        timestamp: new Date().toISOString()
    };
    
    window.cart.samples.push(sampleOrder);
    
    showOrderConfirmation('samples', sampleCount, price, blend);
}

function orderBottle(size, price) {
    const totalSelected = getTotalSelectedCount();
    
    if (totalSelected === 0) {
        showNotification('Please select ingredients to create your custom scent.', 'warning');
        return;
    }
    
    const blend = {
        top: [...window.selectedIngredients.top],
        heart: [...window.selectedIngredients.heart],
        base: [...window.selectedIngredients.base]
    };
    
    const bottleOrder = {
        type: 'bottle',
        size: size,
        price: price,
        blend: blend,
        timestamp: new Date().toISOString()
    };
    
    window.cart.bottles.push(bottleOrder);
    
    showOrderConfirmation('bottle', size, price, blend);
}

function showOrderConfirmation(type, details, price, blend) {
    const modal = createOrderModal(type, details, price, blend);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function createOrderModal(type, details, price, blend) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    
    let title, description;
    if (type === 'samples') {
        title = `${details} Sample Vials Ordered!`;
        description = `We'll prepare your custom sample kit and send you tracking information via email.`;
    } else {
        title = `${details} Bottle Ordered!`;
        description = `Your custom fragrance will be crafted and shipped within 5-7 business days.`;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div class="order-summary">
                    <div class="price-display">$${price.toFixed(2)}</div>
                    <p>${description}</p>
                </div>
                <div class="blend-preview">
                    <h4>Your Custom Blend:</h4>
                    ${generateBlendPreview(blend)}
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn secondary" onclick="closeModal(this)">Continue Shopping</button>
                <button class="modal-btn primary" onclick="closeModal(this)">Done</button>
            </div>
        </div>
    `;
    
    return modal;
}

function generateBlendPreview(blend) {
    let preview = '';
    
    if (blend.top.length > 0) {
        preview += `<div class="blend-category"><strong>Top:</strong> ${blend.top.join(', ')}</div>`;
    }
    if (blend.heart.length > 0) {
        preview += `<div class="blend-category"><strong>Heart:</strong> ${blend.heart.join(', ')}</div>`;
    }
    if (blend.base.length > 0) {
        preview += `<div class="blend-category"><strong>Base:</strong> ${blend.base.join(', ')}</div>`;
    }
    
    return preview;
}

function closeModal(button) {
    const modal = button.closest('.order-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function clearBlend() {
    window.selectedIngredients = { top: [], heart: [], base: [] };
    
    document.querySelectorAll('.ingredient-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    
    updateBlendSummary();
    updateIntensityMeter();
}

function showIngredientTooltip(element) {
    const ingredient = element.dataset.ingredient;
    const descriptions = {
        'bergamot': 'Citrusy and fresh with a subtle floral undertone',
        'lemon': 'Bright, clean, and energizing citrus',
        'grapefruit': 'Zesty and invigorating with a bitter-sweet edge',
        'neroli': 'Delicate orange blossom with honeyed sweetness',
        'rose': 'Classic floral with romantic elegance',
        'jasmine': 'Intoxicating and sensual white flower',
        'lavender': 'Calming and aromatic herbal freshness',
        'geranium': 'Green and rosy with mint-like facets',
        'ylang-ylang': 'Exotic tropical flower with creamy sweetness',
        'black-pepper': 'Spicy and warm with a woody edge',
        'sandalwood': 'Creamy, smooth, and meditative wood',
        'cedarwood': 'Dry, woody, and masculine',
        'vetiver': 'Earthy, smoky, and sophisticated grass',
        'patchouli': 'Rich, dark, and mystical earth',
        'tobacco': 'Warm, honeyed, and luxurious leaf'
    };
    
    if (descriptions[ingredient]) {
        element.title = descriptions[ingredient];
    }
}

function hideIngredientTooltip() {
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        clearBlend();
        
        const modals = document.querySelectorAll('.order-modal');
        modals.forEach(modal => {
            closeModal(modal.querySelector('.modal-close'));
        });
    }
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});