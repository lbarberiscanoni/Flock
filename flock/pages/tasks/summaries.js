import { useState, useEffect } from "react";

import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';

import 'bootstrap/dist/css/bootstrap.css';
import { ArrowUpCircle, ArrowDownCircle } from 'react-bootstrap-icons';

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


const Summaries = () => {
	const [summary, setSummary] = useState({})
	const [stage, switchStage] = useState(0)

	const [suggestions, loading, error] = useList(firebase.database().ref('/suggestions'));
	const [summaries, load, err] = useList(firebase.database().ref('/summaries'));


	const handleChange = (e) => {
		setSummary({
			"text": e.target.value,
		})
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		firebase.database().ref("/").child("summaries").push(summary)
		setSummary({"text": ""})

	}

	if(stage < 1) {
		return(
			<div className="container">
				<h1>Summaries</h1>
				<div className="row">
			     	<div className="col">
						<h2>Suggestion Cluster</h2>
						{suggestions.length > 0 &&
							Object.values(suggestions).map((suggestion) => {
								return <h3>{ suggestion.val().text }</h3>
							})
	  					}
					</div>
					 <div className="col">
						<h2>Crowd-generated Features</h2>
						<div className="row">
							<div className="col-8">
								<ul className="list-group">
									{summaries.length > 0 &&
										Object.values(summaries).map((other_summary) => {
											return <li className="list-group-item">{ other_summary.val().text }</li>
										})
									}
								</ul>
							</div>
							<div className="row">
								<form 
									onSubmit={handleSubmit}
								>
									<div className="col">
										<textarea 
											placeholder="Add a summary" 
											value={summary.text}
											onChange={handleChange}
											className="form-control"
										/>
									</div>
									<div className="col">
										<button className="btn btn-primary">
											Submit
										</button>
										<button 
											className="btn btn-primary"
											onClick={() => switchStage(stage + 1)}
										>
											Next
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	} else {
		return(
			<div className="container">
				<h1>Summaries</h1>
				<div className="row">
					<h2>Crowd-generated Features</h2>
					<div className="col-8">
						<ul className="list-group">
							{summaries.length > 0 &&
								Object.values(summaries).map((other_summary) => {
									return <li className="list-group-item">
										<div className="col">
											<div className="row">
												<button onClick={() => { updateVotes(feature_key, 1) }}>
													<ArrowUpCircle width="35" height="35"/>
												</button>
											</div>
											<div className="row">
												<button onClick={() => { updateVotes(feature_key, -1) }}>
													<ArrowDownCircle width="35" height="35"/>
												</button>
											</div>
										</div>
										<div className="col">
											{ other_summary.val().text }
										</div>
									</li>
								})
							}
						</ul>
					</div>
				</div>
			</div>
		)
	}
}

export default Summaries;