import { useLoaderData } from 'react-router-dom';
import axios from 'axios';
import ContentHeader from './ContentHeader.js';
import PostsList from './PostsList.js';
// import './css/Home.css';

const util = require('@lenny_zhou/util');

export async function loader() {
	util.log('Home.loader:');
	const data = {};

	try {
		var res = await axios.get(
			process.env.REACT_APP_FEED_POSTS,
			{ withCredentials: true }
		);

		data.posts = res.data;
	} catch (err) {
		util.log(err);
	}

	return data;
}

export default function Home() {
	const data = useLoaderData();

	return (
		<>
			{/* <ContentHeader contentHeader='Home' /> */}
			{/* <div id='content-panel'> */}
			<PostsList posts={data.posts} />
			{/* </div> */}
		</>
	);
}