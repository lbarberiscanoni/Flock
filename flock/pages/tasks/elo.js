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
	const [dogPair, changePair] = useState([0, 1])
	const [stage, switchStage] = useState(0)
	const [featureNum, changeFeature] = useState(0)


	const [snapshots, loading, error] = useList(firebase.database().ref('/'));

	const [user_id, changeUser] = useState(Math.random().toString().split(".")[1])


	const elo = (playerScore, opponentScore, winStatus) => {
		//https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details

		const k_factor = 15

		const spread = opponentScore - playerScore
		const normalized_spread = spread / 400
		const expectation = 1 / (1 + (10 ** normalized_spread))
		const adjusted_score = playerScore + (k_factor * (winStatus - expectation))

		return adjusted_score
	}

	const newPair = () => {
		let numOfItems = snapshots[0].val().length 

		let firstItem = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0
		let secondItem = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0

		if (firstItem === secondItem) {
			secondItem = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0
		}

		return [firstItem, secondItem]
	}

	const updateMatchup = (winnerRef) => {
		const loserRef = 1 - winnerRef
		const winner_key = dogPair[winnerRef]
		const loser_key = dogPair[loserRef]
		const currentScore_winner = snapshots[0].val()[winner_key]["features"][featureNum]["score"]
		const currentScore_loser = snapshots[0].val()[loser_key]["features"][featureNum]["score"]
		const updatedScore_winner = elo(currentScore_winner, currentScore_loser, 1)
		const updatedScore_loser = elo(currentScore_loser, currentScore_winner, 0)

		console.log("winner", updatedScore_winner)
		console.log("loser", updatedScore_loser)

		let update = {}
		update["score"] = updatedScore_winner
		update["weight"] = snapshots[0].val()[winner_key]["features"][featureNum]["weight"] + 1
		firebase.database()
			.ref('/breeds/')
			.child(winner_key)
			.child("features")
			.child(featureNum)
			.update(update)

		update["score"] = updatedScore_loser
		update["weight"] = snapshots[0].val()[loser_key]["features"][featureNum]["weight"] + 1
		firebase.database()
			.ref('/breeds/')
			.child(loser_key)
			.child("features")
			.child(featureNum)
			.update(update)

		changePair(newPair())
	}

	if(snapshots.length > 1) {
		let breeds = snapshots[0].val()
		let features = snapshots[1].val()
		return(
			<div className="container">
				<h1>Flock</h1>
				<div className="row">
					<h2>{ features[featureNum].text }</h2>
				</div>
			    <div className="row">
			     	<div className="col">
						<Picture
							dog={ breeds[dogPair[0]]["picture"] }
							name={ breeds[dogPair[0]]["name"] }
						/>
						<button
							className="btn btn-primary"
							onClick={() => updateMatchup(0)}
						>
							Winner
						</button>
					</div>
					 <div className="col">
						<Picture 
							dog={ breeds[dogPair[1]]["picture"] }
							name={ breeds[dogPair[1]]["name"] }
						/>
						<button
							className="btn btn-primary"
							onClick={() => updateMatchup(1)}
						>
							Winner
						</button>
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