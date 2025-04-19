import { useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css'
import Shops from './components/Shops';
import ShopPage from './components/ShopPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Shops />} />
        <Route path='/shop/:shopName' element={<ShopPage />} />
      </Routes>
    </Router>
  )
}

export default App
