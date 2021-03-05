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
	const [clusterNum, switchCluster] = useState(0)

	const [summaries, load, err] = useList(firebase.database().ref('/summaries'));


	const handleChange = (e) => {
		setSummary({
			"text": e.target.value,
			"votes": 0
		})
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		firebase.database().ref("/summaries").child("cluster" + clusterNum.toString()).child("summaries").push(summary)
		setSummary({"text": "", "votes": 0})

	}

	const updateVotes = (id, num, direction) => {
		console.log(id)
		firebase.database().ref("/summaries").child("cluster" + clusterNum.toString()).child("summaries").child(id).once("value").then((snapshot) => {
			let current_val = snapshot.val()["votes"]
			let new_val = current_val + num
			firebase.database().ref("/summaries").child("cluster" + clusterNum.toString()).child("summaries").child(id).update({"votes": new_val})
		})

		if (direction == "up") {
			document.getElementById(id + "_up").hidden = true
			document.getElementById(id + "_down").hidden = false
		} else if (direction == "down") {
			document.getElementById(id + "_up").hidden = false
			document.getElementById(id + "_down").hidden = true
		}
	}

	const next = () => {
		if(stage < 1) {
			switchStage(1)
		} else {
			switchCluster(clusterNum + 1)
			switchStage(0)
		}
	}

	if(stage < 1) {
		return(
			<div className="container">
				<h1>Summaries</h1>
				<div className="row">
			     	<div className="col">
						<h2>Suggestion Cluster { clusterNum }</h2>
						{summaries.length > 0 && 
							Object.values(summaries)[clusterNum].val().suggestions.map((x) => {
								return <h3> { x } </h3>
							})
	  					}
					</div>
					 <div className="col">
						<h2>Crowd-generated Features</h2>
						<div className="row">
							<div className="col-8">
								<ul className="list-group">
									{summaries.length > 0 &&
										Object.values(Object.values(summaries)[clusterNum].val().summaries).sort((a, b) => {
											return b.votes - a.votes
										}).map((other_summary) => {
											return <li className="list-group-item">{ other_summary.text }</li>
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
											onClick={() => next()}
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
								Object.keys(Object.values(summaries)[clusterNum].val().summaries).sort((a, b) => {
									let ob = Object.values(summaries)[clusterNum].val().summaries
									return ob[b].votes - ob[a].votes
								}).map((other_summary_key) => {
									let other_summary = Object.values(summaries)[clusterNum].val().summaries[other_summary_key]
									return <li className="list-group-item">
										<div className="row">
											<div className="col-sm-1">
												<p className="text-center">{ other_summary.votes }</p>
											</div>
											<div className="col-sm-2">
												<div className="row">
													<button id={ other_summary_key + "_up" } onClick={() => { updateVotes(other_summary_key, 1, "up"); }}>
														<ArrowUpCircle width="35" height="35"/>
													</button>
													<button id={ other_summary_key + "_down" } onClick={() => { updateVotes(other_summary_key, -1, "down") }}>
														<ArrowDownCircle width="35" height="35"/>
													</button>
												</div>
											</div>
											<div className="col-sm-8">
												{ other_summary.text }
											</div>
										</div>
									</li>
								})
							}
						</ul>
					</div>
				</div>
				<div className="row">
					{ clusterNum < Object.values(summaries).length - 1 
						? <button 
							className="btn btn-primary"
							onClick={() => next()}
						>
							Submit
						</button>
						: <a href="/tasks/conclusion">
							<button className="btn btn-primary">
								Done
							</button>
						</a>
					}
				</div>
			</div>
		)
	}
}

export default Summaries;