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


const Home = () => {
  
	const [question, setQuestion] = useState({})
	const [dogPair, newPair] = useState(0)
	const [stage, switchStage] = useState(0)


	const [snapshots, loading, error] = useList(firebase.database().ref('/'));

	const [user_id, changeUser] = useState(Math.random().toString().split(".")[1])

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

	const updateScores = (feature_id, user_id, score) => {
		let updates = {}
		updates["score/" + user_id] = score
		firebase.database().ref("/").child("pair_" + dogPair.toString()).child("features").child(feature_id).update(updates)
	}

	const next = () => {
		if (stage < 1) {
			switchStage(1)
		} else if (stage == 1) {
			switchStage(0)
			changePics()
		}
	}

	if(stage < 1) {
	  return (
	  	<div className="container">
		    <h1>Flock</h1>
		    <div className="row">
		     	<div className="col">
					<Picture
						dog={ snapshots.length > 0 ? snapshots[dogPair].val()["pictureA"] : "" }
					/>
				</div>
				 <div className="col">
					<Picture 
						dog={ snapshots.length > 0 ? snapshots[dogPair].val()["pictureB"] : "" }
					/>
				</div>
			</div>
		    <div className="row">
				<button className="btn btn-primary" onClick={() => next() }>
					Next
				</button>
		    </div>
		    <div className="row"></div>
		    <div className="row"></div>
			<div className="row">
				<div className="col">
					<ul className="list-group">
						{snapshots.length > 0 &&
							//^^waiting for loading

							//sorting by weight (upvotes/downvotes)
							Object.values(snapshots[dogPair].val()["features"]).sort((a, b) => {
	  							return b.weight - a.weight
	  						}).map((feature) => {
	  							let feature_key = Object.keys(snapshots[dogPair].val()["features"]).filter(key => snapshots[dogPair].val()["features"][key]["text"] == feature["text"])[0]
								return <li className="list-group-item"> 	
									<div className="row">
										<div className="col-sm-2">
											<p>Confidence Level</p>
											<h3>
												{ feature["score"][user_id.toString()] }
											</h3>
										</div>
										<div className="col-sm-8">
											<h3>
												{ feature["text"] }
											</h3>
											<div className="form-group">
												<label>No</label>
												<input type="range" className="form-range" min="0" max="1" step="0.05" onChange={(e) => { updateScores(feature_key, user_id, e.target.value) }} />
												<label>Yes</label>
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
	} else {
		return (
		  	<div className="container">
			    <h1>Flock</h1>
			    <div className="row">
			     	<div className="col">
						<Picture
							dog={ snapshots.length > 0 ? snapshots[dogPair].val()["pictureA"] : "" }
						/>
					</div>
					 <div className="col">
						<Picture 
							dog={ snapshots.length > 0 ? snapshots[dogPair].val()["pictureB"] : "" }
						/>
					</div>
				</div>
			    <div className="row">
					<button className="btn btn-primary" onClick={() => next() }>
						Next
					</button>
			    </div>
			    <div className="row"></div>
			    <div className="row"></div>
				<div className="row">
					<div className="col">
						<ul className="list-group">
							{snapshots.length > 0 &&
								//^^waiting for loading

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
}

export default Home;