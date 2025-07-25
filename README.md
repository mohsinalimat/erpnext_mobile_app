# ERPNext Mobile

A mobile application for ERPNext, built with React Native and Expo. This app provides a user-friendly interface to manage customers, sales, and tasks on the go.

## Features

- **Dashboard:** Get a quick overview of your business with key metrics like total sales, new customers, open orders, and pending tasks.
- **Customer Management:** Create, view, and manage your customers and their contacts and addresses.
- **Sales Management:** Create and manage quotations and sales orders.
- **Item Management:** View and manage your items and their prices.
- **Task Management:** Keep track of your tasks and their statuses.
- **Offline Support:** (Coming Soon) Work offline and sync your data when you're back online.

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- pnpm
- Expo Go app on your mobile device or an Android/iOS emulator.
- An ERPNext instance (v13 or newer)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sadikhossainnub/erpnext_mobile_app.git
    cd erpnext_mobile_app
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure the ERPNext connection:**
    Create a `.env` file in the root of the project and add the following:
    ```
    EXPO_PUBLIC_API_URL=https://your-erpnext-site.com
    ```

4.  **Start the development server:**
    ```bash
    pnpm start
    ```

5.  **Run the app:**
    - Scan the QR code with the Expo Go app on your device.
    - Or, run on an emulator:
      - `pnpm android` to run on an Android emulator.
      - `pnpm ios` to run on an iOS simulator.

## Available Scripts

- `pnpm start`: Starts the Expo development server.
- `pnpm dev`: Starts the Expo development server with telemetry disabled.
- `pnpm build:web`: Creates a production build for the web.
- `pnpm lint`: Lints the codebase using Expo's linting configuration.
- `pnpm android`: Runs the app on a connected Android device or emulator.
- `pnpm ios`: Runs the app on an iOS simulator.
- `pnpm build:android:local`: Creates a local release build for Android.

## Technologies Used

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation, Expo Router
- **State Management:** Zustand
- **UI:** React Native Paper, Lucide Icons
- **API Client:** Axios
- **Linting:** Expo Lint

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.
