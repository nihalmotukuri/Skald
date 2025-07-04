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

app.listen(process.env.)