import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

const AppRoutes = () => {
  return (
   
      <BrowserRouter>
         <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/login' element={<Login/>}/>
         </Routes>
      </BrowserRouter>
   
  )
}

export default AppRoutes
