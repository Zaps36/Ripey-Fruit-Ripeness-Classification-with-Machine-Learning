# Ripey 🍎🍌🍇

**Ripey** is an advanced fruit ripeness classification application powered by Machine Learning. It allows users to scan fruits using a camera or uploaded image to instantly determine their ripeness level (Unripe, Ripe, or Rotten) and species.

## 🚀 Features

- **Multi-Fruit Support**: Accurately classifies Apples, Bananas, Grapes, Guavas, Oranges, Pomegranates, and Strawberries.
- **Machine Learning Accuracy**: Uses a robust Traditional ML backend (XGBoost/RandomForest) with advanced feature extraction (LBP, GLCM, Color Histogram).
- **Scan History**: Save your scan results to track fruit quality over time (requires account).
- **User Accounts**: Secure signup and login to persist your data across devices.
- **Modern UI**: A sleek, responsive interface built with Next.js 15 and Tailwind CSS.
- **Dark Mode**: Fully supported dark/light themes.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)

### Backend
- **Server**: [Flask](https://flask.palletsprojects.com/) (Python)
- **ML Framework**: [Scikit-Learn](https://scikit-learn.org/) & [XGBoost](https://xgboost.readthedocs.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** database service

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ripey.git
cd ripey
```

### 2. Backend Setup
The backend handles the ML inference and database operations.

1.  Navigate to the root directory (where `app.py` and `requirements.txt` are located).
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    - Create a `.env` file in the root directory.
    - Copy the contents from `.env.example` and update the database credentials:
    ```env
    JWT_SECRET_KEY=your_secure_random_key_here
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=fruit_app
    DB_USER=postgres
    DB_PASSWORD=your_db_password
    ```
5.  Ensure your PostgreSQL server is running and the database (e.g., `fruit_app`) exists.
6.  Start the Flask server:
    ```bash
    python app.py
    ```
    The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
The frontend is a Next.js application that interacts with the user and the backend API.

1.  Open a new terminal window.
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

1.  **Sign Up**: Create an account to access history features.
2.  **Scan**: Go to the Scanner page, take a photo or upload an image of a fruit.
3.  **View Results**: The app will display the detected fruit and its ripeness state (e.g., "Ripe Apple").
4.  **History**: Check your past scans in the History tab.

## 📂 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable React UI components.
- `/lib`: Helper functions and API clients.
- `app.py`: Main Flask application entry point.
- `/best_model_traditionalML`: Directory containing the ML model logic and artifacts.

## 📄 License

[MIT](LICENSE)
