const express = require('express')
const db = require('./db')
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express()
const port = 3001
const https = require('https');
const fs = require('fs');

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

//Use the code in the next block if you need to restrict the cors to certain origin only.
app.use(cors());

/*
//Consider this if you are going to use cors to restrict where your API is being accessed from
//Comment out the code block above and uncomment this section and just modify the allowedOrigins
//to your requirements.
const allowedOrigins = ['http://localhost:3001',
                      'http://qlik/'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
*/


//All the routing is taken care here. Change them if you need to
app.get('/allchat', db.getAllChatMessages)
app.get('/allchat/total', db.getAllChatMessagesTotal)
app.get('/sheetchat/:appid/:sheetid', db.getSheetMessage)
app.get('/sheetchat/:appid/:sheetid/total', db.getSheetMessageTotal)
app.post('/chat', db.postChatMessage)

//Root
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

//Comment out this block if you are using http only.
https.createServer({
  key: fs.readFileSync('./server_key.pem'),
  cert: fs.readFileSync('./server.pem'),
  passphrase: ''
}, app).listen(port, () => {
  console.log(`App running on port ${port}.`)
});

/*
//use this if you need to use it on http only, good for development and testing
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})*/