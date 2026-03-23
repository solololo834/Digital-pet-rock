const shopButton = document.getElementById("s");
const overlay = document.getElementById("overlay");
const closeButton = document.getElementById("close-btn");
const md = document.getElementById("moneydisp");
let money = 5;

shopButton.onclick = () => overlay.style.display = "flex";
closeButton.onclick = () => overlay.style.display = "none";

function makeDraggable(el) {
  let active = false;
  let xOffset = 0, yOffset = 0;
  let initialX, initialY;
  let currentScale = 1;
  let initialDistance = 0;

  function getDistance(touches) {
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  }

  function handleStart(e) {
    if (e.touches && e.touches.length === 2) {
      active = false;
      initialDistance = getDistance(e.touches);
    } else {
      const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
      initialX = clientX - xOffset;
      initialY = clientY - yOffset;
      if (e.target === el) active = true;
    }
  }

  function handleMove(e) {
    if (e.touches && e.touches.length === 2) {
      e.preventDefault();
      const newDistance = getDistance(e.touches);
      const delta = newDistance / initialDistance;
      initialDistance = newDistance;
      currentScale = Math.min(Math.max(0.5, currentScale * delta), 4);
      updateTransform();
    } else if (active) {
      e.preventDefault();
      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
      xOffset = clientX - initialX;
      yOffset = clientY - initialY;
      updateTransform();
    }
  }

  function updateTransform() {
    el.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${currentScale})`;
  }

  function handleEnd() { 
    active = false; 
    saveItems();
  }

  el.addEventListener("touchstart", handleStart, {passive: false});
  el.addEventListener("touchmove", handleMove, {passive: false});
  el.addEventListener("touchend", handleEnd);
  el.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);
}

function saveItems() {
    const activeItems = [];
    document.querySelectorAll('body > img').forEach(img => {
        activeItems.push({
            src: img.getAttribute('src'),
            transform: img.style.transform,
            top: img.style.top,
            left: img.style.left
        });
    });
    localStorage.setItem("rock_items", JSON.stringify(activeItems));
}

function createItem(src, price, isLoading = false) {
  if (money >= price || isLoading) {
    if (!isLoading) money -= price;
    md.innerText = "Money: " + money + "💵";
    const img = document.createElement("img");
    img.src = src;
    img.style.cssText = `position: fixed; top: 40%; left: 40%; width: 100px; z-index: 2; touch-action: none; user-select: none; cursor: move;`;
    document.body.appendChild(img);
    makeDraggable(img);
    overlay.style.display = "none";
    if (!isLoading) saveItems();
  } else {
    alert("Money not enough!");
  }
}

function loadGameState() {
  const savedBg = localStorage.getItem("rock_bg");
  if (savedBg) {
      document.body.style.backgroundImage = "url('" + savedBg + "')";
  }
  
  const savedMoney = localStorage.getItem("rock_money");
  if (savedMoney !== null) {
      money = parseInt(savedMoney);
      md.innerText = "Money: " + money + "💵";
  }
  
  const savedItems = JSON.parse(localStorage.getItem("rock_items") || "[]");
  savedItems.forEach(itemData => {
      const img = document.createElement("img");
      img.src = itemData.src;
      img.style.cssText = `position: fixed; top: ${itemData.top}; left: ${itemData.left}; width: 100px; z-index: 2; touch-action: none; user-select: none; cursor: move;`;
      img.style.transform = itemData.transform;
      document.body.appendChild(img);
      makeDraggable(img);
  });
  
  const savedName = localStorage.getItem("rock_name");
  if (savedName) {
      nameInput.value = savedName;
      chatButton.innerText = "CHAT WITH " + savedName.toUpperCase();
      chatHeaderName.innerText = savedName;
  }
}

const items = {
  "e1": "eye1.png", "e2": "eye2.png", "e3": "eye3.png",
  "h1": "balcap.png", "h2": "top.png", "h3": "moustache.png",
  "h4": "pirate.png", "h5": "chef.png", "h6": "builderhat.png",
  "m1": "mouth.png", "m2": "smile.png", "m3": "default.png", "m4": "m4.png","m5": "m5.png","m6": "m6.png", "e4": "eye4.png","e5": "eye5.png","e6": "eye6.png","ra1": "leg.png","ra2": "goggle.png","ra3": "headset.png", "ra4": "pixel.png","ra5": "arm.png","ra6": "crown.png"
};

Object.keys(items).forEach(id => {
  const btn = document.getElementById(id);
  if(btn) {
    btn.onclick = () => {
      const price = parseInt(btn.getAttribute("data-p"));
      createItem(items[id], price);
    };
  }
});

setInterval(() => {
  money += 5;
  md.innerText = "Money: " + money + "💵";
  localStorage.setItem("rock_money", money);
}, 1000);

window.onload = loadGameState;

let nameInput = document.getElementById("name");
let chatButton = document.getElementById("chat");
let chatHeaderName = document.getElementById("chat-header-name");

nameInput.addEventListener("input", function(){
  let val = nameInput.value.trim() === "" ? "DOI" : nameInput.value;
  chatButton.innerText = "CHAT WITH " + val.toUpperCase();
  chatHeaderName.innerText = val;
  localStorage.setItem("rock_name", nameInput.value);
});

(function() {
  const stopBtn = document.getElementById("stop-drag");
  let dragEnabled = true;
  
  stopBtn.onclick = () => {
    dragEnabled = !dragEnabled;
    stopBtn.innerText = dragEnabled ? "Stop DRAGGING" : "Start DRAGGING";
    stopBtn.style.backgroundColor = dragEnabled ? "red" : "green";
    
    const imgs = document.querySelectorAll('body > img');
    imgs.forEach(img => {
      img.style.pointerEvents = dragEnabled ? "auto" : "none";
    });
  };
  
  const itemsObserver = new MutationObserver(() => {
    if (!dragEnabled) {
      document.querySelectorAll('body > img').forEach(img => {
        img.style.pointerEvents = "none";
      });
    }
  });
  
  itemsObserver.observe(document.body, { childList: true });
})();

const chatOverlay = document.getElementById('chat-overlay');
const closeChatBtn = document.getElementById('close-chat');
const chatBox = document.getElementById('chat-window');
const inputField = document.getElementById('user-input');

chatButton.onclick = () => {
  chatOverlay.style.display = "flex";
};

closeChatBtn.onclick = () => {
  chatOverlay.style.display = "none";
};

const balasans = ["doi", "HIH", "HIHIHI", "WINT KWINIY", "i am the alpha rock...", "Buy me a hat!"];

function tambahPesan(teks, tipe) {
  const div = document.createElement('div');
  div.className = `message ${tipe}`;
  div.innerText = teks;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function prosesChat() {
  const pesan = inputField.value.trim();
  
  if (pesan !== "") {
    tambahPesan(pesan, 'sent');
    inputField.value = "";
    
    setTimeout(() => {
      const jawabanAcak = balasans[Math.floor(Math.random() * balasans.length)];
      tambahPesan(jawabanAcak, 'received');
    }, 700);
  }
}

inputField.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    prosesChat();
  }
});

const outfitBtn = document.getElementById("outfit-btn");
const outfitOverlay = document.getElementById("outfit-overlay");
const closeOutfitBtn = document.getElementById("close-outfit");
const saveOutfitBtn = document.getElementById("save-current-outfit");
const outfitListDiv = document.getElementById("outfit-list");

outfitBtn.onclick = () => {
  renderOutfits();
  outfitOverlay.style.display = "flex";
};
closeOutfitBtn.onclick = () => outfitOverlay.style.display = "none";

saveOutfitBtn.onclick = () => {
  const outfitName = prompt("Give a name for this outfit:");
  if (!outfitName) return;

  const currentBg = localStorage.getItem("rock_bg") || "";

  const currentItems = [];
  document.querySelectorAll('body > img').forEach(img => {
    currentItems.push({
      src: img.getAttribute('src'),
      transform: img.style.transform,
      top: img.style.top,
      left: img.style.left
    });
  });

  if (currentItems.length === 0 && !currentBg) {
    alert("your rock are naked, buy something first!");
    return;
  }

  const savedOutfits = JSON.parse(localStorage.getItem("rock_presets") || "[]");

  savedOutfits.push({ name: outfitName, items: currentItems, bg: currentBg });
  localStorage.setItem("rock_presets", JSON.stringify(savedOutfits));

  renderOutfits();
  alert("Outfit '" + outfitName + "' successfully saved");
};

function renderOutfits() {
  outfitListDiv.innerHTML = "";
  const savedOutfits = JSON.parse(localStorage.getItem("rock_presets") || "[]");
  
  savedOutfits.forEach((outfit, index) => {
    const card = document.createElement("div");
    card.className = "outfit-card";
    card.style.border = "1px solid #ccc";
    card.style.padding = "10px";
    card.style.margin = "5px";
    card.style.borderRadius = "8px";
    
    card.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${outfit.name}</div>
            <button onclick="applyOutfit(${index})" style="background: lightblue; cursor: pointer;">Use</button>
            <button onclick="deleteOutfit(${index})" style="background: #ff4c4c; color: white; cursor: pointer;">Delete</button>
        `;
    outfitListDiv.appendChild(card);
  });
}

