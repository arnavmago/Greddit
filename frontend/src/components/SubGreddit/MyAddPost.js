import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import '../../index.css';
import { Form, redirect, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
let globalp = '';

export default function MyAddPost() {
    let { name } = useParams();
    globalp = name;
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
            <h1 className='addSG-heading'>New Post</h1>
            <div className='addSG-form'>
                <Form method='post' action={`/subgreddits/${name}/Addpost`}>
                    <input type='text' name='postedBy' value={cookie.username}></input><br />
                    <input type='text' name='SG_name' value={name}></input><br />
                    <textarea name='content' placeholder='enter content here'></textarea><br />
                    <button type='submit' className='post-btn'> <SendIcon /> </button>
                </Form>
            </div>
        </div>
    )
}

export const createMyPost = async ({ request }) => {
    const params = globalp
    const cookie = Cookies.get('token');
    const data = Object.fromEntries(await request.formData())

    const banned = await axios.post('http://localhost:8080/getBanned', { SG_name: data.SG_name }, { headers: { "Authorization": `Bearer ${cookie}` } })

    const newData = {
        postedBy: data.postedBy,
        SG_name: data.SG_name,
        content: data.content,
        upvotes: 0,
        downvotes: 0,
        banned: banned.data
    }

    const response = await axios.post('http://localhost:8080/post', newData, { headers: { "Authorization": `Bearer ${cookie}` } })
    if (response.data.message !== "success")
        window.alert("Failed")

    return redirect(`/subgreddits/${params}`)
}