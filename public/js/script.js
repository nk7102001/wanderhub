// Bootstrap form validation
(() => {
  'use strict';
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();

// Auto-dismiss toasts after 4 seconds
document.addEventListener('DOMContentLoaded', () => {
  const toasts = document.querySelectorAll('.toast.show');
  toasts.forEach(toast => {
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  });

  // Navbar scroll shadow
  const navbar = document.querySelector('.wh-navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
      } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }
    });
  }

  // Listing card hover animations
  document.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-6px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  // Price card: calculate total when dates change
  const dateInputs = document.querySelectorAll('.date-input input[type="date"]');
  if (dateInputs.length === 2) {
    const updateTotal = () => {
      const checkIn = new Date(dateInputs[0].value);
      const checkOut = new Date(dateInputs[1].value);
      if (!isNaN(checkIn) && !isNaN(checkOut) && checkOut > checkIn) {
        const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const priceEl = document.querySelector('.price-big');
        if (priceEl) {
          const priceText = priceEl.textContent.replace(/[₹,]/g, '');
          const pricePerNight = parseFloat(priceText);
          if (!isNaN(pricePerNight)) {
            const total = pricePerNight * nights;
            let totalEl = document.getElementById('totalPrice');
            if (!totalEl) {
              totalEl = document.createElement('div');
              totalEl.id = 'totalPrice';
              totalEl.className = 'text-muted small mt-2 text-center';
              priceEl.closest('.price-card').querySelector('.btn').before(totalEl);
            }
            totalEl.textContent = `₹${total.toLocaleString('en-IN')} total for ${nights} night${nights > 1 ? 's' : ''}`;
          }
        }
      }
    };
    dateInputs.forEach(inp => inp.addEventListener('change', updateTotal));
  }
});
