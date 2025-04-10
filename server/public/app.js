const socket = io("https://chat-alpha-khaki.vercel.app/");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");
const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");
const userListDesktop = document.querySelector(".user-list");
const userListMobile = document.querySelector(".user-list-mobile");
const roomListDesktop = document.querySelector(".room-list");
const roomListMobile = document.querySelector(".room-list-mobile");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");
const darkModetoggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const sideMenu = document.querySelector(".side-menu");

function sendMessage(e) {
  e.preventDefault();
  if (nameInput.value && msgInput.value && chatRoom.value) {
    socket.emit("message", {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = "";
  }
  msgInput.focus();
}

function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoom.value) {
    socket.emit("enterRoom", {
      name: nameInput.value,
      room: chatRoom.value,
    });
  }
}

function showUsers(users) {
  userListDesktop.textContent = "";
  userListMobile.textContent = "";
  if (users) {
    userListDesktop.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    userListMobile.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    users.forEach((user, i) => {
      userListDesktop.textContent += ` ${user.name}`;
      userListMobile.textContent += ` ${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        userListDesktop.textContent += ",";
        userListMobile.textContent += ",";
      }
    });
  }
}

function showRooms(rooms) {
  roomListDesktop.textContent = "";
  roomListMobile.textContent = "";
  if (rooms) {
    roomListDesktop.innerHTML = "<em>Active Rooms:</em>";
    roomListMobile.innerHTML = "<em>Active Rooms:</em>";
    rooms.forEach((room, i) => {
      roomListDesktop.textContent += ` ${room}`;
      roomListMobile.textContent += ` ${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomListDesktop.textContent += ",";
        roomListMobile.textContent += ",";
      }
    });
  }
}


// Generate a uniqe color for the user
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    color += ("00" + ((hash >> (i * 8)) & 0xff).toString(16)).slice(-2);
  }
  return color;
}


darkModetoggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  if (document.body.classList.contains("light-theme")) {
    darkModetoggle.textContent = "🌙";
  } else {
    darkModetoggle.textContent = "🌞";
  }
});


menuToggle.addEventListener("click", () => {
  sideMenu.classList.toggle("show");
  menuToggle.classList.toggle("open");
});


document.querySelector(".form-msg").addEventListener("submit", sendMessage);

document.querySelector(".form-join").addEventListener("submit", enterRoom);

msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});

// Listen for messages
socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";
  if (name === nameInput.value) li.className = "post post--left";
  if (name !== nameInput.value && name !== "Admin")
    li.className = "post post--right";

  const userColor = stringToColor(name); // Get color for user

  if (name !== "Admin") {
    li.innerHTML = `<div class="post__header ${
      name === nameInput.value ? "post__header--user" : "post__header--reply"
    }" style="background-color: ${userColor};">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`;
  } else {
    li.innerHTML = `<div class="post__text">${text}</div>`;
  }

  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});


let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;

  // Clear after 3 seconds
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

