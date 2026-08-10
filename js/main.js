/* -------------------------------------------------------------
   ASHWAMEDH TRAVEL SERVICES - MAIN JAVASCRIPT
   Interactive Fare Estimator, WhatsApp Messenger & UI Enhancements
   ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // --- Supabase Authentication & Location Logic ---
    const SUPABASE_URL = 'https://kyqixnovvokzfavkfdtr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cWl4bm92dm9remZhdmtmZHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTM5NTYsImV4cCI6MjEwMTE2OTk1Nn0.yZZlQihxfT3vv0SgUi5N6glhvJLL8160XB2Gf8wkkT0';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let currentUser = null;
    const authBtn = document.getElementById('authBtn');
    const authBtnText = document.getElementById('authBtnText');

    let isAdmin = false;

    async function handleAuth() {
        console.log("Auth button clicked!");
        if (currentUser) {
            await supabase.auth.signOut();
            window.location.reload();
        } else {
            // Show custom login modal
            showLoginModal();
        }
    }

    function showLoginModal() {
        let modalEl = document.getElementById('unifiedLoginModal');
        if (!modalEl) {
            const modalHtml = `
            <div class="modal fade" id="unifiedLoginModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content modal-content-dark">
                        <div class="modal-header modal-header-dark border-0">
                            <h5 class="modal-title font-subheading text-gold">Choose Login Type</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <button id="btnUserLogin" class="btn btn-outline-light w-100 mb-3 d-flex justify-content-center align-items-center gap-2">
                                <i class="fa-brands fa-google"></i> Login as User
                            </button>
                            <div class="text-muted small mb-3">OR</div>
                            <button id="btnAdminLogin" class="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2">
                                <i class="fa-brands fa-google"></i> Login as Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modalEl = document.getElementById('unifiedLoginModal');
            
            const handleGoogleLogin = async (redirectUrl) => {
                const { data, error } = await supabase.auth.signInWithOAuth({ 
                    provider: 'google',
                    options: {
                        redirectTo: redirectUrl
                    }
                });
                if (error) alert("Login Error: " + error.message);
            };

            document.getElementById('btnUserLogin').onclick = () => handleGoogleLogin('http://localhost:53827');
            document.getElementById('btnAdminLogin').onclick = () => handleGoogleLogin('http://localhost:3000');
        }
        
        const loginModal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        loginModal.show();
    }

    if (authBtn) {
        authBtn.addEventListener('click', handleAuth);
    }

    function toggleAdminNavItems(isAdminUser) {
        const routeLinks = document.querySelectorAll('a[href="routes.html"]');
        const enquiryLinks = document.querySelectorAll('a[href="enquiry.html"]');
        const bookLinks = document.querySelectorAll('a[href="book.html"]');
        
        [...routeLinks, ...enquiryLinks, ...bookLinks].forEach(el => {
            const navItem = el.closest('.nav-item');
            if (navItem) {
                if (isAdminUser) {
                    navItem.classList.add('d-none');
                } else {
                    navItem.classList.remove('d-none');
                }
            }
        });
    }

    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUser = session.user;
            isAdmin = (currentUser.email === 'tanmaymotukuri05@gmail.com');
            
            toggleAdminNavItems(isAdmin);
            
            if (authBtnText) authBtnText.textContent = 'Logout';
            if (document.getElementById('dashboardNav')) document.getElementById('dashboardNav').classList.remove('d-none');
            if (isAdmin && document.getElementById('adminNav')) document.getElementById('adminNav').classList.remove('d-none');
            
            // Safely wait for Bootstrap to initialize
            const checkBootstrap = setInterval(() => {
                if (window.bootstrap) {
                    clearInterval(checkBootstrap);
                    const savedLocation = localStorage.getItem('userLocation');
                    if (!savedLocation) {
                        const locationModalEl = document.getElementById('locationModal');
                        if (locationModalEl) {
                            const locationModal = window.bootstrap.Modal.getOrCreateInstance(locationModalEl);
                            locationModal.show();
                            
                            document.getElementById('saveLocationBtn').onclick = () => {
                                const loc = document.getElementById('userResidence').value.trim();
                                if (loc) {
                                    localStorage.setItem('userLocation', loc);
                                    locationModal.hide();
                                    
                                    // Failsafe to remove any stuck backdrops
                                    setTimeout(() => {
                                        const backdrops = document.querySelectorAll('.modal-backdrop');
                                        backdrops.forEach(b => b.remove());
                                        document.body.classList.remove('modal-open');
                                        document.body.style.overflow = '';
                                        document.body.style.paddingRight = '';
                                    }, 300);
                                }
                            };
                        }
                    }
                }
            }, 100);
        } else {
            currentUser = null;
            isAdmin = false;
            
            toggleAdminNavItems(false);
            
            if (authBtnText) authBtnText.textContent = 'Login';
            if (document.getElementById('dashboardNav')) document.getElementById('dashboardNav').classList.add('d-none');
            if (document.getElementById('adminNav')) document.getElementById('adminNav').classList.add('d-none');
        }
    });

    window.sendWhatsAppInquiry = function(baseMessage) {
        let authIntro = "";
        if (currentUser && currentUser.user_metadata && currentUser.user_metadata.full_name) {
            const name = currentUser.user_metadata.full_name;
            const loc = localStorage.getItem('userLocation');
            if (loc) {
                authIntro = `Hi! I am ${name} and I reside in ${loc}.\n\n`;
            } else {
                authIntro = `Hi! I am ${name}.\n\n`;
            }
        }
        
        const finalMessage = authIntro + baseMessage;
        const encodedMsg = encodeURIComponent(finalMessage);
        window.open(`https://wa.me/919869692026?text=${encodedMsg}`, '_blank');
    };


    // Tariff Data Matrix (Exact rates from Image 1 & Image 2)
    const TARIFF_DATA = {
        dzire: {
            name: "Swift Dzire (Sedan)",
            airport: 1400,
            halfDay: 1800,
            fullDay: 2200,
            puneOneWay: 3000,
            extraHr: 125,
            extraKm: 18,
            outstationDA: 500,
            permit: 0,
            image: "assets/images/dzire.png",
            seats: "4+1 Seater",
            luggage: "2 Bags"
        },
        carens: {
            name: "Kia Carens (MUV)",
            airport: 1800,
            halfDay: 2800,
            fullDay: 3520,
            puneOneWay: 4000,
            extraHr: 180,
            extraKm: 18,
            outstationDA: 500,
            permit: 0,
            image: "assets/images/carens.png",
            seats: "6+1 Seater",
            luggage: "3 Bags"
        },
        crysta: {
            name: "Innova Crysta (Luxury MUV)",
            airport: 2200,
            halfDay: 3100,
            fullDay: 4000,
            puneOneWay: 5000,
            extraHr: 220,
            extraKm: 22,
            outstationDA: 500,
            permit: 0,
            image: "assets/images/crysta.jpg",
            seats: "6+1 / 7+1 Seater",
            luggage: "4 Bags"
        },
        hycross: {
            name: "Innova Hycross (Hybrid MPV)",
            airport: 2500,
            halfDay: 3700,
            fullDay: 4700,
            puneOneWay: 6500,
            extraHr: 250,
            extraKm: 25,
            outstationDA: 500,
            permit: 0,
            image: "assets/images/innova_hycross.jpg",
            seats: "6+1 / 7+1 Seater",
            luggage: "4 Bags"
        },
        urbania: {
            name: "Force Urbania (Luxury Mini Van)",
            airport: 5750,
            halfDay: 7500,
            fullDay: 9700,
            puneOneWay: 12000,
            extraHr: 550,
            extraKm: 55,
            outstationDA: 1000,
            permit: 1000,
            image: "assets/images/urbania.jpg",
            seats: "13 / 17 Seater",
            luggage: "10+ Bags"
        }
    };

    // Sticky Navbar Handler
    const navbar = document.querySelector('.navbar-custom');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Quick Fare Estimator Logic
    const estVehicleSelect = document.getElementById('estVehicle');
    const estTripSelect = document.getElementById('estTrip');
    const estPriceDisplay = document.getElementById('estPrice');
    const estBreakdownDisplay = document.getElementById('estBreakdown');

    function updatePriceEstimate() {
        if (!estVehicleSelect || !estTripSelect) return;
        
        const selectedVehicleKey = estVehicleSelect.value;
        const selectedTripKey = estTripSelect.value;
        const vehicle = TARIFF_DATA[selectedVehicleKey];

        if (!vehicle) return;

        let basePrice = 0;
        let breakdownText = "";

        switch (selectedTripKey) {
            case 'airport':
                basePrice = vehicle.airport;
                breakdownText = `Fixed Airport Transfer (Drop/Pickup)`;
                break;
            case 'halfDay':
                basePrice = vehicle.halfDay;
                breakdownText = `8 Hours / 80 Kms Local City Tour (Extra Hr: ₹${vehicle.extraHr}, Extra Km: ₹${vehicle.extraKm})`;
                break;
            case 'fullDay':
                basePrice = vehicle.fullDay;
                breakdownText = `10 Hours / 100 Kms Local City Tour (Extra Hr: ₹${vehicle.extraHr}, Extra Km: ₹${vehicle.extraKm})`;
                break;
            case 'puneOneWay':
                basePrice = vehicle.puneOneWay;
                breakdownText = `Mumbai to Pune One Way Package (Toll & parking extra)`;
                break;
            case 'outstation':
                basePrice = vehicle.fullDay;
                breakdownText = `Outstation Use (Daily Driver Allowance: ₹${vehicle.outstationDA}, Permit: ₹${vehicle.permit})`;
                break;
            default:
                basePrice = vehicle.airport;
                breakdownText = `Fixed Rate Package`;
        }

        estPriceDisplay.textContent = `₹${basePrice.toLocaleString('en-IN')}/-`;
        estBreakdownDisplay.textContent = breakdownText;
    }

    if (estVehicleSelect && estTripSelect) {
        estVehicleSelect.addEventListener('change', updatePriceEstimate);
        estTripSelect.addEventListener('change', updatePriceEstimate);
        updatePriceEstimate();
    }

    // WhatsApp Message Dispatcher from Hero Estimator Form
    const heroForm = document.getElementById('heroBookingForm');
    if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('estName').value.trim() || 'Valued Customer';
            const phone = document.getElementById('estPhone').value.trim() || 'Not Provided';
            const vehicleKey = estVehicleSelect.value;
            const tripKey = estTripSelect.value;
            const pickup = document.getElementById('estPickup').value.trim() || 'Mumbai';
            const date = document.getElementById('estDate').value || 'Flexible';

            const vehicle = TARIFF_DATA[vehicleKey];
            const price = estPriceDisplay.textContent;

            const message = 
`*NEW TRIP ENQUIRY - ASHWAMEDH TRAVEL SERVICES*
----------------------------------------
👤 *Passenger Name:* ${name}
📞 *Phone Number:* ${phone}
🚗 *Vehicle Chosen:* ${vehicle ? vehicle.name : 'Car'}
🛣️ *Trip Type:* ${estTripSelect.options[estTripSelect.selectedIndex].text}
📍 *Pickup Location:* ${pickup}
📅 *Date of Travel:* ${date}
----------------------------------------
💰 *Estimated Base Tariff:* ${price}
ℹ️ *Note:* Tolls, parking, and 5% GST extra at actuals.

Please confirm availability and finalize my booking!`;

            window.sendWhatsAppInquiry(message);
        });
    }

    // Booking Inquiry Form Section Handler
    const mainEnquiryForm = document.getElementById('mainEnquiryForm');
    if (mainEnquiryForm) {
        mainEnquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('enqName').value.trim();
            const phone = document.getElementById('enqPhone').value.trim();
            const vehicle = document.getElementById('enqVehicle').value;
            const trip = document.getElementById('enqTrip').value;
            const pickup = document.getElementById('enqPickup').value.trim();
            const drop = document.getElementById('enqDrop').value.trim();
            const date = document.getElementById('enqDate').value;
            const notes = document.getElementById('enqNotes').value.trim();

            const message = 
`*BOOKING ENQUIRY - ASHWAMEDH TRAVEL SERVICES*
----------------------------------------
👤 *Name:* ${name}
📞 *Contact:* ${phone}
🚗 *Car:* ${vehicle}
🛣️ *Trip Type:* ${trip}
📍 *Pickup:* ${pickup}
🏁 *Drop Location:* ${drop || 'As per itinerary'}
📅 *Travel Date:* ${date}
📝 *Special Notes:* ${notes || 'None'}
----------------------------------------
Please call me back to confirm pricing and availability.`;

            window.sendWhatsAppInquiry(message);
        });
    }

    // Modal Car Details Opener
    window.openCarModal = function(carKey) {
        const vehicle = TARIFF_DATA[carKey];
        if (!vehicle) return;

        document.getElementById('modalCarTitle').textContent = vehicle.name;
        document.getElementById('modalCarImg').src = vehicle.image;
        document.getElementById('modalSeats').textContent = vehicle.seats;
        document.getElementById('modalLuggage').textContent = vehicle.luggage;
        
        document.getElementById('modalAirportRate').textContent = `₹${vehicle.airport.toLocaleString('en-IN')}/-`;
        document.getElementById('modalHalfDayRate').textContent = `₹${vehicle.halfDay.toLocaleString('en-IN')}/-`;
        document.getElementById('modalFullDayRate').textContent = `₹${vehicle.fullDay.toLocaleString('en-IN')}/-`;
        document.getElementById('modalExtraHrRate').textContent = `₹${vehicle.extraHr}/- per hr`;
        document.getElementById('modalExtraKmRate').textContent = `₹${vehicle.extraKm}/- per km`;
        document.getElementById('modalDARate').textContent = `₹${vehicle.outstationDA}/- per day`;

        const bookingBtn = document.getElementById('modalBookBtn');
        bookingBtn.onclick = () => {
            const msg = `Hi Ashwamedh Travels, I want to book *${vehicle.name}*. Please share availability and payment details.`;
            window.sendWhatsAppInquiry(msg);
        };

        const carModal = new window.bootstrap.Modal(document.getElementById('carDetailModal'));
        carModal.show();
    };

    // Smooth Scroll for Navigation Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile navbar if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // Robust Tab Switching for Tariff Matrix (Fallback/Override)
    const quickPackagesBtn = document.getElementById('quick-packages-tab');
    const fullMatrixBtn = document.getElementById('full-matrix-tab');
    const quickPackagesPane = document.getElementById('quick-packages');
    const fullMatrixPane = document.getElementById('full-matrix');

    if (quickPackagesBtn && fullMatrixBtn && quickPackagesPane && fullMatrixPane) {
        quickPackagesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                if (typeof bootstrap !== 'undefined') {
                    const tab = new bootstrap.Tab(quickPackagesBtn);
                    tab.show();
                    return;
                }
            } catch (err) {}
            
            // Manual Fallback
            fullMatrixBtn.classList.remove('active');
            quickPackagesBtn.classList.add('active');
            fullMatrixPane.classList.remove('show', 'active');
            quickPackagesPane.classList.add('show', 'active');
        });
        
        fullMatrixBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                if (typeof bootstrap !== 'undefined') {
                    const tab = new bootstrap.Tab(fullMatrixBtn);
                    tab.show();
                    return;
                }
            } catch (err) {}
            
            // Manual Fallback
            quickPackagesBtn.classList.remove('active');
            fullMatrixBtn.classList.add('active');
            quickPackagesPane.classList.remove('show', 'active');
            fullMatrixPane.classList.add('show', 'active');
        });
    }

});

// Global Function to Detect Precise GPS Location
window.getCurrentLocation = function(inputId) {
    const inputField = document.getElementById(inputId);
    if (!inputField) return;

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser. Please type your location manually.");
        return;
    }

    const originalPlaceholder = inputField.placeholder;
    inputField.value = "Fetching GPS Location...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            try {
                // Convert coordinates to real address
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                const data = await response.json();
                
                if (data && data.display_name) {
                    let shortAddress = [];
                    if (data.address.suburb || data.address.neighbourhood) shortAddress.push(data.address.suburb || data.address.neighbourhood);
                    if (data.address.city || data.address.town || data.address.county) shortAddress.push(data.address.city || data.address.town || data.address.county);
                    
                    inputField.value = shortAddress.length > 0 ? shortAddress.join(", ") : data.display_name.split(",").slice(0, 3).join(", ");
                } else {
                    // Fallback if API fails to find a name
                    inputField.value = `Live GPS: https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                // Fallback on network error
                inputField.value = `Live GPS: https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
            }
        },
        (error) => {
            inputField.value = "";
            inputField.placeholder = originalPlaceholder;
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("Location permission denied. Please allow location access or enter your pickup address manually.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information unavailable. Please enter location manually.");
                    break;
                case error.TIMEOUT:
                    alert("Location request timed out. Please try again or type manually.");
                    break;
                default:
                    alert("Unable to fetch location. Please type manually.");
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

// --- Dashboards & Multi-Page Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Re-initialize supabase client if needed, or use the global window.supabase
    const SUPABASE_URL = 'https://kyqixnovvokzfavkfdtr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cWl4bm92dm9remZhdmtmZHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTM5NTYsImV4cCI6MjEwMTE2OTk1Nn0.yZZlQihxfT3vv0SgUi5N6glhvJLL8160XB2Gf8wkkT0';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let authUser = null;

    supabaseClient.auth.onAuthStateChange((event, session) => {
        const dashboardNav = document.getElementById('dashboardNav');
        const adminNav = document.getElementById('adminNav');

        if (session) {
            authUser = session.user;
            if (dashboardNav) dashboardNav.classList.remove('d-none');
            
            // Basic Admin check based on email for demonstration
            if (authUser.email === 'tanmaymotukuri05@gmail.com') { 
                if (adminNav) adminNav.classList.remove('d-none');
                
                // Hide 'My Bookings' on the user dashboard if admin
                const userBookingsContainer = document.getElementById('userBookingsContainer');
                if (userBookingsContainer) {
                    userBookingsContainer.classList.add('d-none');
                }
            }

            // Populate dashboard profile if elements exist
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            if (profileName) profileName.textContent = authUser.user_metadata?.full_name || 'Customer';
            if (profileEmail) profileEmail.textContent = authUser.email;

            // Load bookings if on dashboard
            if (document.getElementById('userBookingsList')) {
                loadUserBookings(authUser);
            }
            // Admin bookings are handled in admin.js

            // Show secure content
            if (document.getElementById('dashboardContent')) {
                document.getElementById('dashboardContent').classList.remove('d-none');
                document.getElementById('loginPrompt').classList.add('d-none');
            }

            if (document.getElementById('adminContent') && authUser.email === 'tanmaymotukuri05@gmail.com') {
                document.getElementById('adminContent').classList.remove('d-none');
                document.getElementById('adminLoginPrompt').classList.add('d-none');
            }
        } else {
            authUser = null;
            if (dashboardNav) dashboardNav.classList.add('d-none');
            if (adminNav) adminNav.classList.add('d-none');

            // Hide secure content
            if (document.getElementById('dashboardContent')) {
                document.getElementById('dashboardContent').classList.add('d-none');
                document.getElementById('loginPrompt').classList.remove('d-none');
            }
            
            if (document.getElementById('adminContent')) {
                document.getElementById('adminContent').classList.add('d-none');
                document.getElementById('adminLoginPrompt').classList.remove('d-none');
            }
        }
    });

    const logoutBtnDash = document.getElementById('logoutBtnDash');
    if (logoutBtnDash) {
        logoutBtnDash.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.href = 'index.html';
        });
    }

    async function loadUserBookings(user) {
        const list = document.getElementById('userBookingsList');
        if (!list) return;

        const { data, error } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('id', { ascending: false });

        if (error || !data || data.length === 0) {
            list.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No bookings found yet.</td></tr>';
            return;
        }

        list.innerHTML = '';
        data.forEach(booking => {
            list.innerHTML += `
                <tr>
                    <td class="text-white">${booking.date} <br><small class="text-muted">${booking.time}</small></td>
                    <td class="text-muted">
                        ${booking.pickup && booking.pickup.startsWith('Live GPS:') ? `<a href="${booking.pickup.replace('Live GPS:', '').trim()}" target="_blank" class="btn btn-sm btn-gold-outline py-0 px-2 mt-1"><i class="fa-solid fa-location-dot"></i> Live Location</a>` : booking.pickup} 
                        <br>➔<br> 
                        ${booking.drop && booking.drop.startsWith('Live GPS:') ? `<a href="${booking.drop.replace('Live GPS:', '').trim()}" target="_blank" class="btn btn-sm btn-gold-outline py-0 px-2 mt-1"><i class="fa-solid fa-location-dot"></i> Live Location</a>` : booking.drop}
                    </td>
                    <td class="text-white">${booking.vehicle}</td>
                    <td>
                        <span class="badge ${booking.status && booking.status.startsWith('Approved') ? 'bg-success' : (booking.status === 'Denied' ? 'bg-danger' : 'bg-warning text-dark')}">${booking.status || 'Pending'}</span>
                        ${booking.cost ? `<div class="small text-gold mt-1">₹${booking.cost}</div>` : ''}
                    </td>
                </tr>
            `;
        });
    }



    // Booking Form Submission Logic
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('bookName').value.trim();
            const phone = document.getElementById('bookPhone').value.trim();
            const pickup = document.getElementById('bookPickup').value.trim();
            const drop = document.getElementById('bookDrop').value.trim();
            const date = document.getElementById('bookDate').value;
            const time = document.getElementById('bookTime').value;
            const vehicle = document.getElementById('bookVehicle').value;

            if (!name || !phone || !pickup || !drop || !date || !time) {
                alert("Please fill all required fields.");
                return;
            }

            const newBooking = {
                user_id: authUser ? authUser.id : null,
                name,
                phone,
                pickup,
                drop,
                date,
                time,
                vehicle,
                status: 'Pending',
                cost: ''
            };

            const { data, error } = await supabaseClient.from('bookings').insert([newBooking]);

            if (error) {
                alert("Error saving booking: " + error.message);
                return;
            }

            bookingForm.style.display = 'none';
            const statusDiv = document.getElementById('bookingStatus');
            statusDiv.classList.remove('d-none');
            statusDiv.innerHTML = `<div class="alert alert-success"><i class="fa-solid fa-circle-check fa-2x mb-2"></i><br><strong>Booking Done!</strong><br>Your booking request has been sent to the admin. Waiting for admin approval.</div>`;
        });
    }

});

// --- Leaflet Map Picker Logic ---
let mapInstance = null;
let mapMarker = null;
let currentMapInputId = null;
let currentSelectedAddress = "";

window.openMapPicker = function(inputId) {
    currentMapInputId = inputId;
    const modalEl = document.getElementById('mapPickerModal');
    if (!modalEl) return;
    
    const mapModal = new bootstrap.Modal(modalEl);
    document.getElementById('mapAddressPreview').innerText = "Click on the map to drop a pin.";
    document.getElementById('confirmMapLocationBtn').disabled = true;
    currentSelectedAddress = "";
    
    mapModal.show();

    // Initialize map after modal transition is done so Leaflet calculates size correctly
    modalEl.addEventListener('shown.bs.modal', function onModalShown() {
        modalEl.removeEventListener('shown.bs.modal', onModalShown); // Run once

        if (!mapInstance) {
            // Default center to Mumbai
            mapInstance = L.map('mapContainer').setView([19.0760, 72.8777], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance);

            mapInstance.on('click', async function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                if (mapMarker) {
                    mapMarker.setLatLng(e.latlng);
                } else {
                    mapMarker = L.marker(e.latlng).addTo(mapInstance);
                }

                document.getElementById('mapAddressPreview').innerText = "Fetching address...";
                document.getElementById('confirmMapLocationBtn').disabled = true;

                try {
                    // Reverse Geocoding with Nominatim API
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                    const data = await response.json();
                    
                    if (data && data.display_name) {
                        // Create a shorter address (e.g., Neighborhood, City)
                        let shortAddress = [];
                        if (data.address.suburb || data.address.neighbourhood) shortAddress.push(data.address.suburb || data.address.neighbourhood);
                        if (data.address.city || data.address.town || data.address.county) shortAddress.push(data.address.city || data.address.town || data.address.county);
                        
                        currentSelectedAddress = shortAddress.length > 0 ? shortAddress.join(", ") : data.display_name.split(",").slice(0, 3).join(", ");
                        
                        document.getElementById('mapAddressPreview').innerText = currentSelectedAddress;
                        document.getElementById('confirmMapLocationBtn').disabled = false;
                    } else {
                        document.getElementById('mapAddressPreview').innerText = "Could not detect address here. Try another spot.";
                    }
                } catch (err) {
                    console.error(err);
                    document.getElementById('mapAddressPreview').innerText = "Error fetching address. Please try again.";
                }
            });
        }
        // Force Leaflet to recalculate size inside the new modal display
        mapInstance.invalidateSize();
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirmMapLocationBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (currentMapInputId && currentSelectedAddress) {
                document.getElementById(currentMapInputId).value = currentSelectedAddress;
                bootstrap.Modal.getInstance(document.getElementById('mapPickerModal')).hide();
            }
        });
    }
});
