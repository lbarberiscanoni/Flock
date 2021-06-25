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


const Elo = () => {
  
	const [question, setQuestion] = useState({})
	const [itemPair, changePair] = useState([0, 1])
	const [stage, switchStage] = useState(0)
	const [featureNum, changeFeature] = useState(0)
	const [loop, changeLoop] = useState(1)


	const [snapshots, loading, error] = useList(firebase.database().ref('/'));

	const [user_id, changeUser] = useState(Math.random().toString().split(".")[1])

	const [attentionCheckStatus, updateAttentionCheck] = useState(false)


	const elo = (playerScore, opponentScore, winStatus) => {
		//https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details

		const k_factor = 15

		const spread = opponentScore - playerScore
		const normalized_spread = spread / 400
		const expectation = 1 / (1 + (10 ** normalized_spread))
		const adjusted_score = playerScore + (k_factor * (winStatus - expectation))

		return adjusted_score
	}

	const newPair = (winner, loser) => {
		let numOfItems = snapshots[0].val().length - 1

		let newOpponent = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0

		if (newOpponent === winner) {
			newOpponent = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0
		}

		if (newOpponent === loser) {
			newOpponent = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0
		}

		return [winner, newOpponent]
	}

	const updateMatchup = (winnerRef) => {
		const loserRef = 1 - winnerRef
		const winner_key = itemPair[winnerRef]
		const loser_key = itemPair[loserRef]

		const currentScore_winner = 1500
		try {
			const currentScore_winner = Object.values(snapshots[0].val()[winner_key]["features"][featureNum]["score"]).pop()
		} catch(error) {
			console.log(error)
		}

		const currentScore_loser = 1500
		try {
			const currentScore_loser = Object.values(snapshots[0].val()[loser_key]["features"][featureNum]["score"]).pop()
		} catch(error) {
			console.log(error)
		}

		const updatedScore_winner = elo(currentScore_winner, currentScore_loser, 1)
		const updatedScore_loser = elo(currentScore_loser, currentScore_winner, 0)

		// console.log("winner", updatedScore_winner)
		// console.log("loser", updatedScore_loser)

		let update = {}
		update["score/" + user_id] = updatedScore_winner
		update["weight"] = snapshots[0].val()[winner_key]["features"][featureNum]["weight"] + 1
		firebase.database()
			.ref('/breeds/')
			.child(winner_key)
			.child("features")
			.child(featureNum)
			.update(update)

		update["score/" + user_id] = updatedScore_loser
		update["weight"] = snapshots[0].val()[loser_key]["features"][featureNum]["weight"] + 1
		firebase.database()
			.ref('/breeds/')
			.child(loser_key)
			.child("features")
			.child(featureNum)
			.update(update)

		let history = {}
		history["user"] = user_id
		history["winner"] = winner_key
		history["loser"] = loser_key
		firebase.database()
			.ref('/history')
			.push(history)


		//make this conditional on a p(.3)
		//if the p happens, then set attentionCheckStatus to the right key and change the newPair accordingly
		//otherwise 
		if (Math.random() < .2) {
			console.log("checking")
			let prior_attempts = Object.keys(snapshots[2].val()).filter(
					key => snapshots[2].val()[key]["user"] === user_id
				)

			if (prior_attempts.length > 1) {
				let prior_attempt_to_check = prior_attempts[prior_attempts.length * Math.random() | 0]
				updateAttentionCheck(prior_attempt_to_check)
				let switched_pair = [snapshots[2].val()[prior_attempt_to_check]["loser"], snapshots[2].val()[prior_attempt_to_check]["winner"]]
				changePair(switched_pair)
			} else {
				changePair(newPair(winner_key, loser_key))
			}
		} else {
			changePair(newPair(winner_key, loser_key))			
		}

		let numOfFeatures = snapshots[1].val().length
		if (featureNum < numOfFeatures - 1) {
			changeFeature(featureNum + 1)
		} else {
			changeFeature(0)
			changeLoop(loop + 1)
		}
	}

	const attentionCheck = (winnerRef) => {
		const loserRef = 1 - winnerRef
		const winner_key = itemPair[winnerRef]
		const loser_key = itemPair[loserRef]

		let prior_attempt = snapshots[2].val()[attentionCheckStatus]

		if (prior_attempt["winner"] === winner_key) {
			changePair(newPair(winner_key, loser_key))
			updateAttentionCheck(false)
		} else {
			alert("you failed the attention check so now you are starting over")
			let prior_attempts = Object.keys(snapshots[2].val()).filter(
					key => snapshots[2].val()[key]["user"] === user_id
				)
			prior_attempts.map((key) => {
				firebase.database()
					.ref('/history/')
					.child(key)
					.remove()
			})
			changePair(newPair(winner_key, loser_key))
			updateAttentionCheck(false)
		}
	}

	if(snapshots.length > 1) {
		let breeds = snapshots[0].val()
		let features = snapshots[1].val()
		return(
			<div className="container">
				<h1>Flock</h1>
				<ProgressBar 
					variant="success"
			    	animated 
			    	now={(loop / 10) * 100} 
			    	label={"breeds " + Math.round((loop / 10) * 100) + "%"} 
			    />
			    <ProgressBar 
			    	animated 
			    	now={(featureNum / features.length) * 100} 
			    	label={"features " + Math.round((featureNum / features.length) * 100) + "%"} 
			    />
				<div className="row">
					<h2 
						className="text-center"
					>
						{ features[featureNum].text }
					</h2>
					<a href="/tasks/conclusion">
						<button
							className="btn btn-primary"
							hidden={ featureNum < features.length }
						>
							Done
						</button>
					</a>
				</div>
			    <div className="row">
			     	<div className="col">
						<Picture
							dog={ breeds[itemPair[0]]["picture"] }
							name={ "" }
						/>
						{
							attentionCheckStatus ? 
								<button
									className="btn btn-primary"
									onClick={() => attentionCheck(0)}
								>
									Winner
								</button>
							: <button
									className="btn btn-primary"
									onClick={() => updateMatchup(0)}
								>
									Winner
								</button>
						}
					</div>
					 <div className="col">
						<Picture 
							dog={ breeds[itemPair[1]]["picture"] }
							name={ "" }
						/>
						{
							attentionCheckStatus ? 
								<button
									className="btn btn-primary"
									onClick={() => attentionCheck(1)}
								>
									Winner
								</button>
							: <button
									className="btn btn-primary"
									onClick={() => updateMatchup(1)}
								>
									Winner
								</button>
						}
					</div>
				</div>
				<div className="row"></div>
				<div className="row"></div>
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

export default Elo;