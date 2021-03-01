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
			"votes": 0
		})
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		firebase.database().ref("/").child("summaries").push(summary)
		setSummary({"text": "", "votes": 0})

	}

	const updateVotes = (id, num, direction) => {
		firebase.database().ref("/").child("summaries").child(id).once("value").then((snapshot) => {
			let current_val = snapshot.val()["votes"]
			let new_val = current_val + num
			firebase.database().ref("/").child("summaries").child(id).update({"votes": new_val})
		})

		if (direction == "up") {
			document.getElementById(id + "_up").hidden = true
			document.getElementById(id + "_down").hidden = false
		} else if (direction == "down") {
			document.getElementById(id + "_up").hidden = false
			document.getElementById(id + "_down").hidden = true
		}
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
										Object.values(summaries).sort((a, b) => {
											return b.val().votes - a.val().votes
										}).map((other_summary) => {
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
								Object.values(summaries).sort((a, b) => {
									return b.val().votes - a.val().votes
								}).map((other_summary) => {
									return <li className="list-group-item">
										<div className="row">
											<div className="col-sm-1">
												<p className="text-center">{ other_summary.val().votes }</p>
											</div>
											<div className="col-sm-2">
												<div className="row">
													<button id={ other_summary.key + "_up" } onClick={() => { updateVotes(other_summary.key, 1, "up"); }}>
														<ArrowUpCircle width="35" height="35"/>
													</button>
													<button id={ other_summary.key + "_down" } onClick={() => { updateVotes(other_summary.key, -1, "down") }}>
														<ArrowDownCircle width="35" height="35"/>
													</button>
												</div>
											</div>
											<div className="col-sm-8">
												{ other_summary.val().text }
											</div>
										</div>
									</li>
								})
							}
						</ul>
					</div>
				</div>
				<div className="row">
					<button className="btn btn-primary">Submit</button>
				</div>
			</div>
		)
	}
}

export default Summaries;