const path=require('path')
const http=require('http')
const express=require('express')
const Filter=require('bad-words')
const socketio=require('socket.io')
const app= express()
const server=http.createServer(app)
const io=socketio(server)
const {generateMessage}=require('./utils/message')
const {generateLocation}=require('./utils/message')
const {getUser,removeUser,addUser,getUsersInRoom}=require('./utils/users')
const port =process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
console.log('New websocket connection')

socket.on('join',({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username,room})
    if(error){
        return callback(error)
    }
    socket.join(user.room)
    socket.emit('message',generateMessage('Admin','Welcome!'))
socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))
io.to(user.room).emit('roomdata',{
    room:user.room,
    users:getUsersInRoom(user.room)
})
callback()

})
socket.on('sendMessage',(message,callback)=>{
    const user=getUser(socket.id)
    const filter=new Filter()
    if(filter.isProfane(message)){
        return callback('Profanity is not allowed')
    }
    io.to(user.room).emit('message',generateMessage(user.username,message))
    callback()

})

socket.on('disconnect',()=>{
    const user=removeUser(socket.id)
    if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomdata',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
    
})
socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
})
})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}!`)
})
