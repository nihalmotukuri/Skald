import app from "./app.js"
import dbConnection from "./config/db.js"
import tasksRoutes from './routes/tasks.route.js'
import notesRoute from './routes/notes.route.js'

app.get('/', (req, res) => {
    res.json({message: "Namaste, User"})
})

app.use('/api/tasks', tasksRoutes)
app.use('/api/notes', notesRoute)

dbConnection()