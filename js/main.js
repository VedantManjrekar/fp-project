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

    async function handleAuth() {
        console.log("Auth button clicked!");
        if (currentUser) {
            await supabase.auth.signOut();
        } else {
            const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) {
                alert("Login Error: " + error.message);
                console.error("Supabase Auth Error:", error);
            }
        }
    }

    if (authBtn) {
        authBtn.addEventListener('click', handleAuth);
    }

    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUser = session.user;
            if (authBtnText) authBtnText.textContent = 'Logout';
            
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
            if (authBtnText) authBtnText.textContent = 'Login';
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
            image: "assets/images/crysta.png",
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
            image: "assets/images/hycross.png",
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
            image: "assets/images/urbania.png",
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
