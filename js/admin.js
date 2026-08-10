document.addEventListener('DOMContentLoaded', () => {
    const adminContent = document.getElementById('adminContent');
    const adminLoginPrompt = document.getElementById('adminLoginPrompt');
    const tbody = document.getElementById('adminBookingsList');
    const calendarEl = document.getElementById('adminCalendar');

    let calendar;

    function loadBookings() {
        const bookings = JSON.parse(localStorage.getItem('ashwamedh_bookings') || '[]');
        return bookings;
    }

    function saveBookings(bookings) {
        localStorage.setItem('ashwamedh_bookings', JSON.stringify(bookings));
    }

    function renderTable() {
        if (!tbody) return;
        const bookings = loadBookings();
        tbody.innerHTML = '';

        if (bookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No bookings found.</td></tr>`;
            return;
        }

        bookings.reverse().forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-white fw-bold">${b.id}</td>
                <td>
                    <div class="text-white">${b.name}</div>
                    <div class="small text-muted">${b.phone}</div>
                </td>
                <td>
                    <div class="text-white small">Pick: ${b.pickup}</div>
                    <div class="text-white small">Drop: ${b.drop}</div>
                </td>
                <td class="text-white">${b.date}<br><span class="small text-muted">${b.time}</span></td>
                <td class="text-gold">${b.vehicle}</td>
                <td>
                    <span class="badge ${b.status.startsWith('Approved') ? 'bg-success' : (b.status === 'Denied' ? 'bg-danger' : 'bg-warning text-dark')}">
                        ${b.status}
                    </span>
                    ${b.cost ? `<div class="small text-gold mt-1">Cost: ${b.cost}</div>` : ''}
                </td>
                <td>
                    ${b.status === 'Pending' ? `
                        <button class="btn btn-sm btn-success mb-1 w-100" onclick="approveBooking('${b.id}')"><i class="fa-solid fa-check"></i> Approve</button>
                        <button class="btn btn-sm btn-danger w-100" onclick="denyBooking('${b.id}')"><i class="fa-solid fa-xmark"></i> Deny</button>
                    ` : `<button class="btn btn-sm btn-outline-secondary w-100" disabled>Processed</button>`}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.approveBooking = function(id) {
        const cost = prompt("Enter the confirmed cost for this booking (e.g. ₹2000):");
        if (cost === null) return; // cancelled
        
        let bookings = loadBookings();
        let b = bookings.find(x => x.id === id);
        if (b) {
            b.status = 'Approved';
            b.cost = cost;
            saveBookings(bookings);
            renderTable();
            renderCalendar();
        }
    };

    window.denyBooking = function(id) {
        if (!confirm("Are you sure you want to deny this booking?")) return;
        
        let bookings = loadBookings();
        let b = bookings.find(x => x.id === id);
        if (b) {
            b.status = 'Denied';
            saveBookings(bookings);
            renderTable();
            renderCalendar();
        }
    };

    function renderCalendar() {
        if (!calendarEl || typeof FullCalendar === 'undefined') return;
        
        const bookings = loadBookings();
        const events = bookings.filter(b => b.status.startsWith('Approved')).map(b => {
            return {
                title: `${b.vehicle} - ${b.name} (${b.cost})`,
                start: `${b.date}T${b.time}`,
                allDay: false,
                color: '#d4af37' // gold
            };
        });

        if (calendar) {
            calendar.destroy();
        }

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events
        });

        calendar.render();
    }

    // Subscribe to Supabase auth to show/hide admin content dynamically
    if (window.supabase) {
        window.supabase.auth.onAuthStateChange((event, session) => {
            if (session && session.user.email === 'tanmaymotukuri05@gmail.com') {
                if (adminContent) adminContent.classList.remove('d-none');
                if (adminLoginPrompt) adminLoginPrompt.classList.add('d-none');
                renderTable();
                setTimeout(renderCalendar, 100);
            } else {
                if (adminContent) adminContent.classList.add('d-none');
                if (adminLoginPrompt) adminLoginPrompt.classList.remove('d-none');
            }
        });
    }
});
