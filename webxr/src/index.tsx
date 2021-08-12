import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback='loading...'>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
)
