# Exercise Tracker

A simple Exercise Tracker microservice that can create new users, add logs of their exercises, and get all exercise logs belonging to a specific user. 

## Features

- POST request that creates a new user, using a given username. 
- POST request to add a new exercise. Data includes date, description, duration and id. 
- Date method used to create current date if none given and toDateString method used to convert yyyy-mm-dd format. 
- GET method to get user's exercise log: includes optional query strings to search for logs between specific dates and to limit logs returned from request. 

## Example Output

GET api/users/:id/logs returns:
```
{"_id":"673b6c574ae08555f6235a96","username":"etho","count":3,"log":[{"description":"scdcsd","duration":5,"date":"Fri Nov 23 2012"},{"description":"scdcsdt","duration":5,"date":"Sat Nov 24 2012"},{"description":"scdcsdte","duration":5,"date":"Sun Nov 25 2012"}]}
```