window.deleteOutfit = (index) => {
  if (confirm("Delete this preset?")) {
    let savedOutfits = JSON.parse(localStorage.getItem("rock_presets") || "[]");
    savedOutfits.splice(index, 1);
    localStorage.setItem("rock_presets", JSON.stringify(savedOutfits));
    renderOutfits();
  }
};

window.applyOutfit = (index) => {
  const savedOutfits = JSON.parse(localStorage.getItem("rock_presets") || "[]");
  const outfit = savedOutfits[index];
  
  if (outfit.bg) {
    document.body.style.backgroundImage = "url('" + outfit.bg + "')";
    localStorage.setItem("rock_bg", outfit.bg);
  } else {
    document.body.style.backgroundImage = "";
    localStorage.removeItem("rock_bg");
  }
  
  document.querySelectorAll('body > img').forEach(img => img.remove());
  
  outfit.items.forEach(itemData => {
    const img = document.createElement("img");
    img.src = itemData.src;
    img.style.cssText = `position: fixed; top: ${itemData.top}; left: ${itemData.left}; width: 100px; z-index: 2; touch-action: none; user-select: none; cursor: move;`;
    img.style.transform = itemData.transform;
    document.body.appendChild(img);
    makeDraggable(img);
  });
  
  saveItems();
  outfitOverlay.style.display = "none";
};

