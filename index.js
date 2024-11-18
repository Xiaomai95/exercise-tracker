const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { json } = require('express/lib/response')
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

const userSchema = new mongoose.Schema({
  username: String
})

//Exercise:
const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  userId: String,
})

//Models:
const User = mongoose.model('users', userSchema) //see 'users' in MongoDB
const Exercise = mongoose.model('exercises', exerciseSchema)

app.post('/api/users', async (req, res) => {

  try {
    let newUsername = req.body.username
    let createNewUser = new User({username: newUsername})
    const result = await createNewUser.save()
    return res.json(result)
  } catch(e) {
    return res.json({error: 'could not create new user'})
  }
})




app.post('/api/users/:_id/exercises', async (req, res) => { //:_id refers to user id
  
  let exDescription = req.body.description;
  let exDuration = req.body.duration;
  let exDate = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString(); //format yyyy-mm-dd with toDateString()
  let id = req.params._id;

  let findUser = await User.findById(id); //add if statement in case user not found

  if (findUser) { //Check if User does exist
    let createExercise = new Exercise ({
      username: findUser.username, 
      description: exDescription,
       duration: exDuration,
       date: exDate,
    })
    try {
        let result = await createExercise.save() 
        return res.json({
          username: findUser.username,
          description: exDescription,
          duration: parseInt(exDuration),
          date: exDate,
          _id: findUser._id // Respond with the user's ID
        })
      
    } catch (e) {
      return res.json({error: 'Could not add new exercise'})
    }
  } else {
    res.json({error: "User not found. Try enter a different ID."})
  }
})



app.get('/api/users/:_id/logs', async (req, res) => {
  let id = req.params._id;
  let from = req.query.from ? new Date(req.query.from) : new Date(0).toISOString(); //If no 'from' given, starts from as far back as Date() can go, converts to yyyy-mm-dd format
  let to = req.query.to ? new Date(req.query.to) : new Date().toISOString(); //If no 'to' given, starts from current date, converts to yyyy-mm-dd format
  let limitQuery = req.query.limit ? Number(req.query.limit) : 0; //If no limit given, defaults to 0.

  let findUser = await User.findById(id).exec();
  console.log(to)
  
  if(findUser) {
    try {
      let id = findUser.id;
      let usernameFound = findUser.username;
      console.log("id", id)
      let exercises = await Exercise.find(
      {
        username: usernameFound,
        date: {
        $gte: from,
        $lte: to
      }
       })
       .select('description duration date')
       .limit(limitQuery)
       .exec();
       console.log("exercises", exercises)
       let parsedDatesLog = exercises.map(exercise => {
        return {
          description: exercise.description,
          duration: exercise.duration * 1,
          date: new Date(exercise.date).toDateString(),
        };
      });
    
      return res.json({
        _id: id,
        username: usernameFound,
        count: parsedDatesLog.length,
        log: parsedDatesLog,
      });
    } catch (e) {
      return res.json({error: "error"})
    }
    
  } else {
    return res.json({error: 'No user found'})
  }


})

///Log response:
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
    let findAllUsers = await User.find({})
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
