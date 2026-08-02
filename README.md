# Mission Command Hub

Design a premium Ground Control Station (GCS) web application for Team Bhoonidi, representing India in the Malaysian Rocket Competition (MRCC).

This application is used by the ground team to monitor a CanSat during flight. The interface should feel like professional aerospace mission control software, not a business analytics dashboard.

Overall Design

Create a modern, premium interface inspired by:
- NASA Mission Control
- SpaceX mission software
- Modern aircraft cockpit displays
- Apple-level polish
- Linear.app quality
- Vercel aesthetics

Use:
- Dark theme
- Deep navy and charcoal backgrounds
- Cyan, electric blue and subtle teal highlights
- Frosted glass (glassmorphism)
- Soft glowing accents
- Rounded cards
- Premium typography
- Clean spacing
- Smooth micro-animations
- Minimalistic design
- Highly readable UI

Avoid:
- Bright rainbow colours
- Corporate business dashboards
- Purple gradients
- Cryptocurrency styles
- Gaming aesthetics
- Excessive animations

The dashboard should feel serious, technical, futuristic, and trustworthy.

Navigation

Use a persistent horizontal top navigation bar.

Navigation Tabs:
- 🛰 Connection
- 🚀 Mission Control
- 📊 Post-Mission Analysis
- 📤 Export

The active tab should be clearly highlighted.

Page 1 — Connection

Create a clean, professional connection screen.

Include:
- Team Bhoonidi logo placeholder
- Malaysian Rocket Competition title
- Ground Station connection card
- Serial Port selection dropdown
- Connect button
- Connection status indicator
- "Waiting for Telemetry..." indicator
- Start Mission button (disabled until connection is established)

The layout should be clean, centered, and modern.

Page 2 — Mission Control

This should be the primary page and the visual centerpiece of the application.

Include large telemetry cards displaying:
- Altitude
- Pressure
- Temperature
- Tilt

Mission Information:
- Mission Timer
- Packet Counter
- Last Packet Received Timestamp
- Ground Station Connection Status

Live Charts:
- Altitude vs Time
- Pressure vs Time
- Temperature vs Time
- Tilt vs Time

Telemetry Log:
- Live telemetry table underneath the charts

Alerts Section:
- Telemetry Lost
- Weak Signal
- Connection Restored

The page should resemble a real aerospace Ground Control Station with excellent hierarchy and readability.

Page 3 — Post-Mission Analysis

Purpose:
Review and analyse completed mission data.

Include:
- Flight Summary
- Maximum Altitude
- Average Temperature
- Average Pressure
- Maximum Tilt
- Packet Statistics
- Pressure Trend Analysis
- Interactive charts
- Searchable telemetry table
- Mission statistics cards

Use a clean analytical layout designed for engineers reviewing mission performance.

Page 4 — Export

Include:
- Mission Summary Card

Export options:
- Export CSV
- Export JSON (future placeholder)
- Export PDF Report (future placeholder)

The page should be simple, elegant, and professional.

Reusable Components

Create premium reusable UI components including:
- Navigation Bar
- Telemetry Cards
- Status Chips
- Buttons
- Tables
- Charts
- Warning Banner
- Mission Summary Cards

User Experience

The application should feel smooth and polished.

Use:
- Subtle hover animations
- Soft card elevation
- Smooth transitions
- Gentle glowing active elements
- Responsive layout for desktop and laptop screens

Avoid flashy or distracting animations.

IMPORTANT

This project already has all functionality implemented in React + TypeScript.

Do NOT redesign the application architecture.

Do NOT generate authentication, backend services, APIs, databases, or telemetry logic.

Focus entirely on producing an exceptional UI/UX design that can be applied to an existing React + TypeScript Ground Control Station.

The final result should look like software used by aerospace engineers during a real CanSat mission rather than a generic web dashboard.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8133aea-fc73-411a-ac85-5d4f69ca6d50).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
