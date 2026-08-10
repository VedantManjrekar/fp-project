document.addEventListener('DOMContentLoaded', () => {
    const adminContent = document.getElementById('adminContent');
    const adminLoginPrompt = document.getElementById('adminLoginPrompt');
    const tbody = document.getElementById('adminBookingsList');
    const calendarEl = document.getElementById('adminCalendar');

    const SUPABASE_URL = 'https://kyqixnovvokzfavkfdtr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cWl4bm92dm9remZhdmtmZHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTM5NTYsImV4cCI6MjEwMTE2OTk1Nn0.yZZlQihxfT3vv0SgUi5N6glhvJLL8160XB2Gf8wkkT0';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let calendar;
    let globalBookings = [];

    async function loadBookings() {
        const { data, error } = await supabaseClient.from('bookings').select('*').order('id', { ascending: false });
        if (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
        return data || [];
    }

    async function renderTable() {
        if (!tbody) return;
        globalBookings = await loadBookings();
        tbody.innerHTML = '';

        if (globalBookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No bookings found.</td></tr>`;
            return;
        }

        globalBookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-white fw-bold">${b.id}</td>
                <td>
                    <div class="text-white">${b.name}</div>
                    <div class="small text-muted">${b.phone}</div>
                </td>
                <td>
                    <div class="text-white small">Pick: ${b.pickup && b.pickup.startsWith('Live GPS:') ? `<a href="${b.pickup.replace('Live GPS:', '').trim()}" target="_blank" class="btn btn-sm btn-gold-outline py-0 px-2 mt-1"><i class="fa-solid fa-location-dot"></i> Live Location</a>` : b.pickup}</div>
                    <div class="text-white small mt-1">Drop: ${b.drop && b.drop.startsWith('Live GPS:') ? `<a href="${b.drop.replace('Live GPS:', '').trim()}" target="_blank" class="btn btn-sm btn-gold-outline py-0 px-2 mt-1"><i class="fa-solid fa-location-dot"></i> Live Location</a>` : b.drop}</div>
                </td>
                <td class="text-white">${b.date}<br><span class="small text-muted">${b.time}</span></td>
                <td class="text-gold">${b.vehicle}</td>
                <td>
                    <span class="badge ${b.status && b.status.startsWith('Approved') ? 'bg-success' : (b.status === 'Denied' ? 'bg-danger' : 'bg-warning text-dark')}">
                        ${b.status || 'Pending'}
                    </span>
                    ${b.cost ? `<div class="small text-gold mt-1">Cost: ₹${b.cost}</div>` : ''}
                </td>
                <td>
                    ${!b.status || b.status === 'Pending' ? `
                        <button class="btn btn-sm btn-success mb-1 w-100" onclick="approveBooking('${b.id}')"><i class="fa-solid fa-check"></i> Approve</button>
                        <button class="btn btn-sm btn-danger w-100" onclick="denyBooking('${b.id}')"><i class="fa-solid fa-xmark"></i> Deny</button>
                    ` : `<button class="btn btn-sm btn-outline-secondary w-100" disabled>Processed</button>`}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.approveBooking = async function(id) {
        const cost = prompt("Enter the confirmed cost for this booking (e.g. 2000):");
        if (cost === null) return; 
        
        const { error } = await supabaseClient.from('bookings').update({ status: 'Approved', cost }).eq('id', id);
        if (error) {
            alert("Error approving: " + error.message);
        }
    };

    window.denyBooking = async function(id) {
        if (!confirm("Are you sure you want to deny this booking?")) return;
        
        const { error } = await supabaseClient.from('bookings').update({ status: 'Denied' }).eq('id', id);
        if (error) {
            alert("Error denying: " + error.message);
        }
    };

    function renderCalendar() {
        if (!calendarEl || typeof FullCalendar === 'undefined') return;
        
        const events = globalBookings.filter(b => b.status && b.status.startsWith('Approved')).map(b => {
            let shortVehicle = b.vehicle;
            const vLower = b.vehicle.toLowerCase();
            if (vLower.includes('hycross')) shortVehicle = 'HC';
            else if (vLower.includes('crysta')) shortVehicle = 'IC';
            else if (vLower.includes('dzire')) shortVehicle = 'SD';
            else if (vLower.includes('ertiga')) shortVehicle = 'ER';
            else if (vLower.includes('traveller')) shortVehicle = 'TT';
            else shortVehicle = b.vehicle.substring(0, 2).toUpperCase();

            return {
                title: `${shortVehicle} - ${b.name.split(' ')[0]}`,
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
            events: events,
            eventClick: function(info) {
                // Scroll down to the bookings table
                document.getElementById('adminBookingsList').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        calendar.render();
    }

    // Subscribe to Supabase auth to show/hide admin content dynamically
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && session.user.email === 'tanmaymotukuri05@gmail.com') {
            if (adminContent) adminContent.classList.remove('d-none');
            if (adminLoginPrompt) adminLoginPrompt.classList.add('d-none');
            
            // Render initial data
            renderTable().then(() => renderCalendar());
            
            // Subscribe to real-time changes
            supabaseClient
                .channel('admin_bookings')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
                    renderTable().then(() => renderCalendar());
                })
                .subscribe();

        } else {
            if (adminContent) adminContent.classList.add('d-none');
            if (adminLoginPrompt) adminLoginPrompt.classList.remove('d-none');
        }
    });
});
