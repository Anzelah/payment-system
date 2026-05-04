
# 💳 Payment Processing System (Stripe + M-Pesa)

A backend-focused payment processing system that integrates Stripe and M-Pesa, handling asynchronous payment confirmations via webhooks, background processing, and full/partial refunds.

This project demonstrates how real-world payment systems are built — beyond simple API calls — including idempotency, retries, transaction state management, and user-facing notifications.


---

## 🚀 Features

### 💰 Payments
✅ Stripe payments using Payment Intents
✅ M-Pesa STK Push integration
✅ Idempotent payment requests (prevents duplicate charges)

### 🔄 Transaction Processing
✅ Webhook handling for async payment confirmation
✅ Background workers for post-payment processing
✅ Robust transaction state management (PENDING, SUCCESS, FAILED, REFUNDED)

### 💸 Refunds
✅ Full refunds
✅ Partial refunds
✅ Validation (prevents over-refunding or invalid states)
✅ Refund logging for auditability 

### 🔔 Notifications
✅ User-friendly transaction status messages
✅ Endpoint to fetch transaction status
✅ Clear messaging for:
    - Payment success
    - Payment failure
    - Pending payments
    - Refund outcomes

### 🛡️ Reliability
✅ Retry mechanism for database queries (handles Neon cold starts)
✅ Graceful error handling
✅ Async-safe architecture

### 🖥️ Demo
✅ Lightweight frontend UI (HTML + JS) for testing flows
✅ End-to-end payment simulation


---

## 🧠 Architecture
Client (UI / API Consumer)
        ↓
     Backend API
        ↓
 Payment Provider (Stripe / M-Pesa)
        ↓
      Webhook
        ↓
 Background Worker
        ↓
     Database

## Why This Architecture?
- **Webhooks**: Payment providers confirm transactions asynchronously 
- **Workers**: Offload heavy or delayed processing from the main request
- **Database State**: Tracks the lifecycle of every transaction  


---

## ⚙️ Tech Stack

- Node.js (Backend runtime)
- Express.js (API framework)
- Prisma ORM
- PostgreSQL (Neon)
- Stripe API
- M-Pesa API
- Redis (for background jobs / queues) 


---

## 🎥 Demo Flow
1. Enter amount
2. Select provider (Stripe / M-Pesa)
3. Click Pay 
    A transaction reference is generated and stored
4. (Optional) Check transaction status
    View current payment state
5. Wait for processing / webhook updates
6. Check updated status (optional)
7. Initiate refund
 If Stripe:
    - Enter refund amount
    - Supports full or partial refunds
 If M-Pesa:
    - User is informed that refunds are handled manually (reversals)
    - No automatic refund is performed


---

## 🔌 API
Initiate Payment
  POST   /payments 

Get Transaction Status
  GET    /notifications/:reference
Returns: {
  "status": "SUCCESS",
  "message": "Your payment was successful."
}

Refund Payment
  POST   /refunds/:reference
Supports:
   - Full refunds
   - Partial refunds


---

## ⚠️ Real-World Considerations

🔹 Asynchronous Payments
Payments are not confirmed instantly.
Webhooks are used to update transaction status after provider confirmation.

🔹 Idempotency
Each payment request includes an idempotency key to prevent duplicate transactions.

🔹 Database Cold Starts (Neon)
Neon databases may become idle and delay the first query. Therefore we implemented:
   - Retry mechanism for critical queries which prevents user-facing failures

🔹 M-Pesa Reversals
Due to the nature of Safaricom:
- Reversals are manual
- Users must:
   - Initiate reversal via M-Pesa message
   - Safaricom contacts the merchant
   - Merchant approves/denies the reversal

👉 This cannot be automated via API and is documented accordingly.


---

## 🧩 Challenges & Learnings
This project focused on real-world backend challenges:
 - Handling asynchronous workflows (webhooks + workers)
 - Ensuring data consistency across systems
 - Implementing idempotency to prevent duplicate payments
 - Managing transaction lifecycle states
 - Handling external API uncertainty (Stripe + M-Pesa)
 - Dealing with infrastructure issues (database cold starts)

---

## 📸 Demo UI

A lightweight UI was built to simulate:
 - Payment initiation
 - Status checking
 - Refund processing
This keeps the focus on backend logic while allowing easy testing.


---

## 🎯 Project Goal
The goal for building this project was to:
 - Understand how real-world payment systems work
 - Go beyond basic CRUD APIs
 - Learn how to integrate and manage external financial systems
 - Practice production-level backend design patterns


---

## 📌 Notes
Authentication was intentionally excluded to keep focus on payment systems
This will be implemented in a separate project
The goal was depth over breadth in payment architecture


---

## 🏁 Conclusion

This project demonstrates the ability to:
 - Build real-world backend systems
 - Integrate multiple payment providers
 - Handle asynchronous, failure-prone workflows
 - Design for reliability and clarity

---