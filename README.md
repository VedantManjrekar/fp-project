# 🚘 Ashwamedh Travel Services - Single-Page Web Application

A modern, responsive, high-converting single-page website built for **Ashwamedh Travel Services** (Mumbai-based car rental and airport transfer service). Featuring a luxury dark royal navy and metallic gold design system, interactive quick fare estimator, official tariff matrices, secure payments via QR code, and direct WhatsApp booking integration.

## 🌐 Live Demo & Tech Stack
- **Live Demo**: [https://projecticon123.vercel.app/](https://projecticon123.vercel.app/)
- **Frontend**: **HTML5**, **CSS3**, **JavaScript (Vanilla)**
- **UI Framework**: **Bootstrap 5** for responsive layout and pre-built components.
- **Hosting**: Deployed and hosted on **Vercel** for fast, reliable delivery.
- **Authentication**: **Supabase** is integrated for secure user authentication and session management.

---

## 📋 Prerequisites & Downloads

### What needs to be installed?
**Nothing!** No heavy frameworks, build tools, or package installations (`npm install`, `composer`, etc.) are required. 
All external libraries (Bootstrap 5, FontAwesome Icons, Google Fonts, Supabase JS) are loaded directly via CDN links embedded in the HTML.

### Requirements:
- Any modern web browser (**Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Safari**).
- (Optional) **VS Code** with the *Live Server* extension, or **Node.js** if you want to run a local development web server.

---

## 🚀 How to Run the Website

You can run and test this website using any of the following 3 easy methods:

### Method 1: Double-Click (Easiest & Instant)
1. Clone or download this project folder to your local computer.
2. Open the project folder in File Explorer.
3. Double-click **`index.html`** (or right-click `index.html` → **Open with** → **Google Chrome** / **Microsoft Edge**).

---

### Method 2: Using VS Code "Live Server" (Recommended for Teammates)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Extensions tab (`Ctrl+Shift+X`).
3. Right-click **`index.html`** in the Explorer sidebar and click **Open with Live Server**.
4. The site will automatically open at `http://127.0.0.1:5500`.

---

### Method 3: Using Command Line Server (Node.js)
```bash
# Open terminal in the project folder and run:
npx serve .
```
Then open `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```text
fp-project/
├── index.html          # Main HTML structure (Hero, Fleet Cards, Tariff Matrix, Contact, Payment, Modals)
├── css/
│   └── style.css       # Custom Glassmorphic Dark Navy & Metallic Gold design system
├── js/
│   └── main.js         # Interactive Fare Estimator, WhatsApp Message Generator, Supabase Auth & Modal Logic
├── assets/
│   └── images/         # High-resolution vehicle photography, brand logos & payment QR
│       ├── carens.png
│       ├── crysta.png
│       ├── dzire.png
│       ├── fpprojectqr.jpeg
│       ├── hero-bg.png
│       ├── hycross.png
│       ├── logo.jpg
│       ├── logo.png
│       └── urbania.png
├── auralis-neural-audio-engine-DESIGN.md
└── README.md           # Documentation & instructions
```

---

## ✨ Key Features & Functionality

- **Interactive Quick Fare Estimator**: Calculates estimated base rates live for Dzire, Kia Carens, Innova Crysta, Innova Hycross, and Force Urbania based on trip selection (Airport transfers, Local 8h/80k, Local 10h/100k, Outstation, Mumbai-Pune one-way).
- **Instant WhatsApp Booking Dispatch**: Pre-fills passenger details, travel date, pickup location, vehicle model, and estimated rates directly into WhatsApp messages.
- **Complete Tariff Matrix**: Full rate grid side-by-side comparison table including extra hour/km charges, driver allowances, and permits.
- **Vehicle Specification Modals**: Click "Tariff & Specs" on any fleet card to view seating capacity, luggage limits, and detailed package rates.
- **Secure QR Payments**: Integrated UPI/PhonePe QR code section for seamless payments.
- **Supabase Authentication**: Integrated user login/authentication flows.
- **Mobile Floating Action Bar**: Sticky `Call Now` and `WhatsApp` quick action buttons on mobile screens (< 768px).

---

## 🛠️ Customization & Testing Notes

- **Contact Phone Numbers**: Make sure to update the WhatsApp numbers and email addresses in `index.html` and `js/main.js` to match your actual business details.
- **Tariff Data**: Rates can be edited inside the `TARIFF_DATA` object at the top of `js/main.js` and inside the HTML table in `index.html`.
- **Payment Details**: The payment QR code points to `assets/images/fpprojectqr.jpeg`. Replace this image to update the recipient.
