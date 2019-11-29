const Pool = require('pg').Pool
const pool = new Pool({
  user: 'chatagent',
  host: 'localhost',
  database: 'qlikchat',
  password: 'agentpass',
  port: 4432,
  //ssl: true //use this for Azure PostgreSQL db
})


//Retrieves all the messages for all objects in all apps and sheets
//example URL - http://localhost:3001/allchat/
const getAllChatMessages = (request, response) => {
  pool.query('SELECT * FROM qs_chat', (error, results) => {
    if (error) {
      throw error
    }
    console.log(`GET call on /allchat`)
    response.status(200).json(results.rows)
  })
}


//Retrieves count of all messages in all objects in all apps and sheets
//example URL - http://localhost:3001/allchat/total/
const getAllChatMessagesTotal = (request, response) => {
  pool.query('SELECT COUNT(*) AS total FROM qs_chat', (error, results) => {
    if (error) {
      throw error
    }
    console.log(`GET call on all /allchat/total/`)
    response.status(200).json(results.rows)
  })
}

//Retrieves all the messages for all objects in the specified sheet for a specified app
//App and Sheet id need to be passed on the url
//example URL - http://localhost:3001/sheetchat/{{appId}}/{{sheetId}}/
const getSheetMessage = (request, response) => {
  const appId = request.params.appid //parseInt(request.params.id)
  const sheetId = request.params.sheetid //parseInt(request.params.id)

  pool.query('SELECT * FROM qs_chat WHERE app_id = $1 AND sheet_id = $2', [appId, sheetId], (error, results) => {
    if (error) {
      throw error
    }
    console.log(`GET call on all /sheetchat for sheet - ${sheetId}.`)
    response.status(200).json(results.rows)
  })
}

//Retrieves count of all messages for all objects in the specified sheet for a specified app
//App and Sheet id need to be passed on the url
//example URL - http://localhost:3001/sheetchat/{{appId}}/{{sheetId}}/total
const getSheetMessageTotal = (request, response) => {
  const appId = request.params.appid //parseInt(request.params.id)
  const sheetId = request.params.sheetid //parseInt(request.params.id)

  pool.query('SELECT COUNT(*) AS total FROM qs_chat WHERE app_id = $1 AND sheet_id = $2', [appId, sheetId], (error, results) => {
    if (error) {
      throw error
    }
    console.log(`GET call on all /sheetChat/total`)
    response.status(200).json(results.rows)
  })
}

//Add new message to the chat board, takes 5 params.
//-user_id, -user_name, -app_id, -sheet_id, -message
const postChatMessage = (request, response) => {
  const { user_id, user_name, app_id, sheet_id, message} = request.body
  
  pool.query(`INSERT INTO qs_chat(user_id, user_name, app_id, sheet_id, message)VALUES ($1, $2, $3, $4, $5)`, [user_id, user_name, app_id, sheet_id, message], (error, result) => {
    if (error) {
      throw error
    }
    console.log(`POST call on all sheetchat for sheet - ${request.body.sheet_id} , message - ${request.body.message}.`)
    response.status(201).send(`Chat message added: ${result.rowCount}`)
  })
}

module.exports = {
  getAllChatMessages,
  getAllChatMessagesTotal,
  getSheetMessage,
  getSheetMessageTotal,
  postChatMessage,
}