const activities = [
  "I love matcha!",
  "I produce music!",
  "I make films!",
  "I love learning!",
  "I work with robots!"
];
let currentActivity = 0;

const rotatingBlock = document.getElementById("rotatingBlock"); 

function typeText(text, container, callback) {
  container.textContent = "";
  let index = 0;
  const interval = setInterval(() => {
    container.textContent += text.charAt(index);
    index++;
    if (index === text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 40); 
}

function renderActivity() {
  const block = document.createElement("div");
  block.classList.add("blockPanel");
  rotatingBlock.innerHTML = "";
  rotatingBlock.appendChild(block);

  typeText(activities[currentActivity], block);
}

renderActivity();

setInterval(() => {
  currentActivity = (currentActivity + 1) % activities.length;
  renderActivity();
}, 2500);