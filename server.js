  
let express = require('express')
let app = express()
let morgan = require('morgan')
app.use(morgan('combined'))
let cors = require('cors')
app.use(cors())
let bodyParser = require('body-parser')
app.use(bodyParser.raw({ type: "*/*" }))

let passwords = new Map()
let tokens = new Map()
let rooms = new Map()
let currentToken = 0
let chatMessages = []


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

app.post("/login", (req, res) => {
    let parsed = JSON.parse(req.body)
    let username = parsed.username
    let password = parsed.password
    let token = parsed.token
    let actualPassword = parsed.password
    let expectedPassword = passwords.get(username)
    let expectedToken = tokens.get(username)
   
    if (username === undefined) {
        res.send(JSON.stringify({ success: false, reason: "username field missing" }))
        return
    }
    
    if (expectedPassword === undefined) {
        res.send(JSON.stringify({ success: false, reason: "User does not exist" }))
        return
    }
    if (password === undefined) {
        res.send(JSON.stringify({ success: false, reason: "password field missing" }))
        return
    }
  
  
    if (expectedPassword !== actualPassword) {
        res.send(JSON.stringify({ success: false, reason: "Invalid password" }))
        return
    }
    // console.log("LOGIN pw, user, token", expectedPassword, username, expectedToken)
    currentToken = expectedToken
    console.log("CURRENT TOKEN", currentToken) 
    res.send(JSON.stringify({ success: true, token: "expectedToken"}))
})

app.get("/sourcecode", (req, res) => {
res.send(require('fs').readFileSync(__filename).toString())
})

app.post("/signup", (req, res) => {
    let parsed = JSON.parse(req.body)
    let username = parsed.username
    let password = parsed.password
    let token = 0
    
    if (passwords.has(username)) {
        res.send(JSON.stringify({ success: false, reason: "Username exists" }))
        return
    }
   if (password === undefined) {
        res.send(JSON.stringify({ success: false, reason: "password field missing" }))
        return
    }
    if (username === undefined) {
        res.send(JSON.stringify({ success: false, reason: "username field missing" }))
        return
    }
    token = Date.now() 
    console.log("SIGNUP pw, user, token", password, username, token)
    
    passwords.set(username, password)
    tokens.set(username, token)
    console.log(passwords)
    console.log(tokens)
    res.send(JSON.stringify({ success: true }))

})

app.post("/create-channel", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channel = parsed.channel
  let token = parsed.token
  let username = parsed.username
  let expectedToken = tokens.get(username)
  console.log("created channel:", channel )
    
   if (expectedToken !== currentToken) {
    console.log("TOKEN VERIFY", expectedToken, currentToken)
    res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
  }
  
  if (expectedToken === undefined) {
    console.log("TOKEN UNDEFINED", expectedToken, token)
    res.send(JSON.stringify({ success: false, reason: "token field missing"}))
    return
  }
  
 
  
 
  
  rooms.set(channel, expectedToken)
  console.log("CREATE CHANNEL token", expectedToken)
  res.send(JSON.stringify({ success: true }))
  
})


app.post("/add-message", (req, res) => {
    let msg = JSON.parse(req.body)
    chatMessages.push(msg)
    res.send("done")
})

app.get("/msgs", (req, res) => {
    res.send(JSON.stringify(chatMessages))
    let parsed = JSON.parse(req.body)
    let roomName = parsed.room
    if (!rooms.has(roomName)) {
        rooms.set(roomName, [])
    }

    rooms.get(roomName).push(parsed.msg)

})


app.listen(4000, () => {
    console.log("server started")
})