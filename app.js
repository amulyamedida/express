const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDBAAndServer()
const convertDBObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
app.get('/players/', async (request, response) => {
  const getcricketquery = `select * from cricket_team;`
  const cricketarray = await db.all(getcricketquery)
  response.send(
    cricketarray.map(eachplayer => convertDBObjectToResponseObject(eachplayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerdetails = request.body
  const {playerName, jerseyNumber, role} = playerdetails
  const addplayerquery = `
    insert into cricket_team(player_name,jersey_number,role) 
    values(
        '${playerName}',
        ${jerseyNumber},
        '${role}');`

  const dbResponse = await db.run(addplayerquery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerquery = `
    select * from cricket_team where 
    player_id=${playerId};`
  const player = await db.get(getplayerquery)
  response.send(convertDBObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updateplayerquery = `
    update 
    cricket_team set 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}' where 
    player_id=${playerId};`
  await db.run(updateplayerquery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletequery = `
    delete from cricket_team where 
    player_id=${playerId};`
  await db.run(deletequery)
  response.send('Player Removed')
})

module.exports = app
