
 # Club POS

A modern Point of Sale (POS) system built to help clubs, and bars, inventory, customers, and staff efficiently.

## Features

- User authentication (Login)
- Sales and billing
- Product management
- Inventory tracking
- Customer management
- Staff management
- Order processing
- Dashboard with business insights
- Receipt generation
- Secure backend API

## Tech Stack

### Frontend
- React
- TypeScript
- HTML5
- CSS3

### Backend
- Python
- Flask
- Flask-CORS

### Database
- SQLite (Development)
- Easily configurable for PostgreSQL or MySQL

## Project Structure

```
Club-POS/
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── models/
│   ├── database/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

## Installation

### Clone the repository

```bash
git clone https://github.com/Terry84/Club-POS.git
cd Club-POS
```

### Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run the Flask server

```bash
python app.py
```

The backend will run on:

```
http://127.0.0.1:5000
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend will run on:

```
http://localhost:5173
```

## API

Example Login Endpoint

```
POST /api/login
```

Request

```json
{
  "username": "admin",
  "password": "password"
}
```

## Future Improvements

- Barcode scanner support
- Mpesa payment integration
- Card payment support
- Receipt printing
- Reports and analytics
- Multi-branch management
- Employee roles and permissions
- Cloud deployment
- Mobile application

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

## License

This project is licensed under the MIT License.

## Author

**Terry Muthoni Kibugi**

GitHub: https://github.com/Terry84   
