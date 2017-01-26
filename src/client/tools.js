//Used to format message to send to the server
export function formatMessage(packetType, data) {
  var packet = {'packetType': packetType, 'data': data}
  return JSON.stringify(packet)
}

//Generate unique id
export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

//Is used to search a message uid in a messages array
export function findMessage(messages, message) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if(messages[i].uid == message.uid) {
      return i;
    }
  }
  return false;
}

//Scroll down the chat div
export function scrollDownChatView() {
  var objDiv = document.getElementsByClassName("chat-box-container")[0];
  objDiv.scrollTop = objDiv.scrollHeight;
}