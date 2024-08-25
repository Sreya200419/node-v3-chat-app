const socket=io()
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $messages=document.querySelector('#messages')
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild
    const newMessageStyles=getComputedStyle($newMessage)
    
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    const visibleHeight=$messages.offsetHeight
    const containerHeight=$messages.scrollHeight
    const scrollOffset =$messages.scrollTop+visibleHeight
    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}
socket.on('message',(mes)=>{
    console.log(mes)
    const html=Mustache.render(messageTemplate,{
        username:mes.username,
        message:mes.text,
        createdAt:moment(mes.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
        
    

})
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomdata',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    console.log(users,room)
    document.querySelector('#sidebar').innerHTML=html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message=document.querySelector('input').value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
        return console.log(error)

        }
        console.log('Message delivered')
    })
    socket.on('message',(mes)=>{
        console.log('the message was delivered')
    })
})
const $sendLocation=document.querySelector('#Send-location')

$sendLocation.addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        return alert('geolocation not supported by your browser')
    }
    $sendLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
    
})
socket.emit('join',{ username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})