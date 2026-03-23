# Parking Rate Calculator

A responsive React application that calculates parking fees based on entry/exit times, vehicle type, and day of the week. The app supports different multipliers for cars, motorcycles, and trucks, includes a weekend surcharge, and keeps a history of recent calculations in local storage.

---

## Features

- Calculate parking fees with:
    - **Free first 30 minutes**
    - **$2 per 30-minute block after free period**
    - **Daily maximum fee of $25**
    - **Weekend surcharge of 20%**
    - **Vehicle type multipliers**:
        - Car: 1.0
        - Motorcycle: 0.6
        - Truck/Van: 1.8
- Validation for:
    - Missing or invalid entry/exit times
    - Exit time earlier than entry
    - Maximum parking duration of 72 hours
- Stores last 10 calculations in **localStorage**
- Responsive and user-friendly UI

---

## 🖼️ Screenshots

Calculation:

![Calculation](assets/screenshots/calculation.png)

Error:

![Error](assets/screenshots/error.png)

History:

![History](assets/screenshots/history.png)

Weekend:

![Weekend](assets/screenshots/Weekend.png)

---

## Technologies Used

- **React** (with hooks: `useState` & `useEffect`)
- **Vitest** + **React Testing Library** for unit and integration tests
- **CSS** for styling
- **LocalStorage** for storing recent calculations

---

## Installation

1. Clone the repository:

```bash

git clone https://github.com/yourusername/parking-rate-calculator.git
cd parking-rate-calculator

```

# Install dependencies:
```

npm install
Start the development server:
npm start
```
---

The app should be available at http://localhost:3000.

# Running Tests
This project uses Vitest and React Testing Library for testing.
```aiexclude
npm test
```
--- 
All core functionality is covered, including:
- Fee calculation accuracy 
- Validation for incorrect inputs 
- Weekend surcharge and vehicle multipliers 
- Local storage history updates 
- Usage / Running Process 
- Follow these steps to calculate parking fees:
- Open the App 
- Launch the app in your browser (localhost during development or deployed URL). 
- Enter Entry Date & Time 
- Select the date and time when the vehicle entered the parking. 
- Enter Exit Date & Time 
- Select the date and time when the vehicle exited. 
- Select Vehicle Type. 
- Choose one of the options: Car, Motorcycle, Truck/Van. 
- Click "Calculate Fee"

The app calculates the parking fee and displays:
- Duration of stay 
- Fee amount 
- Weekend surcharge if applicable

View Calculation Result
- Result is displayed in the Result card. 
- If there are any errors (e.g., invalid time, exit before entry), a message will appear.

Check History
- The last 10 calculations are saved in the Recent Calculations section. 
- All data persists using localStorage.

How Fees Are Calculated
- Duration:	Fee Calculation
First 30 minutes: Free ($0)
Each additional 30 min block: $2 per block
Maximum per day: $25 before vehicle multiplier
Weekend surcharge: +20% if entry date is Saturday/Sunday
Vehicle multipliers	Car: 1.0, Motorcycle: 0.6, Truck: 1.8
Example:
45 minutes parking for a car on a weekday → $2.00
90 minutes parking for a motorcycle on Saturday → $4.80 × 0.6 = $2.88

# File Structure
parking-rate-calculator/
│
├─ src/
│ ├─ App.jsx # Main React component
│ ├─ App.css # Styles for App.jsx
│ └─ App.test.jsx # Unit tests for App.jsx
│
├─ package.json # Project dependencies and scripts
└─ README.md # Project documentation

Author
dipti.roka.dev@gmail.com