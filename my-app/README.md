# Gym Buddy App

A mobile application for finding workout partners and tracking fitness activities.

## Features

- User authentication (email/password)
- Find and connect with workout partners
- Track your workouts
- View workout history
- User profiles

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for emulator) or Expo Go app (for physical device)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/TarikPerviz/GymBuddyAppIT308.git
   cd GymBuddyAppIT308/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run the app**
   - Scan the QR code with the Expo Go app (iOS) or the Camera app (Android)
   - Or press 'a' to run on Android emulator / 'i' for iOS simulator

## Project Structure

- `/src` - Source code
  - `/screens` - App screens
  - `/navigation` - Navigation setup
  - `/components` - Reusable components
  - `/context` - React context providers
  - `/hooks` - Custom React hooks
  - `/types` - TypeScript type definitions
  - `/services` - API and service integrations
  - `/assets` - Images, fonts, etc.

## Dependencies

- React Navigation
- React Native Gesture Handler
- React Native Safe Area Context
- React Native Vector Icons
- Firebase (for authentication and database)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
