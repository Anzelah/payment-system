require("dotenv").config()
const Stripe = require("stripe")

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const stripe = new Stripe(STRIPE_KEY)

module.exports = stripe