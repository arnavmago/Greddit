import React from 'react';
import '../../index.css';
import { NavLink, Outlet } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HomeIcon from '@mui/icons-material/Home';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BookmarkIcon from '@mui/icons-material/Bookmark';

export default function SGNavbar() {
    const { name } = useParams()

    return (
        <div>
            <div className='nav'>
                <h1 className='nav-head'>G<span>reddit</span></h1>
                <NavLink to={`/Allsubgreddits/${name}`} className='icon'> <PostAddIcon fontSize='large' /> </NavLink>
                <NavLink to="/Allsubgreddits" className='icon'><HomeIcon fontSize='large' /></NavLink>
                <NavLink to="/savedPosts" className='icon'><BookmarkIcon fontSize='large' /></NavLink>
                <NavLink to="/subgreddits" className='icon'> <MenuBookIcon fontSize='large' /> </NavLink>
                <NavLink to="/profile" className='icon'> <AccountBoxIcon fontSize='large' /> </NavLink>
            </div>
            <main>
                <Outlet />
            </main>
        </div>
    )
}