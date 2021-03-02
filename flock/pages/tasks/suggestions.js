import { useState, useEffect } from "react";

import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';

import 'bootstrap/dist/css/bootstrap.css';

import Picture from "../../components/Picture";


//have to wait for loading for some reason
if (!firebase.apps.length) {
	firebase.initializeApp(
		{
			apiKey: "AIzaSyCd-ShNtjMD5hi1c4FpqLhuc7gOyc9URRw",
			authDomain: "flock-cafbb.firebaseapp.com",
			projectId: "flock-cafbb",
			storageBucket: "flock-cafbb.appspot.com",
			messagingSenderId: "1036154784473",
			appId: "1:1036154784473:web:5dcd0b48cee589b52bccc8",
			measurementId: "G-T45G3X54Y1"
		}
	);
}


const Suggestions = () => {
	const [suggestion, setSuggestion] = useState({})
	const [suggestions, addSuggestions] = useState([])

	const [snapshots, loading, error] = useList(firebase.database().ref('/'));

	const handleChange = (e) => {
		setSuggestion({
			"text": e.target.value,
		})
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		firebase.database().ref("/").child("suggestions").push(suggestion)
		addSuggestions(state => [suggestion, ...state])
		setSuggestion({"text": ""})

	}

	return (
		<div className="container">
			<h1>Suggestions</h1>
			<div className="row">
		     	<div className="col">
					<Picture
						dog={ snapshots.length > 0 ? snapshots[0].val()["pictureA"] : "" }
					/>
				</div>
				 <div className="col">
					<Picture 
						dog={ snapshots.length > 0 ? snapshots[0].val()["pictureB"] : "" }
					/>
				</div>
			</div>
			<div className="row">
				<p>Please briefly describe the differences and similarities between these two dogs</p>
				<p>Use single sentences that focus on features. For example "their noses are of different sizes", "their fur is of a different color"</p>
			</div>
			<div className="row">
				<div className="col">
				    <form 
				    	onSubmit={handleSubmit}
					>
						<div className="col">
							<textarea 
								placeholder="Suggestion" 
								value={suggestion.text}
								onChange={handleChange}
								className="form-control"
								columns="30"
								rows="3"
							/>
						</div>
						<div className="col">
							<button className="btn btn-primary">
								Submit
							</button>

						</div>
					</form>
				</div>
				<div className="col">
					<h4>You have given { suggestions.length } answers out of a minimum of 5</h4>
					<a href="/tasks/conclusion">
						<button hidden={ suggestions.length < 5 } className="btn btn-primary">
							Done
						</button>
					</a>
					<ul className="list-group">
						{ suggestions.length > 0 &&
							suggestions.map((x) => {
								return <li>{ x.text }</li>
							})
						}
					</ul>	
				</div>
		    </div>
		</div>
	)
}

export default Suggestions;