const clearMenuBtn = document.getElementById("clear-menu-btn");
const clearOverlay = document.getElementById("clear-overlay");
const clearItemsBtn = document.getElementById("clear-items-btn");
const clearUiBtn = document.getElementById("clear-ui-btn");
const closeClearBtn = document.getElementById("close-clear");
const unclearBtn = document.getElementById("unclear-btn");

clearMenuBtn.onclick = () => clearOverlay.style.display = "flex";

closeClearBtn.onclick = () => clearOverlay.style.display = "none";

clearItemsBtn.onclick = () => {
  if (confirm("Delete all your ")) {
    document.querySelectorAll('body > img').forEach(img => img.remove());
    localStorage.setItem("rock_items", JSON.stringify([]));
    clearOverlay.style.display = "none";
  }
};

clearUiBtn.onclick = () => {
  const elementsToHide = document.querySelectorAll('button:not(#unclear-btn), #moneydisp, #name');
  
  elementsToHide.forEach(el => {
    el.style.display = "none";
  });
  
  unclearBtn.style.display = "block";
  clearOverlay.style.display = "none";
};

unclearBtn.onclick = () => {
  const elementsToShow = document.querySelectorAll('button:not(#unclear-btn), #moneydisp, #name');
  
  elementsToShow.forEach(el => {
    if (el.id === "moneydisp") {
      el.style.display = "block";
    } else {
      el.style.display = "";
    }
  });
  
  unclearBtn.style.display = "none";
};

