// ==========================================
// ADMIN DASHBOARD FUNCTIONALITY
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    setupEventListeners();
});

// Load all bookings from localStorage
function loadBookings() {
    const bookingsTableBody = document.getElementById('bookingTableBody');
    
    if (!bookingsTableBody) {
        console.log('Booking table not found');
        return;
    }

    try {
        const bookings = JSON.parse(localStorage.getItem('marinaGlenBookings')) || [];
        
        if (bookings.length === 0) {
            bookingsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #6C8299;">
                        No bookings yet. Bookings will appear here when guests submit booking requests.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort bookings by submission date (newest first)
        bookings.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        // Clear existing rows
        bookingsTableBody.innerHTML = '';

        // Display each booking
        bookings.forEach((booking, index) => {
            const row = createBookingRow(booking, index);
            bookingsTableBody.appendChild(row);
        });

        console.log(`Loaded ${bookings.length} bookings`);
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #ff6b35;">
                    Error loading bookings. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

// Create a table row for a booking
function createBookingRow(booking, index) {
    const row = document.createElement('tr');
    
    const statusClass = getStatusClass(booking.status);
    
    row.innerHTML = `
        <td>${booking.firstName} ${booking.lastName}</td>
        <td><a href="mailto:${booking.email}" style="color: #006994; text-decoration: none; font-weight: 600;">${booking.email}</a></td>
        <td>${booking.phone}</td>
        <td>${formatDateShort(booking.checkIn)}</td>
        <td>${formatDateShort(booking.checkOut)}</td>
        <td>${booking.nights} night${booking.nights > 1 ? 's' : ''}</td>
        <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
        <td>
            <button onclick="viewBookingDetails(${index})" class="action-btn view-btn">
                <i class="fas fa-eye"></i> View
            </button>
            <button onclick="deleteBooking(${index})" class="action-btn delete-btn">
                <i class="fas fa-trash"></i> Delete
            </button>
        </td>
    `;
    
    return row;
}

// Format date for table display
function formatDateShort(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-ZA', options);
}

// Get CSS class for status badge
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'confirmed':
            return 'status-confirmed';
        case 'pending':
            return 'status-pending';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return 'status-pending';
    }
}

// View booking details
function viewBookingDetails(index) {
    try {
        const bookings = JSON.parse(localStorage.getItem('marinaGlenBookings')) || [];
        const booking = bookings[index];
        
        if (!booking) {
            alert('Booking not found');
            return;
        }

        const details = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.id}
Status: ${booking.status}
Submitted: ${new Date(booking.submittedAt).toLocaleString('en-ZA')}

GUEST INFORMATION:
Name: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Phone: ${booking.phone}

STAY DETAILS:
Property: Marina Glen Unit 51
Check-in: ${formatDateShort(booking.checkIn)}
Check-out: ${formatDateShort(booking.checkOut)}
Number of Nights: ${booking.nights}
Number of Guests: ${booking.guests}

PRICING:
Rate per Night: R2,500
Total Nights: ${booking.nights}
TOTAL AMOUNT: R${booking.totalPrice.toLocaleString()}

${booking.specialRequests ? 'SPECIAL REQUESTS:\n' + booking.specialRequests : 'No special requests'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;

        alert(details);
    } catch (error) {
        console.error('Error viewing booking:', error);
        alert('Error loading booking details');
    }
}

// Delete booking
function deleteBooking(index) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
    }

    try {
        let bookings = JSON.parse(localStorage.getItem('marinaGlenBookings')) || [];
        
        // Remove the booking
        bookings.splice(index, 1);
        
        // Save back to localStorage
        localStorage.setItem('marinaGlenBookings', JSON.stringify(bookings));
        
        // Reload the table
        loadBookings();
        
        alert('Booking deleted successfully');
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Clear all bookings button
    const clearAllBtn = document.getElementById('clearAllBookings');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete ALL bookings? This action cannot be undone!')) {
                localStorage.removeItem('marinaGlenBookings');
                loadBookings();
                alert('All bookings have been cleared');
            }
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBookings');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadBookings();
            alert('Bookings refreshed');
        });
    }

    // Export bookings button
    const exportBtn = document.getElementById('exportBookings');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportBookings);
    }
}

// Export bookings to CSV
function exportBookings() {
    try {
        const bookings = JSON.parse(localStorage.getItem('marinaGlenBookings')) || [];
        
        if (bookings.length === 0) {
            alert('No bookings to export');
            return;
        }

        // Create CSV content
        let csv = 'ID,Name,Email,Phone,Check-in,Check-out,Nights,Guests,Total Price,Status,Special Requests,Submitted\n';
        
        bookings.forEach(booking => {
            csv += `${booking.id},"${booking.firstName} ${booking.lastName}",${booking.email},${booking.phone},${booking.checkIn},${booking.checkOut},${booking.nights},${booking.guests},${booking.totalPrice},${booking.status},"${booking.specialRequests || ''}",${booking.submittedAt}\n`;
        });

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marina-glen-bookings-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Bookings exported successfully!');
    } catch (error) {
        console.error('Error exporting bookings:', error);
        alert('Error exporting bookings');
    }
}

// Make functions globally available
window.viewBookingDetails = viewBookingDetails;
window.deleteBooking = deleteBooking;
// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminLoginTime');
            window.location.href = 'admin-login.html';
        }
    });
    
    logoutBtn.addEventListener('mouseenter', function() {
        this.style.background = '#c82333';
        this.style.transform = 'translateY(-2px)';
    });
    
    logoutBtn.addEventListener('mouseleave', function() {
        this.style.background = '#dc3545';
        this.style.transform = 'translateY(0)';
    });
}