import { useState, useEffect } from "react";

import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';

import 'bootstrap/dist/css/bootstrap.css';
import { ArrowUpCircle, ArrowDownCircle } from 'react-bootstrap-icons';
import { ProgressBar } from 'react-bootstrap';

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

	const handleChange = (e) => {
		setQuestion({
			"text": e.target.value,
			"score": {0:0},
			"weight": {0:0}
		})
	}

	const changePics = () => {
		newPair(dogPair + 1)
		changeFeature(0)
		setQuestion({"text": "", "weight": {0:0}, "score": {0:0}})
	}

	const updateScores = (score) => {

		let updates = {}
		updates["score/" + user_id] = score
		firebase.database()
			.ref("/")
			.child("breeds")
			.child(dogPair)
			.child("features")
			.child(featureNum)
			.update(updates)
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
		let features = Object.values(snapshots[1].val())
		if (featureNum < (features.length - 1)) {
			changeFeature(featureNum + 1)
		} else {
			changeFeature(0)
		}
	}

	if(snapshots.length > 1) {
		let features = Object.values(snapshots[1].val())
		let dogs = Object.values(snapshots[0].val())
	  	return (
		  	<div className="container">
			    <h1>Flock</h1>
			    <div className="row">
			     	<div className="col">
						<Picture
							dog={ dogs[dogPair]["picture"] }
						/>
					</div>
				</div>
			    <h5>{"Dog Pair " + (dogPair + 1).toString() + " / " + dogs.length.toString()}</h5>
			    <ProgressBar 
			    	animated 
			    	variant="success" 
			    	now={(dogPair + 1) / (dogs.length) * 100 } 
			    	label={Math.round((dogPair + 1) / (dogs.length) * 100) + "%"}
			    />
			    <h5>{"Feature " + featureNum.toString() + " / " + features.length.toString()}</h5>
			    <ProgressBar 
			    	animated 
			    	now={(featureNum / features.length) * 100} 
			    	label={Math.round((featureNum / features.length) * 100) + "%"} 
			    />
			    <div className="row"></div>
			    <div className="row">
					<div className="col">
						<ul className="list-group">
							<li className="list-group-item"> 	
								<div className="row">
									<div className="col-sm-2">
										<p>Confidence Level</p>
										<h3>
											{ dogs[dogPair]["features"][featureNum]["score"][user_id.toString()] }
										</h3>
									</div>
									<div className="col-sm-8">
										<h3>
											{ features[featureNum]["text"] }
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
											hidden={ Object.keys(dogs[dogPair]["features"][featureNum]["score"]).indexOf(user_id.toString()) < 0 || featureNum >= (features.length - 1) }
											onClick={() => nextFeature() }
										>
											Next Feature
										</button>
										<button 
											className="btn btn-primary" 
											hidden={featureNum < features.length - 1}
											onClick={() => nextPair() }
										>
											Next Stage
										</button>
										<a 
											hidden={ stage < 1}
											href="/tasks/conclusion"
										>
											<button className="btn btn-primary">
												Done
											</button>
										</a>
									</div>
								</div>
							</li>
						</ul>	
					</div>
				</div>
			</div>
		)
	} else {
		return(
			<div className="spinner-border" role="status">
				<span className="sr-only">Loading...</span>
			</div>
		)
	}
}

export default Evaluation;