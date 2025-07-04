import express from 'express'
import cors from 'cors'
import { configDotenv } from 'dotenv'

configDotenv()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: "Namaste, User"})
})

const PORT = process.env.PORT || 5000

app.listen(process.env.PORT, () => {
    console.log(`The server is currently running at PORT ${process.env.PORT}`)
})