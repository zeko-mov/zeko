
// =================================
// ZEZO ROBOT - SETTINGS
// =================================

// حط مفتاح OpenAI الجديد بين علامتي التنصيص
const OPENAI_API_KEY = "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";

const MODEL = "gpt-4.1-mini";

// =================================
// ZEZO ELEMENTS
// =================================

const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");

const chatBox = document.getElementById("chatBox");
const statusText = document.getElementById("status");
const typing = document.getElementById("typing");
const robotHead = document.getElementById("robotHead");

// =================================
// CHAT MEMORY
// =================================

let history = [];
let busy = false;

// =================================
// ADD MESSAGE TO SCREEN
// =================================

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = "message " + type;
  message.textContent = text;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// =================================
// ROBOT SPEAKING
// =================================

function speak(text) {
  if (!("speechSynthesis" in window)) {
    statusText.textContent = "الصوت غير مدعوم على جهازك";
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "ar-EG";
  speech.rate = 1.08;
  speech.pitch = 1.35;
  speech.volume = 1;

  speech.onstart = () => {
    robotHead.classList.add("talking");
    statusText.textContent = "زيزو بيتكلم 😂";
  };

  speech.onend = () => {
    robotHead.classList.remove("talking");
    statusText.textContent = "جاهز أكلمك ❤️";
  };

  speech.onerror = () => {
    robotHead.classList.remove("talking");
    statusText.textContent = "الصوت وقف";
  };

  window.speechSynthesis.speak(speech);
}

// =================================
// CONNECT TO OPENAI
// =================================

async function askZezo(userMessage) {
  if (
    !OPENAI_API_KEY ||
    OPENAI_API_KEY === "ضع_مفتاح_API_الجديد_هنا"
  ) {
    throw new Error("حط مفتاح API في أول ملف script.js");
  }

  history.push({
    role: "user",
    content: userMessage
  });

  const response = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },

      body: JSON.stringify({
        model: MODEL,

        instructions: `
أنت زيزو، روبوت ذكي وصاحب المستخدم.
اتكلم باللهجة المصرية العامية.
خليك مرح وطفولي ولطيف ومضحك.
استخدم الإيموجي بطريقة طبيعية.
خلي ردودك مفهومة ومش طويلة بدون داعي.
اسمك زيزو ZEZO.
لو المستخدم بيهزر معاك، اهزر معاه بأدب.
        `,

        input: history
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "حصل خطأ من خدمة الذكاء الاصطناعي"
    );
  }

  const answer = data.output_text;

  if (!answer) {
    throw new Error("زيزو مرجعش رد، جرب تاني");
  }

  history.push({
    role: "assistant",
    content: answer
  });

  return answer;
}

// =================================
// SEND MESSAGE
// =================================

async function sendMessage() {
  const message = input.value.trim();

  if (!message || busy) return;

  input.value = "";

  addMessage(message, "user");

  busy = true;
  sendBtn.disabled = true;

  typing.textContent = "زيزو بيفكر... 🤔";
  statusText.textContent = "بفكر في الرد...";

  try {
    const answer = await askZezo(message);

    addMessage(answer, "bot");
    speak(answer);

  } catch (error) {
    console.error(error);

    addMessage(
      "معلش يا صاحبي 😅 حصلت مشكلة: " + error.message,
      "bot"
    );

    statusText.textContent = "حصلت مشكلة";
  }

  typing.textContent = "";
  busy = false;
  sendBtn.disabled = false;
}

// =================================
// BUTTON EVENTS
// =================================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

stopBtn.addEventListener("click", function() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  robotHead.classList.remove("talking");
  statusText.textContent = "وقفت الصوت 🔇";
});

clearBtn.addEventListener("click", function() {
  history = [];
  chatBox.innerHTML = "";

  window.speechSynthesis?.cancel();

  robotHead.classList.remove("talking");

  addMessage(
    "المحادثة اتمسحت! يلا نبدأ من جديد 😂❤️",
    "bot"
  );

  statusText.textContent = "جاهز أكلمك ❤️";
});

// =================================
// VOICE RECOGNITION
// =================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

let recognition = null;
let listening = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.lang = "ar-EG";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function() {
    listening = true;
    micBtn.textContent = "🎙️ سامعك...";
    statusText.textContent = "اتكلم يا صاحبي";
  };

  recognition.onresult = function(event) {
    const spokenText =
      event.results[0][0].transcript;

    input.value = spokenText;
    sendMessage();
  };

  recognition.onerror = function(event) {
    statusText.textContent =
      "مشكلة في الميكروفون: " + event.error;
  };

  recognition.onend = function() {
    listening = false;
    micBtn.textContent = "🎤 اتكلم";

    if (!busy) {
      statusText.textContent = "جاهز أكلمك ❤️";
    }
  };

} else {
  micBtn.disabled = true;
  micBtn.textContent = "الميكروفون غير مدعوم";
}

micBtn.addEventListener("click", function() {
  if (!recognition) {
    alert("المتصفح مش بيدعم التعرف على الصوت");
    return;
  }

  if (listening) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (error) {
      console.error(error);
    }
  }
});

// =================================
// START ZEZO
// =================================

console.log("ZEZO ROBOT IS READY 🤖");
