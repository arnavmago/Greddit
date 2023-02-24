import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import './index.css';
import App from './App';
import Profile from './components/Profile/Profile'
import { formSubmit } from './App'
import { createSubGreddit } from './components/SubGreddit/AddSubgreddit';
import Followers from './components/Profile/Followers';
import Following from './components/Profile/Following';
import Navbar from './components/Main/Navbar';
import Subgreddits from './components/SubGreddit/Subgreddits';
import AddSubgreddit from './components/SubGreddit/AddSubgreddit';
import SGNavbar from './components/SubGreddit/SGNavbar';
import SubGredditPage from './components/SubGreddit/SubGredditPage';
import MySubGredditPage from './components/SubGreddit/MySubGredditPage';
import Users from './components/SubGreddit/Users';
import Requests from './components/SubGreddit/Requests';
import Stats from './components/SubGreddit/Stats';
import Report from './components/SubGreddit/Report';
import AllSubgreddits from './components/SubGreddit/AllSubgreddits';
import AllSGNavbar from './components/SubGreddit/AllSGNavbar';
import AddPost from './components/SubGreddit/Addpost';
import MyAddPost from './components/SubGreddit/MyAddPost';
import { createPost } from './components/SubGreddit/Addpost';
import { createMyPost } from './components/SubGreddit/MyAddPost';
import SavedPosts from './components/SubGreddit/savedPosts';
import { reportSubmit } from './components/SubGreddit/SubGredditPage';
import { MyreportSubmit } from './components/SubGreddit/MySubGredditPage';
import { savedReportSubmit } from './components/SubGreddit/savedPosts';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<App />} />
      <Route path="/" element={<Navbar />}>
        <Route path="/profile" element={<Profile />} action={formSubmit} />
        <Route path="/profile/followers" element={<Followers />} />
        <Route path="/profile/following" element={<Following />} />
        <Route path="/Allsubgreddits" element={<AllSubgreddits />} />
        <Route path='/subgreddits' element={<Subgreddits />} />
        <Route path='/subgreddits/addsubgreddit' element={<AddSubgreddit />} action={createSubGreddit} />
        <Route path='/savedPosts' element={< SavedPosts />} action={savedReportSubmit} />
      </Route>
      <Route path='/subgreddits/:name' element={<SGNavbar />} action={MyreportSubmit}>
        <Route index element={<MySubGredditPage />} />
        <Route path='Addpost' element={<MyAddPost />} action={createMyPost} />
        <Route path='users' element={<Users />} />
        <Route path='requests' element={<Requests />} />
        <Route path='stats' element={<Stats />} />
        <Route path='report' element={<Report />} />
      </Route>
      <Route path='/Allsubgreddits/:name' element={<AllSGNavbar />} action={reportSubmit}>
        <Route index element={<SubGredditPage />} />
        <Route path='Addpost' element={<AddPost />} action={createPost} />
      </Route>
    </Route>
  ));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CookiesProvider>
    <RouterProvider router={router} />
  </CookiesProvider>
);
