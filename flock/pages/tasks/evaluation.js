import { useState, useEffect } from "react";

import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';

import 'bootstrap/dist/css/bootstrap.css';
import { ArrowUpCircle, ArrowDownCircle } from 'react-bootstrap-icons';

import Question from "../../components/Question";
import Picture from "../../components/Picture";
import Link from 'next/link'



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


const Evaluation = () => {
  
	const [question, setQuestion] = useState({})
	const [dogPair, newPair] = useState(0)
	const [stage, switchStage] = useState(0)
	const [featureNum, changeFeature] = useState(0)


	const [snapshots, loading, error] = useList(firebase.database().ref('/'));

	const [user_id, changeUser] = useState(Math.random().toString().split(".")[1])

	//random natural number Math.floor(Math.random() * (max - min + 1)) + min;
	const [attentionCheckParams, updateAttentionCheck] = useState([
		Math.floor(Math.random() * (5 - 1 + 1)) + 1,
		Math.floor(Math.random() * (10 - 5 + 1)) + 5
	])

	// const [attentionCheckParams, updateAttentionCheck] = useState([1, 2])
	const [attentionCheckStatus, updateAttentionCheckStatus] = useState(false)

	const handleChange = (e) => {
		setQuestion({
			"text": e.target.value,
			"score": {0:0},
			"weight": 1
		})
	}

	const changePics = () => {
		newPair(dogPair + 1)
		setQuestion({"text": "", "votes": 0, "score": {0:0}})
	}

	const updateRank = (id, num) => {
		firebase.database().ref("/").child("pair_" + dogPair.toString()).child("features").child(id).once("value").then((snapshot) => {
			let current_val = snapshot.val().weight[user_id] ? snapshot.val().weight[user_id] : 0
			let new_val = current_val + num
			let updates = {}
			updates["weight/" + user_id] = new_val
			firebase.database().ref("/").child("pair_" + dogPair.toString()).child("features").child(id).update(updates)
		})
	}

	const updateScores = (score) => {
		//add the user to the tree branch for attention checks
		if (featureNum < 1) {
			let updatesToAttentionChecks = {}
			updatesToAttentionChecks[user_id + "/score/"] = 0
			firebase.database().ref("/").child("pair_" + dogPair.toString()).child("attention_checks").update(updatesToAttentionChecks)
		}

		//check if you are in attentionChecking mode
		if (!attentionCheckStatus && featureNum == attentionCheckParams[1]) {
			let updates = {}
			updates[user_id + "/score/"] = score
			firebase.database().ref("/").child("pair_" + dogPair.toString()).child("attention_checks").update(updates)
		} else {
			let feature_id = Object.keys(snapshots[dogPair].val()["features"]).filter(key => 
				snapshots[dogPair].val()["features"][key]["text"] == Object.values(snapshots[dogPair].val()["features"])[featureNum]["text"]
			)[0]
			let updates = {}
			updates["score/" + user_id] = score
			firebase.database().ref("/").child("pair_" + dogPair.toString()).child("features").child(feature_id).update(updates)
		}
	}

	const nextPair = () => {
		if (stage < 1) {
			switchStage(1)
		} else if (stage == 1) {
			switchStage(0)
			changePics()
		}
	}

	const nextFeature = () => {
		if (featureNum < Object.values(snapshots[dogPair].val()["features"]).length - 1) {
			changeFeature(featureNum + 1)
		} else {
			changeFeature(0)
		}
	}

	const attentionCheck = () => {
		firebase.database().ref("/").child("pair_" + dogPair.toString()).child("features").once("value").then((snapshot) => {
			let prior_answer = Object.values(snapshot.val())[attentionCheckParams[0]]["score"][user_id.toString()]
			let current_answer = snapshots[dogPair].val()["attention_checks"][user_id.toString()]["score"]

			if (prior_answer == current_answer) {
				alert("you passed the attention check! \n keep going")
				updateAttentionCheckStatus(true)
			} else {
				alert("you failed the attention check \n you are now going to start over")
				let updatesToAttentionChecks = {}
				updatesToAttentionChecks[user_id + "/score/"] = 0
				firebase.database().ref("/").child("pair_" + dogPair.toString()).child("attention_checks").update(updatesToAttentionChecks)
				changeFeature(0)
			}
		})
	}

	if(snapshots.length > 0) {
		if(stage < 1) {
			if (!attentionCheckStatus && featureNum == attentionCheckParams[1]) {
				return (
				  	<div className="container">
					    <h1>Flock</h1>
					    <div className="row">
					     	<div className="col">
								<Picture
									dog={ snapshots[dogPair].val()["pictureA"] }
								/>
							</div>
							 <div className="col">
								<Picture 
									dog={ snapshots[dogPair].val()["pictureB"] }
								/>
							</div>
						</div>
					    <div className="row"></div>
					    <div className="row"></div>
						<div className="row">
							<div className="col">
								<ul className="list-group">
									<li className="list-group-item"> 	
										<div className="row">
											<div className="col-sm-2">
												<p>Confidence Level</p>
												<h3>
													{ snapshots[dogPair].val()["attention_checks"][user_id.toString()]["score"] }
												</h3>
											</div>
											<div className="col-sm-8">
												<h3>
													{ Object.values(snapshots[dogPair].val()["features"])[attentionCheckParams[0]]["text"] }
												</h3>
												<div className="form-group">
													<label>Not at all</label>
													<input 
														type="range" 
														className="form-range" 
														min="0" 
														max="1" 
														defaultValue="0.5" 
														step="0.05" 
														onChange={(e) => { updateScores(e.target.value) }} 
													/>
													<label>Absolutely Yes</label>
												</div>
											</div>
											<div className="col">
												<button 
													className="btn btn-primary" 
													onClick={() => attentionCheck() }
												>
													Next Feature
												</button>
											</div>
											<div className="col"></div>
										</div>
									</li>
								</ul>	
							</div>
						</div>
					</div>
				)
			} else {
			  	return (
				  	<div className="container">
					    <h1>Flock</h1>
					    <div className="row">
					     	<div className="col">
								<Picture
									dog={ snapshots[dogPair].val()["pictureA"] }
								/>
							</div>
							 <div className="col">
								<Picture 
									dog={ snapshots[dogPair].val()["pictureB"] }
								/>
							</div>
						</div>
					    <div className="row">
					    	<h4>As part of our anti-trolling efforts, we added a randomized attention check so be sure to remember your answers or you will have to start over</h4>
					    </div>
					    <div className="row"></div>
						<div className="row">
							<div className="col">
								<ul className="list-group">
									<li className="list-group-item"> 	
										<div className="row">
											<div className="col-sm-2">
												<p>Confidence Level</p>
												<h3>
													{ Object.values(snapshots[dogPair].val()["features"])[featureNum]["score"][user_id.toString()] }
												</h3>
											</div>
											<div className="col-sm-8">
												<h3>
													{ Object.values(snapshots[dogPair].val()["features"])[featureNum]["text"] }
												</h3>
												<div className="form-group">
													<label>Not at all</label>
													<input 
														type="range" 
														className="form-range" 
														min="0" 
														max="1" 
														defaultValue="0.5" 
														step="0.05" 
														onChange={(e) => { updateScores(e.target.value) }} 
													/>
													<label>Absolutely Yes</label>
												</div>
											</div>
											<div className="col">
												<button 
													className="btn btn-primary" 
													hidden={ Object.keys(Object.values(snapshots[dogPair].val()["features"])[featureNum]["score"]).indexOf(user_id.toString()) < 0 || featureNum >= Object.values(snapshots[dogPair].val()["features"]).length - 1}
													onClick={() => nextFeature() }
												>
													Next Feature
												</button>
												<button 
													className="btn btn-primary" 
													hidden={featureNum < Object.values(snapshots[dogPair].val()["features"]).length - 1}
													onClick={() => nextPair() }
												>
													Next Stage
												</button>
											</div>
											<div className="col"></div>
										</div>
									</li>
								</ul>	
							</div>
						</div>
					</div>
				)
			}
		} else {
			return (
			  	<div className="container">
				    <h1>Flock</h1>
				    <div className="row">
				     	<div className="col">
							<Picture
								dog={ snapshots[dogPair].val()["pictureA"] }
							/>
						</div>
						 <div className="col">
							<Picture 
								dog={ snapshots[dogPair].val()["pictureB"] }
							/>
						</div>
					</div>
				    <div className="row">
						<button className="btn btn-primary" onClick={() => nextPair() }>
							Next Pair
						</button>
				    </div>
				    <div className="row">
				    	<h4>Rank these features in terms of importance in distinguishing the difference by upvoting and downvoting them</h4>
				    </div>
				    <div className="row"></div>
					<div className="row">
						<div className="col">
							<ul className="list-group">
								{
									//sorting by weight (upvotes/downvotes)
									Object.values(snapshots[dogPair].val()["features"]).sort((a, b) => {
			  							return b.weight[user_id] - a.weight[user_id]
			  						}).map((feature) => {
			  							let feature_key = Object.keys(snapshots[dogPair].val()["features"]).filter(key => snapshots[dogPair].val()["features"][key]["text"] == feature["text"])[0]
										return <li className="list-group-item"> 	
											<div className="row">
												<div className="col-sm-2">
													<p>Importance</p>
													<h3>{ feature.weight[user_id] ? feature.weight[user_id] : 0}</h3>
												</div>
												<div className="col-sm-8">
													<h3>
														{ feature["text"] }
													</h3>
													<div className="row">
														<button onClick={() => { updateRank(feature_key, 1); }}>
															<ArrowUpCircle width="35" height="35"/>
														</button>
														<button onClick={() => { updateRank(feature_key, -1) }}>
															<ArrowDownCircle width="35" height="35"/>
														</button>
													</div>
												</div>
												<div className="col"></div>
												<div className="col"></div>
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
	} else {
		return(
			<div className="spinner-border" role="status">
				<span className="sr-only">Loading...</span>
			</div>
		)
	}
}

export default Evaluation;