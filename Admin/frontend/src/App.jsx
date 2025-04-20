import { useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Admin from "./components/Admin"
import ShopList from './components/ShopList';
import ShopDetails from './components/ShopDetails'

function App() {
  const [count, setCount] = useState(0)

  return (
   <Router>
    <Routes>
      <Route path='/' element={< Admin />} />
      <Route path='/shoplist' element={ <ShopList/>} />
      <Route path='/shop-details/:shopName' element={ <ShopDetails />} />
    </Routes>
   </Router>
  )
}

export default App
