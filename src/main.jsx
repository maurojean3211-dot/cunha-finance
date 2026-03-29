import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 🔥 SPLASH SIMPLES (SEM QUEBRAR REACT)
const splash = document.createElement("div")

splash.style.position = "fixed"
splash.style.top = "0"
splash.style.left = "0"
splash.style.width = "100%"
splash.style.height = "100%"
splash.style.background = "#020617"
splash.style.display = "flex"
splash.style.alignItems = "center"
splash.style.justifyContent = "center"
splash.style.flexDirection = "column"
splash.style.zIndex = "9999"

splash.innerHTML = `
  <img src="/icon-512.png" style="width:120px;margin-bottom:15px;" />
  <h1 style="color:#22c55e;font-family:Arial;">Cunha Finance</h1>
`

document.body.appendChild(splash)

// 🔥 RENDER NORMAL (SEM ATRASO)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 🔥 REMOVE SPLASH DEPOIS
setTimeout(() => {
  splash.style.transition = "opacity 0.5s"
  splash.style.opacity = "0"

  setTimeout(() => splash.remove(), 500)
}, 1200)