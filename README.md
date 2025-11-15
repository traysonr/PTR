# PTR - Physical Therapy Reminder

A mobile app to help users stick to their physical therapy routines. Built with React Native, Expo, and TypeScript.

## Features

### ✅ Core Features

- **Onboarding & Profile Creation**: Create a personalized profile with pain areas, goals, and preferred intensity
- **Home Dashboard**: View today's planned exercises and weekly overview
- **Exercise Catalog**: Browse exercises with filtering by body part, goal, and search functionality
- **Calendar/Planning**: Schedule exercises up to 3 weeks ahead
- **Notifications**: Automatic reminders the day before (7pm) and day of (9am) scheduled sessions
- **Profile Editing**: Update your profile at any time
- **Settings**: Manage notifications and clear scheduled plans

### 🏗️ Architecture

```
PTR/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home dashboard
│   │   ├── catalog.tsx    # Exercise catalog
│   │   ├── calendar.tsx   # Calendar/planning
│   │   ├── profile.tsx    # Profile editing
│   │   └── settings.tsx   # Settings
│   ├── onboarding/        # Onboarding flow
│   └── _layout.tsx        # Root navigation
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── ExerciseCard.tsx
│   ├── Checkbox.tsx
│   ├── TextInput.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useProfile.ts
│   ├── useScheduledExercises.ts
│   ├── useNotifications.ts
│   └── useExercises.ts
├── services/              # Business logic services
│   ├── storage.ts         # Local storage abstraction
│   └── notifications.ts   # Notification scheduling
├── types/                 # TypeScript type definitions
│   └── index.ts
└── data/                  # Seed data
    └── exercises.json     # Exercise catalog data
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your iOS/Android device (for testing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Scan the QR code with Expo Go (iOS) or the Expo app (Android)

## Project Structure

### Key Files

- **`types/index.ts`**: All TypeScript type definitions
- **`data/exercises.json`**: Seed data for exercises (18 exercises across 6 body parts)
- **`services/storage.ts`**: Abstraction layer for AsyncStorage (easily replaceable with backend)
- **`services/notifications.ts`**: Handles scheduling/canceling local notifications
- **`hooks/useScheduledExercises.ts`**: Main hook for managing scheduled exercises
- **`app/(tabs)/calendar.tsx`**: Calendar screen with 3-week planning window

### Data Storage

All data is stored locally using AsyncStorage:
- User profile
- Scheduled exercise sessions
- Onboarding status
- Notification preferences

The storage service is abstracted, making it easy to replace with a backend API in the future.

### Notifications

The app uses `expo-notifications` to schedule:
- **Day-before reminder**: 7pm the day before a scheduled session
- **Day-of reminder**: 9am on the day of a scheduled session

Notifications are automatically rescheduled when:
- A new exercise is added to the calendar
- An exercise is removed from the calendar
- All notifications are cleared when plans are cleared

### Planning Window

Users can schedule exercises up to **3 weeks (21 days) ahead**. The calendar interface prevents scheduling outside this window.

## Development Notes

### TODO / Future Enhancements

- [ ] Add exercise details modal/screen
- [ ] Add exercise history/tracking
- [ ] Improve styling and UI polish
- [ ] Add exercise images/illustrations
- [ ] Implement proper picker components for filters
- [ ] Add dark mode support improvements
- [ ] Backend integration for cloud sync
- [ ] Add exercise completion tracking
- [ ] Add progress charts/analytics

### Known Limitations

- Exercise catalog uses static JSON data (no backend yet)
- Filter UI uses buttons instead of native pickers (can be improved)
- Some styling TODOs for visual polish
- Notification permissions must be granted manually on first use

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type safety
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence
- **expo-notifications** - Local notification scheduling

## License

This project is for demonstration/educational purposes.
