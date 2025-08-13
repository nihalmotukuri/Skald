import app from "./app.js"
import dbConnection from "./config/db.js"
import tasksRoutes from './routes/tasks.route.js'
import notesRoute from './routes/notes.route.js'
import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'

app.get('/', (req, res) => {
    res.json({message: "Namaste, User"})
})

app.use('/api/tasks', tasksRoutes)
app.use('/api/notes', notesRoute)
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)

dbConnection()