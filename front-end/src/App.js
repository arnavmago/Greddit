import React, { useState } from 'react';
import './index.css';
import Heading from './components/Main/Heading';
import Form from './components/Main/Form';
import Register from './components/Main/Register';
import Login from './components/Main/Login';
import axios from 'axios';
import Cookies from 'js-cookie';
import { redirect } from 'react-router-dom';

export default function App() {
  const [currentForm, setCurrentForm] = useState('login')

  const toggleForm = (formName) => {
    setCurrentForm(formName)
  }

  return (
    <div className='App'>
      <Heading />
      <Form onFormSwitch={toggleForm} />
      {
        currentForm === 'login' ? <Login /> : <Register />
      }
    </div>
  );
}

export const formSubmit = async ({ request }) => {
  const cookie = Cookies.get('token');
  const data = Object.fromEntries(await request.formData())

  if (data.email === undefined) {
    const response = await axios.post('http://localhost:8080/login', data)
    if (response.data.message === "success") {
      Cookies.set("username", data.username, { path: "/" })
      Cookies.set("token", response.data.token)
      return redirect('/profile')
    }
    else {
      return redirect('/')
    }
  }
  else if (data.password === undefined) {
    const response = await axios.post('http://localhost:8080/profile_update', data, { headers: { "Authorization": `Bearer ${cookie}` } })
    if (response.data.message === "success") {
      Cookies.set("username", data.username, { path: "/" })
    }
    return redirect('/profile')
  }
  else {
    const response = await axios.post('http://localhost:8080/register', data)
    if (response.data.message === "success") {
      Cookies.set("username", data.username, { path: "/" })
      Cookies.set("token", response.data.token)
      return redirect('/profile')
    }
    else {
      return redirect('/')
    }
  }
}