let DATA = null;
let currentChannelId = "c-general";

fetch("./mock/data.json")
  .then((r) => r.json())
  .then((d) => {
    DATA = d;
    init();
  });

function init() {
  document.querySelectorAll(".channel-item").forEach((el) => {
    el.addEventListener("click", function () {
      document.querySelectorAll(".channel-item").forEach((x) => x.classList.remove("active"));
      el.classList.add("active");
      currentChannelId = el.getAttribute("data-channel-id");
      render();
    });
  });

  document.getElementById("composer-send").addEventListener("click", function () {
    const input = document.getElementById("composer-input");
    const text = input.value.trim();
    if (text === "") return;
    const ch = DATA.channels.find((c) => c.id === currentChannelId);
    ch.messages.push({
      id: "m-" + Date.now(),
      authorId: DATA.currentUser.id,
      text: text,
      time: new Date().toTimeString().slice(0, 5),
    });
    input.value = "";
    render();
  });

  document.getElementById("composer-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("composer-send").click();
  });

  render();
}

function render() {
  const ch = DATA.channels.find((c) => c.id === currentChannelId);
  document.getElementById("current-channel-name").textContent = ch.name;
  document.getElementById("current-channel-topic").textContent = ch.topic;
  document.getElementById("member-count").textContent = ch.members.length + " miembros";
  document.getElementById("composer-input").placeholder = "Escribe un mensaje en #" + ch.name;

  const msgs = document.getElementById("messages");
  msgs.innerHTML = "";
  for (let i = 0; i < ch.messages.length; i++) {
    const m = ch.messages[i];
    const u = DATA.users.find((x) => x.id === m.authorId);
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML =
      '<div class="avatar">' +
      u.avatar +
      '</div><div class="msg-body"><div class="msg-meta"><strong class="msg-author">' +
      u.name +
      '</strong><span class="msg-time">' +
      m.time +
      '</span></div><p class="msg-text">' +
      m.text +
      "</p></div>";
    msgs.appendChild(div);
  }

  const ml = document.getElementById("member-list");
  ml.innerHTML = "";
  ch.members.forEach((id) => {
    const u = DATA.users.find((x) => x.id === id);
    const li = document.createElement("li");
    li.className = "member-item";
    li.innerHTML = '<div class="avatar small">' + u.avatar + "</div><span>" + u.name + "</span>";
    ml.appendChild(li);
  });
}
