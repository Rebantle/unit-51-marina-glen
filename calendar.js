// ==========================================
// AVAILABILITY CALENDAR
// ==========================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('calendarDays')) {
        renderCalendar();
        
        // Navigation buttons
        document.getElementById('prevMonth').addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }
});

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Update month display
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Get booked dates from localStorage
    const bookedDates = getBookedDates();
    
    // Clear calendar
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(currentYear, currentMonth, day);
        const dateString = formatDate(dateObj);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Check if date is in the past
        if (dateObj < today) {
            dayElement.classList.add('past');
        } else {
            // Check if date is booked
            if (isDateBooked(dateString, bookedDates)) {
                dayElement.classList.add('booked');
            } else {
                dayElement.classList.add('available');
            }
        }
        
        dayElement.innerHTML = `
            <span class="day-number">${day}</span>
            <div class="availability-indicator"></div>
        `;
        
        calendarDays.appendChild(dayElement);
    }
}

function getBookedDates() {
    try {
        const bookings = JSON.parse(localStorage.getItem('marinaGlenBookings')) || [];
        const bookedDates = [];
        
        bookings.forEach(booking => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            
            // Add all dates between check-in and check-out
            for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
                bookedDates.push(formatDate(new Date(d)));
            }
        });
        
        return bookedDates;
    } catch (error) {
        console.error('Error getting booked dates:', error);
        return [];
    }
}

function isDateBooked(dateString, bookedDates) {
    return bookedDates.includes(dateString);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}