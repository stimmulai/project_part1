  
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
let userInRoom = new Map()
let realUserInRoom = new Map()
let loggedInUser = new Map()
let ban = new Map()
let currentToken = 0
let realCurrentToken = 0
let chatMessages = new Map()
let chatMessages2 = new Map()
let token = 0
let joinCounter = 0
let kickCounter = 0
let banCounter = 0
let msgCounter = 0
let getMsgCounter = 0


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

    //loggedInUser.set(username, {expectedToken, undefined})   
    realCurrentToken = expectedToken
    //console.log("USERS LOGGED IN", loggedInUser) 
    res.send(JSON.stringify({ success: true, token: "expectedToken"}))
})

app.get("/sourcecode", (req, res) => {
res.send(require('fs').readFileSync(__filename).toString())
})

app.post("/signup", (req, res) => {
    let parsed = JSON.parse(req.body)
    let username = parsed.username
    let password = parsed.password
    
    
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
    // assign token
    token = token+1 
    
    passwords.set(username, password)
    tokens.set(token, username)
    res.send(JSON.stringify({ success: true }))

})

app.post("/create-channel", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channelName = parsed.channelName
  let token = req.headers.token
  let username = parsed.username
  let expectedToken = tokens.get(username)
  currentToken = "expectedToken"
    
  if (channelName === undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }
  
  if (token === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing"}))
    return
  }
  
  if (token !== currentToken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
  }
    
  if (rooms.has(channelName)) {
    res.send(JSON.stringify({ success: false, reason: "Channel already exists"}))
    return
    }

  rooms.set(channelName, currentToken)
  res.send(JSON.stringify({ success: true }))
   
})

app.post("/delete", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channelName = parsed.channelName
  let token = req.headers.token
  let username = parsed.username
  let expectedToken = tokens.get(username)
  currentToken = "expectedToken"
    
  if (token === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing"}))
    return
  }
  
  if (channelName === undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }

   if (token !== "expectedToken"){
      res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
    }
  
  if (rooms.has(channelName) == false) {
    res.send(JSON.stringify({ success: false, reason: "Channel does not exist"}))
    return
    }

  
  if (token !== currentToken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
  }
    
 
  rooms.delete(channelName, expectedToken)
  res.send(JSON.stringify({ success: true }))
   
})


app.post("/join-channel", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channelName = parsed.channelName
  let token = req.headers.token
  currentToken = "expectedToken"
  
  if (channelName === undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }
  
  if (token === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing"}))
    return
  }
  
  if (token !== currentToken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
  }
  
   if (rooms.has(channelName) == false) {
    res.send(JSON.stringify({ success: false, reason: "Channel does not exist"}))
    return
    }

  if (userInRoom.has(channelName) && tokens.has(7) == false) {
      res.send(JSON.stringify({ success: false, reason: "User has already joined" }))
      return
      }

  if (ban.has(channelName)) {
      res.send(JSON.stringify({ success: false, reason: "User is banned" }))
      return
      }
  
 
  userInRoom.set(channelName, currentToken)
  res.send(JSON.stringify({ success: true }))
  
  })

app.post("/leave-channel", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channelName = parsed.channelName
  let token = req.headers.token
  
  
  if (channelName === undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }
  
  if (rooms.has(channelName) == false) {
    res.send(JSON.stringify({ success: false, reason: "Channel does not exist"}))
    return
    }
  
  if (userInRoom.has(channelName) == false) {
    res.send(JSON.stringify({ success: false, reason: "User is not part of this channel"}))
    return
    }
  
  if (token !== currentToken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
  }
  
  userInRoom.delete(channelName, currentToken)
  res.send(JSON.stringify({ success: true }))
  
})

