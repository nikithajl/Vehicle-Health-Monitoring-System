import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'; 
import App from './App.jsx';
import Enginelive from './Enginelive.jsx';
import Checkhealth from './Checkhealth.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
      <Route path='/' element={<App/>}>
        <Route index={true} element={<Enginelive/>} />
        <Route path='healthstatus' element={<Checkhealth/>} />
      </Route>

  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
   
      <RouterProvider router={router} />
    
  //</React.StrictMode>
);
