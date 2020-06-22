const express = require('express')
const cors = require('cors')
const uuid = require('uuid')
const stripe = require('stripe')('sk_test_51Gwk1PKCnTxaTuB3HjAVJchyuifPWVBeO4gXXcHGZwV2XmA5pEH0XUnYZQwFKZZdcF1pL81WZIbq6MKYqXjmjwBZ00tFQOZUxr')

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello Stripe!')
})

app.post('/payment', (req, res) => {
    const { product, token } = req.body
    const idempotencyKey = uuid.v4()

    console.log('PRODUCT', product)
    console.log('PRICE', product.price)
    
    return stripe.customers.create({
        email: token.email,
        source: token.id
    })
    .then((customer) => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `purchase of ${product.name}`,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country
                }
            }
        }, { idempotencyKey })
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err))

})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`[server.js]: running on PORT ${PORT}`))