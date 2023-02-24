import React, { useEffect, useState } from 'react';
import '../../index.css'
import { useParams } from "react-router";
import { useCookies } from 'react-cookie';
import { useNavigate, Form, redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Avatar from '../Images/Darth-Vader-Avatar.png';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ReportIcon from '@mui/icons-material/Report';
let globalp = ''

function CommentItem(props) {
    return (
        <li className='comment'>
            {props.comment} - {props.by}
        </li>
    )
}

function List(props) {
    const [cookie] = useCookies();
    const [comments, setComments] = useState('')
    const [modal, showModal] = useState(false)
    let { name } = useParams();

    const comment = () => {
        if (comments.length > 0) {
            axios.post('http://localhost:8080/setComment', { SG_name: props.SG_name, comment: comments, user: props.by, content: props.content }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
                .then((response) => {
                    if (response.data.message === "success") {
                        window.location.reload(false);
                    }
                })
        }
    }

    const follow = () => {
        axios.post('http://localhost:8080/addFollower', { username: props.by, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
                else {
                    window.alert(response.data.message);
                }
            })
    }

    const upvote = () => {
        axios.post('http://localhost:8080/upvote', { SG_name: props.SG_name, user: props.by, content: props.content, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
                else {
                    window.alert(response.data.message);
                }
            })
    }

    const downvote = () => {
        axios.post('http://localhost:8080/downvote', { SG_name: props.SG_name, user: props.by, content: props.content, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
                else {
                    window.alert(response.data.message);
                }
            })
    }

    const savePost = () => {
        axios.post('http://localhost:8080/savePost', { SG_name: props.SG_name, user: props.by, content: props.content, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
                else {
                    window.alert(response.data.message);
                }
            })
    }

    const reportPost = () => {
        showModal(!modal)
    }

    return (
        <li >
            <div className='post'>
                <h1>By: {props.by} <button className='subGP-icon' onClick={follow}><AddCircleOutlineIcon /></button> </h1>
                <p>{props.content}</p>
                <div className='vote-btns'>
                    <button className='subGP-icon' onClick={upvote}><ArrowUpwardIcon /> {props.upvotes}</button> <button className='subGP-icon' onClick={downvote}><ArrowDownwardIcon /> {props.downvotes}</button>
                </div>
                <button className='subGP-icon' onClick={reportPost}><ReportIcon /></button>
                <button className='subGP-icon' onClick={savePost}><BookmarkIcon /> </button>
                <input type='text' placeholder='Comment' className='comment-box' onChange={(event) => setComments(event.target.value)}></input>
                <button type='button' className='subGP-icon' onClick={comment}> <SendIcon /> </button>
                <ul className='comments'>
                    {props.allComments?.map((comment) => <CommentItem comment={comment.content} by={comment.postedBy} />)}
                </ul>
            </div>
            {
                modal && (
                    <>
                        <Form method='post' action={`/Allsubgreddits/${name}`}>
                            <p>Why are you reporting the post?</p>
                            <textarea name='reportReason'></textarea> <br />
                            <label htmlFor='nameOfUser'>User reported:</label>
                            <input name='userReported' id='nameOfUser' value={props.by}></input> <br />
                            <label htmlFor='postContent'>Content of post reported:</label>
                            <input name='postContent' id='postContent' value={props.content}></input> <br />
                            <button type='submit' className='post-btn'> <SendIcon /> </button>
                        </Form>
                    </>
                )
            }
        </li>
    )
}

export default function SubGredditPage() {
    let { name } = useParams();
    globalp = name
    const [cookie] = useCookies();
    const navigate = useNavigate()
    const [posts, setPosts] = useState([]);
    const [description, setDescription] = useState('')

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }

        axios.post("http://localhost:8080/getPosts", { SG_name: name }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                setPosts(response.data)
            })

        axios.post("http://localhost:8080/getDesc", { SG_name: name }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                setDescription(response.data.message)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="SGPage">
            <div className='SG-heading'>
                <img className='Avatar' src={Avatar} alt={"Darth Vader"}></img>
                <h1><span>{name}</span></h1>
            </div>
            <p>Description: {description}</p>
            <button className='add-SubG-btn' onClick={() => navigate(`/Allsubgreddits/${name}/Addpost`)}>Add a Post</button>
            <ul>
                {posts.map((post) => <List by={post.postedBy} upvotes={post.upvotes} downvotes={post.downvotes} content={post.content} SG_name={post.SG_name} allComments={post.Comments} />)}
            </ul>
        </div>
    )
}

export const reportSubmit = async ({ request }) => {
    const params = globalp
    const TokenCookie = Cookies.get('token');
    const UserCookie = Cookies.get('username');
    const data = Object.fromEntries(await request.formData())

    const newData = {
        reportBy: UserCookie,
        content: data.reportReason,
        userReported: data.userReported,
        SG_name: params,
        contentReported: data.postContent,
        ignored: 0
    }

    const response = await axios.post('http://localhost:8080/report', newData, { headers: { "Authorization": `Bearer ${TokenCookie}` } })
    if (response.data.message !== "success")
        window.alert("Failed")

    window.location.reload(false)
    return redirect(`/Allsubgreddits/${params}`)
}