const customItemBtn = document.getElementById("custom-item-btn");
const customOverlay = document.getElementById("custom-overlay");
const closeCustomBtn = document.getElementById("close-custom");
const confirmCustomBtn = document.getElementById("confirm-custom");

customItemBtn.onclick = () => { customOverlay.style.display = "flex"; };
closeCustomBtn.onclick = () => { customOverlay.style.display = "none"; };

function loadCustomItems() {
  const container = document.getElementById("custom-shop-container");
  if (!container) return;
  
  container.innerHTML = "";
  const savedCustoms = JSON.parse(localStorage.getItem("rock_custom_items") || "[]");
  
  savedCustoms.forEach(item => {
    const itemBox = document.createElement("div");
    itemBox.className = "custom-item-box";
    
    const img = document.createElement("img");
    img.src = item.image;
    img.style.width = "100px";
    img.style.height = "100px";
    img.style.objectFit = "contain";
    img.style.borderRadius = "8px";
    
    const btn = document.createElement("button");
    btn.innerText = "BUY (100💵)";
    btn.style.cssText = "background: lightgreen; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100px;";
    
    btn.onclick = () => createItem(item.image, 100);
    
    itemBox.appendChild(img);
    itemBox.appendChild(btn);
    container.appendChild(itemBox);
  });
}

document.getElementById("s").addEventListener("click", loadCustomItems);

loadCustomItems();

confirmCustomBtn.onclick = () => {
  const nameInput = document.getElementById("custom-name");
  const fileInput = document.getElementById("custom-file");
  
  if (!nameInput.value.trim() || fileInput.files.length === 0) {
    return alert("Isi nama & upload gambarnya!");
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0, 150, 150);
      
      const miniJpg = canvas.toDataURL('image/jpeg', 0.3);
      
      const savedCustoms = JSON.parse(localStorage.getItem("rock_custom_items") || "[]");
      savedCustoms.push({ name: nameInput.value, image: miniJpg });
      localStorage.setItem("rock_custom_items", JSON.stringify(savedCustoms));
      
      loadCustomItems();
      alert("Image converted to mini jpg,Item are in the shop now!");
      
      customOverlay.style.display = "none";
      nameInput.value = "";
      fileInput.value = "";
    };
  };
  reader.readAsDataURL(fileInput.files[0]);
};

const surgeryBtn = document.getElementById("surgery-btn");
const surgeryOverlay = document.getElementById("surgery-overlay");
const closeSurgery = document.getElementById("close-surgery");

surgeryBtn.onclick = () => surgeryOverlay.style.display = "flex";
closeSurgery.onclick = () => surgeryOverlay.style.display = "none";

function applySkin(fileName, price) {
  if (money >= price) {
    money -= price;
    document.getElementById("moneydisp").innerText = "Money: " + money + "💵";
    document.body.style.backgroundImage = "url('" + fileName + "')";
    localStorage.setItem("rock_bg", fileName);
    localStorage.setItem("rock_money", money);
    surgeryOverlay.style.display = "none";
  } else {
    alert("Money not enough!");
  }
}


 
document.getElementById("btn-red").onclick = () => applySkin("red.png", 50);
document.getElementById("btn-blue").onclick = () => applySkin("blue.png", 100);
document.getElementById("btn-yellow").onclick = () => applySkin("yellow.png", 100);
document.getElementById("btn-rainbow").onclick = () => applySkin("rainbow.png", 350);
document.getElementById("btn-hardy").onclick = () => applySkin("big.png", 50);
document.getElementById("btn-devils").onclick = () => applySkin("devil.png", 100);
document.getElementById("btn-golden").onclick = () => applySkin("gold.png", 000); 
document.getElementById("btn-normal").onclick = () => applySkin("rocky.png", 0);


const savedBg = localStorage.getItem("rock_bg");
if (savedBg) {
  document.body.style.backgroundImage = "url('" + savedBg + "')";
}