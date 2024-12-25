# Baddit Backend Application

![Node.js](https://img.shields.io/badge/Node.js-v16.x-green)
![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey)
![Redis](https://img.shields.io/badge/Redis-6.x-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellowgreen)

This repository contains the backend implementation for Baddit.life, a Reddit clone. The backend is built with Express.js and utilizes Passport.js for session authentication. Redis serves as the session store, and PostgreSQL is used for data storage.

---

## Table of Contents
1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Development](#development)
5. [Usage](#usage)
6. [Contributing](#contributing)
7. [License](#license)
8. [Contact](#contact)

---

## Features

- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **Passport.js**: Middleware for authentication in Node.js applications.
- **Redis**: In-memory data structure store, used as a session store for efficient session management.
- **PostgreSQL**: Robust, scalable, and open-source relational database system.

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

---

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/S0lux/baddit-backend-app.git
   cd baddit-backend-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configuration**:

   - Create a `.env` file in the project root directory, following the structure provided in `.env.example`.
   - Ensure PostgreSQL and Redis are running and accessible as per your `.env` configurations.

4. **Build and start the application**:

   ```bash
   npm run build
   npm run start
   ```

---

## Development

For development purposes, you can use Docker to set up the environment:

1. **Ensure Docker is installed**.

2. **Start the development environment**:

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

This command will set up the necessary services and start the application in development mode.

---

## Usage

Once the application is running, it will be accessible at `http://localhost:3000` (or the port specified in your `.env` file).

---

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any enhancements or bug fixes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For any inquiries or issues, please open an issue in this repository.
