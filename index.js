const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

app.use(express.urlencoded({ extended: true })); //allows us to access req.body in requests
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)

//Check connection
mongoose.connection.on('connected', () => {
  console.log('connected')
})

//Create Schemas

///User:
const user = new mongoose.Schema({
  username: String
})

const newUser = mongoose.model('users', user) //see 'users' in MongoDB

app.post('/api/users', async (req, res) => {

  try {
    let newUsername = req.body.username
    let createNewUser = new newUser({username: newUsername})
    const result = await createNewUser.save()
    return res.json(result)
  } catch(e) {
    return res.json({error: 'could not create new user'})
  }
})

//Exercise:
const exercise = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
})

const newExercise = mongoose.model('exercises', exercise)

app.post('/api/users/:_id/exercises', async (req, res) => { //:_id refers to user id

  let exDescription = req.body.description;
  let exDuration = req.body.duration;
  let exDate = new Date(req.body.date).toDateString(); //format yyyy-mm-dd with toDateString()
  let id = req.body[':_id']
  let findUser = await newUser.findById(id).exec()

  try {
    if (!req.body.date) {
      let currentDate = new Date().toDateString(); //today's date in format: Mon Jan 01 1990
      let exercise = new newExercise({username: findUser.username, description: exDescription, duration: exDuration, date: currentDate})
      const result = await exercise.save() 
      return res.json(result)
    } 
    else {
      let exercise = new newExercise({username: findUser.username, description: exDescription, duration: exDuration, date: exDate})
      const result = await exercise.save()
      return res.json(result)
    }
  } catch (e) {
    return res.json({error: 'Could not add new exercise'})
  }

})

///Log:
// {
//   username: "fcc_test",
//   count: 1,
//   _id: "5fb5853f734231456ccb3b05",
//   log: [{
//     description: "test",
//     duration: 60,
//     date: "Mon Jan 01 1990",
//   }]
// }

//find exercise logs with username/id and add them individually as objects to log.log
//count how many exercise logs belonging to user there are


app.get('/api/users', async (req, res) => {
  try {
    let findAllUsers = await newUser.find({})
    .then((result) => {
    return res.json(result)
  })
  } catch(e) {
    return res.json({error: 'Error returning all users'})
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
