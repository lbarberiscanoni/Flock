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

	const [user_id, changeUser] = useState("default")

	const [attentionCheckStatus, updateAttentionCheck] = useState(false)

	const minLoops = 80


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

		let currentScore_winner = Object.values(snapshots[0].val()[winner]["features"][featureNum]["score"]).pop()
		console.log(currentScore_winner)
		let dogs_with_higher_score = Object.keys(snapshots[0].val()).filter(
					key => Object.values(snapshots[0].val()[key]["features"][featureNum]["score"]).pop() >= currentScore_winner
				)

		dogs_with_higher_score.splice(dogs_with_higher_score.indexOf(winner), 1)

		let prior_matchups = []
		for (let i = 0; i < Object.keys(snapshots[2].val()).length; i++) {
			let matchup = Object.values(snapshots[2].val())[i]
			if (matchup["feature"] === featureNum) {
				if (matchup["winner"] === winner) {
					prior_matchups.push(matchup["loser"])
				} else if (matchup["loser"] == winner) {
					prior_matchups.push(matchup["winner"])
				}
			}
		}

		let dogs_with_higher_score_without_prior_matchups = dogs_with_higher_score.filter(
			dogNum => prior_matchups.indexOf(dogNum) < 0
			)

		let newOpponent = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0
		let incumbent = winner

		if (dogs_with_higher_score > 0) {
			if (dogs_with_higher_score_without_prior_matchups.length > 0) {
				newOpponent = dogs_with_higher_score_without_prior_matchups[Math.floor(Math.random() * dogs_with_higher_score_without_prior_matchups.length)]

				if (newOpponent === winner) {
					newOpponent = dogs_with_higher_score_without_prior_matchups[Math.floor(Math.random() * dogs_with_higher_score_without_prior_matchups.length)]
				}

				if (newOpponent === loser) {
					newOpponent = dogs_with_higher_score_without_prior_matchups[Math.floor(Math.random() * dogs_with_higher_score_without_prior_matchups.length)]
				}
			} else {
				if (newOpponent === winner) {
					newOpponent = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0
				}

				if (newOpponent === loser) {
					newOpponent = Math.floor(Math.random() * (numOfItems - 0 + 1) ) + 0
				}
			}
		}

		return [incumbent, newOpponent]
	}

	const updateMatchup = (winnerRef) => {
		const loserRef = 1 - winnerRef
		const winner_key = itemPair[winnerRef]
		const loser_key = itemPair[loserRef]

		let currentScore_winner = 1500
		try {
			currentScore_winner = Object.values(snapshots[0].val()[winner_key]["features"][featureNum]["score"]).pop()
		} catch(error) {
			console.log("error", error)
		}

		let currentScore_loser = 1500
		try {
			currentScore_loser = Object.values(snapshots[0].val()[loser_key]["features"][featureNum]["score"]).pop()
		} catch(error) {
			console.log("error", error)
		}

		const updatedScore_winner = elo(currentScore_winner, currentScore_loser, 1)
		const updatedScore_loser = elo(currentScore_loser, currentScore_winner, 0)

		// console.log("winner", currentScore_winner, updatedScore_winner)
		// console.log("loser", currentScore_loser, updatedScore_loser)

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
		history["feature"] = featureNum
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
				let prior_feature = snapshots[2].val()[prior_attempt_to_check]["feature"]
				changePair(switched_pair)
				changeFeature(prior_feature)
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
			for (let i = 0; i < Object.keys(snapshots[1].val()).length; i++) {
				let prior_scores = Object.keys(snapshots[0].val()).filter(
					key => Object.keys(snapshots[0].val()[key]["features"][i]["score"]).indexOf(user_id) > -1
				)
				prior_scores.map((key) => {
					firebase.database()
						.ref('/breeds/')
						.child(key)
						.child('features')
						.child(i)
						.child("score")
						.child(user_id)
						.remove()
				})
			}
			
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
			changeFeature(0)
			changeLoop(1)
		}
	}

	if(snapshots.length > 1) {
		if (loop < minLoops) {
			let breeds = snapshots[0].val()
			let features = snapshots[1].val()
			return(
				<div className="container">
					<h1>Flock</h1>
					<h4>You have get to the end to get the confirmation code that gets you paid!</h4>
					<h4>We implemented an anti-troll attention check so you need to remember your answers or you'll have to start over each time!</h4>
					<ProgressBar 
						variant="success"
				    	animated 
				    	now={(loop / minLoops) * 100} 
				    	label={"breeds " + Math.round((loop / minLoops) * 100) + "%"} 
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
				<div className="container">
					<div className="row">
						<h1 className="text-center">You are done!</h1>
						<h1 className="text-center">Thank you for participating</h1>
					</div>
					<br />
					<br />
					<div className="row">
						<h2>Enter this confirmation code to get paid: { user_id }</h2>
					</div>
					<br />
					<br />
					<div className="row">
						<h3>BY THE WAY: We are recruiting for a similar experiment to what you just did but where we pay 2-3 times what we paid you here in order to have multiple people work on this simultaneously </h3>
						<h3>
							If you are interested,  
							<a href="mailto:hllbck7@gmail.com">
								email us 
							</a>
							and we will send you a scheduling form so you can sign up. Please don't spam us lol
						</h3>
						<h3>If you are not interested then that's ok too XD</h3>
					</div>
				</div>
			)
		}
	} else {
		if (snapshots.length > 0) {
			firebase.database()
				.ref('/users/')
				.push(Math.random().toString().split(".")[1])
				.then((snapshot) => {
					changeUser(snapshot.key)
				})			
		}
		return(
			<div className="spinner-border" role="status">
				<span className="sr-only">Loading...</span>
			</div>
		)
	}
}

export default Elo;