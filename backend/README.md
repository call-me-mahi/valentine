# Payment Backend - Razorpay Integration

Backend API for Valentine project payment flow using Razorpay.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your Razorpay test credentials:
```bash
cp .env.example .env
```

Edit `.env` with your Razorpay test keys from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys):
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
PORT=5000
```

### 3. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── razorpay.js          # Razorpay client instance
│   ├── controllers/
│   │   └── paymentController.js  # Payment business logic
│   ├── routes/
│   │   └── paymentRoutes.js      # API route definitions
│   ├── utils/
│   │   └── errorHandler.js       # Error handling middleware
│   └── server.js                 # Express app entry point
├── .env.example                  # Environment template
├── .gitignore
└── package.json
```

## 🔌 API Endpoints

### Create Order
**POST** `/api/payment/create-order`

Creates a new Razorpay order.

**Request Body:**
```json
{
  "amount": 50000,
  "currency": "INR"
}
```
*Note: Amount is in smallest currency unit (50000 paise = ₹500)*

**Response (200 OK):**
```json
{
  "success": true,
  "orderId": "order_NXvZ...",
  "amount": 50000,
  "currency": "INR"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Valid amount is required"
}
```

### Health Check
**GET** `/health`

Check server status.

## 🧪 Testing

### Using curl
```bash
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 50000, \"currency\": \"INR\"}"
```

### Using Postman
1. Create a POST request to `http://localhost:5000/api/payment/create-order`
2. Set header: `Content-Type: application/json`
3. Body (raw JSON):
   ```json
   {
     "amount": 50000,
     "currency": "INR"
   }
   ```

## 📦 Dependencies

- **express**: Web framework
- **razorpay**: Official Razorpay SDK
- **dotenv**: Environment configuration
- **cors**: CORS middleware
- **nodemon**: Auto-restart during development (dev only)

## 🔒 Security Notes

- Currently using Razorpay **TEST MODE** credentials
- Switch to live credentials only in production
- Never commit `.env` file to version control
- Always validate and sanitize user input

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
