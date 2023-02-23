import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import '../../index.css';
import { Form, redirect } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function AddSubgreddit() {
    const [cookie] = useCookies()
    const navigate = useNavigate()

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='addSubgreddits'>
            <h1 className='addSG-heading'>New SubGreddit</h1>
            <div className='addSG-form'>
                <Form method='post' action='/subgreddits/addsubgreddit'>
                    <input type='text' name='Mod_username' value={cookie.username}></input><br />
                    <input type='text' name='SG_name' placeholder='SubGreddit Name' required></input><br />
                    <input type='text' name='description' placeholder='Description'></input><br />
                    <input type='text' name='tags' placeholder='Tags'></input><br />
                    <input type='text' name='b_keywords' placeholder='Banned Keywords'></input><br /><br />
                    <button type='submit'>Create</button>
                </Form>
            </div>
        </div>
    )
}

export const createSubGreddit = async ({ request }) => {
    const cookie = Cookies.get('token');
    const data = Object.fromEntries(await request.formData())

    const newData = {
        Mod_username: data.Mod_username,
        SG_name: data.SG_name,
        description: data.description,
        tags: data.tags.replaceAll(" ", "").split(','),
        b_keywords: data.b_keywords.replaceAll(" ", "").split(','),
        num_users: 1,
        num_posts: 0
    }

    const response = await axios.post('http://localhost:8080/addsubgreddit', newData, { headers: { "Authorization": `Bearer ${cookie}` } })
    if (response.data.message !== "success")
        window.alert("Failed")
    return redirect('/subgreddits')
}