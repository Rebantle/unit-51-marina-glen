// ==========================================
// BOOKING FORM FUNCTIONALITY
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const nightsCountElement = document.getElementById('nightsCount');
    const totalPriceElement = document.getElementById('totalPrice');

    const RATE_PER_NIGHT = 2500; // R2,500 per night

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (checkInInput) {
        checkInInput.setAttribute('min', today);
    }

    // Update minimum check-out date when check-in changes
    if (checkInInput && checkOutInput) {
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            const minCheckOut = new Date(checkInDate);
            minCheckOut.setDate(minCheckOut.getDate() + 1); // Minimum 1 night
            
            checkOutInput.setAttribute('min', minCheckOut.toISOString().split('T')[0]);
            
            // Calculate nights and price
            calculateBooking();
        });

        checkOutInput.addEventListener('change', function() {
            calculateBooking();
        });
    }

    // Calculate number of nights and total price
    function calculateBooking() {
        if (!checkInInput || !checkOutInput || !nightsCountElement || !totalPriceElement) {
            return;
        }

        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;

        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            // Calculate difference in milliseconds
            const timeDiff = checkOutDate - checkInDate;
            
            // Convert to days
            const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            if (nights > 0) {
                const totalPrice = nights * RATE_PER_NIGHT;
                
                nightsCountElement.innerHTML = `<strong>${nights} night${nights > 1 ? 's' : ''}</strong>`;
                totalPriceElement.textContent = `R${totalPrice.toLocaleString()}`;

                // Check minimum stay requirement
                if (nights < 2) {
                    nightsCountElement.innerHTML += ' <span style="color: #ff6b35; font-size: 0.9rem;">(Minimum 2 nights required)</span>';
                }
            } else {
                nightsCountElement.innerHTML = '<strong>-</strong>';
                totalPriceElement.textContent = 'R0';
            }
        }
    }

    // Handle form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const checkIn = checkInInput.value;
            const checkOut = checkOutInput.value;
            const guests = document.getElementById('guests').value;
            const specialRequests = document.getElementById('specialRequests') ? document.getElementById('specialRequests').value : '';

            // Validate dates
            if (!checkIn || !checkOut) {
                alert('Please select both check-in and check-out dates.');
                return;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

            // Validate minimum stay
            if (nights < 2) {
                alert('Minimum stay is 2 nights. Please adjust your dates.');
                return;
            }

            // Validate guests
            if (!guests || guests < 1 || guests > 5) {
                alert('Please select a valid number of guests (1-5).');
                return;
            }

            // Calculate total
            const totalPrice = nights * RATE_PER_NIGHT;

            // Create booking summary
            const bookingSummary = `
Booking Request Confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Guest Information:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}

Booking Details:
Property: Marina Glen Unit 51
Check-in: ${formatDate(checkInDate)}
Check-out: ${formatDate(checkOutDate)}
Number of Nights: ${nights}
Number of Guests: ${guests}

Price Breakdown:
Rate per night: R${RATE_PER_NIGHT.toLocaleString()}
Total nights: ${nights}
TOTAL AMOUNT: R${totalPrice.toLocaleString()}

${specialRequests ? 'Special Requests:\n' + specialRequests : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We will contact you within 24 hours to confirm your booking.
            `;

            // Show confirmation
            alert(bookingSummary);

            // Here you would typically send this data to a server
            // For now, we'll just log it and reset the form
            console.log('Booking submitted:', {
                firstName,
                lastName,
                email,
                phone,
                checkIn,
                checkOut,
                nights,
                guests,
                totalPrice,
                specialRequests
            });

            // Optional: Store booking in localStorage for admin view
            storeBooking({
                id: Date.now(),
                firstName,
                lastName,
                email,
                phone,
                checkIn,
                checkOut,
                nights,
                guests,
                totalPrice,
                specialRequests,
                status: 'Pending',
                submittedAt: new Date().toISOString()
            });

            // Reset form
            bookingForm.reset();
            nightsCountElement.innerHTML = '<strong>-</strong>';
            totalPriceElement.textContent = 'R0';

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Format date for display
    function formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-ZA', options);
    }

    // Store booking in localStorage
    function storeBooking(booking) {
        try {
            let bookings = JSON.parse(localStorage.getItem('marinaGlenBookings')) || [];
            bookings.push(booking);
            localStorage.setItem('marinaGlenBookings', JSON.stringify(bookings));
            console.log('Booking stored successfully');
        } catch (error) {
            console.error('Error storing booking:', error);
        }
    }
});

// ==========================================
// AVAILABILITY CALENDAR (OPTIONAL ENHANCEMENT)
// ==========================================

// Function to check if dates are available (placeholder)
function checkAvailability(checkIn, checkOut) {
    // In a real application, this would check against a database
    // For now, we'll just return true
    return true;
}

// ==========================================
// PRICE CALCULATOR UTILITY
// ==========================================

function calculateStayPrice(checkInDate, checkOutDate, ratePerNight = 2500) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    const timeDiff = checkOut - checkIn;
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
        return { nights: 0, total: 0, valid: false };
    }
    
    const total = nights * ratePerNight;
    
    return {
        nights: nights,
        total: total,
        ratePerNight: ratePerNight,
        valid: nights >= 2 // Minimum 2 nights
    };
}

// ==========================================
// EXPORT FOR USE IN OTHER FILES
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateStayPrice,
        checkAvailability
    };
}