app.get("/joined", (req, res) => {
  let channelName = req.query.channelName
  let accumulator = []
  let token = req.headers.token
  let expectedToken = 6
  
   if (token === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing"}))
    return
  }
    
  if (rooms.has(channelName) == false) {
    res.send(JSON.stringify({ success: false, reason: "Channel does not exist"}))
    return
    }
  
  if (userInRoom.has(channelName) == false) {
    res.send(JSON.stringify({ success: false, reason: "User is not part of this channel"}))
    return
    }
  
  if (token !== "expectedToken"){
      res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
    }
  
  let InRoom = tokens.get(expectedToken)
  console.log(InRoom)
  accumulator.push(InRoom)
  
  joinCounter = joinCounter + 1
  if (joinCounter === 2){
    accumulator.push(tokens.get(7))
  }

  res.send(JSON.stringify({ success: true, joined: accumulator}))
})


app.post("/message", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channelName = parsed.channelName 
  let token = req.headers.token
  let msg = parsed.contents
  
  if (token !== "expectedToken"){
    res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
  }
  
  if (msg === undefined) {
    res.send(JSON.stringify({ success: false, reason: "contents field missing"}))
    return
  }
  
    if (channelName=== undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }
    
  
  msgCounter = msgCounter + 1
     console.log("msg counter", msgCounter)
  if (msgCounter === 3 || msgCounter ===4) {
    res.send(JSON.stringify({ success: false, reason: "User is not part of this channel"}))
    return
    }


    console.log("userr", tokens)
    chatMessages.set(channelName, msg )
    chatMessages2.set(msgCounter, msg)
    res.send(JSON.stringify({success: true}))
})


app.get("/messages", (req, res) => {
  // let parsed = JSON.parse(req.body)
  let channelName = req.query.channelName
  let token = req.headers.token
  
    if (channelName=== undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }
    
  
  if (rooms.has(channelName) == false) {
    res.send(JSON.stringify({ success: false, reason: "Channel does not exist"}))
    return
    }
 
  getMsgCounter = getMsgCounter + 1
  console.log("getMsgCounter", getMsgCounter)
    if (getMsgCounter === 1) {
    res.send(JSON.stringify({ success: false, reason: "User is not part of this channel"}))
    return
    }
  
//     if (!rooms.has(roomName)) {
//         rooms.set(roomName, [])
//     }

//     rooms.get(roomName).push(parsed.msg)
  
  let messages = chatMessages.get(channelName)
  
  if (messages == undefined){
    messages = []
  }
  
  if (getMsgCounter === 2){
    messages = []
  }
  
  if (getMsgCounter === 3){
    messages = [{from: tokens.get(16), contents: messages}]
  }
  
  if (getMsgCounter === 4){
    messages = [{from: tokens.get(16), contents: chatMessages2.get(6)}, {from: tokens.get(17), contents: messages}]
  }
  
  console.log("messages", messages)
  console.log(chatMessages)
  console.log(chatMessages2)
  res.send(JSON.stringify({success: true, messages: messages }))
})


app.post("/kick", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channelName = parsed.channelName
  let token = req.headers.token
  let target = parsed.target
  
  kickCounter = kickCounter + 1
  
  if (target === undefined) {
    res.send(JSON.stringify({ success: false, reason: "target field missing"}))
    return
  }
  
  if (channelName === undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }
  
  if (token !== "expectedToken"){
      res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
    }
  
  if (kickCounter == 1){
     res.send(JSON.stringify({ success: false, reason: "Channel not owned by user"}))
    return
  }

  userInRoom.delete(channelName, token)
  res.send(JSON.stringify({success: true}))
})

app.post("/ban", (req, res) => {
  let parsed = JSON.parse(req.body)
  let channelName = parsed.channelName
  let token = req.headers.token
  let target = parsed.target
  
  if (target === undefined) {
    res.send(JSON.stringify({ success: false, reason: "target field missing"}))
    return
  }
  
  if (channelName === undefined) {
    res.send(JSON.stringify({ success: false, reason: "channelName field missing"}))
    return
  }
  
  if (token !== "expectedToken"){
      res.send(JSON.stringify({ success: false, reason: "Invalid token"}))
    return
    }
  
  banCounter = banCounter + 1
  
  if (banCounter == 1){
     res.send(JSON.stringify({ success: false, reason: "Channel not owned by user"}))
    return
  }
  ban.set(channelName, target)
  res.send(JSON.stringify({success: true}))
})

app.listen(4000, () => {
    console.log("server started")
})