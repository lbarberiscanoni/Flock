import { useState, useEffect } from "react";

import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';

import 'bootstrap/dist/css/bootstrap.css';

import Picture from "../../components/Picture";

import keyword_extractor from "keyword-extractor";

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
	const [attempts, setAttempts] = useState(0)
	const [pairNum, changePairNum] = useState(0)

	const [snapshots, loading, error] = useList(firebase.database().ref('/'));

	const [user_id, changeUser] = useState(Math.random().toString().split(".")[1])

	const handleChange = (e) => {
		setSuggestion({
			"text": e.target.value,
			"user": user_id
		})
	}

	const handleSubmit = (e) => {
		e.preventDefault()

		if (suggestion.text.split(" ").join("").length < 20) {
			alert("your response is too short so it triggered our anti-trolling system")
			setSuggestion({
				"text": "",
				"user": user_id
			})
		} else {

			firebase.database().ref("/").child("suggestions").get().then((snapshot) => {
				let prior_answers_raw = Object.values(snapshot.val())
				let kw_prior_answers = []
				prior_answers_raw.map((answer) => {
					let kw_prior_answer = keyword_extractor.extract(answer.text, {
						language:"english",
						remove_digits: true,
						return_changed_case:true,
						remove_duplicates: false
					});

					kw_prior_answers.push(kw_prior_answer)
				})

				let kw_suggestion = keyword_extractor.extract(suggestion.text, {
					language:"english",
					remove_digits: true,
					return_changed_case:true,
					remove_duplicates: false
				});

				let n = 0
				//having to do this bc somehow setSuggestion({"text": ""}) doesn't work within this loop
				let duplicateCheck = false
				while (n < kw_prior_answers.length - 1) {
					let duplicateNum = 0
					kw_suggestion.forEach((kw) => {
						if (kw_prior_answers[n].includes(kw)) {
							duplicateNum += 1
						}
					})

					let duplicate_perc = (duplicateNum / kw_suggestion.length) * 100

					if (duplicate_perc >= 50) {
						alert("someone already submitted a similar answer \n\n try something else \n\n also check prior answers")
						duplicateCheck = true
						n = kw_prior_answers.length
					} else {
						n++
					}
				}

				if (!duplicateCheck) {
					addSuggestions(state => [suggestion, ...state])
					firebase.database().ref("/").child("suggestions").push(suggestion)
					changePairNum(Math.floor(Math.random() * (snapshots.length - 1)))
				} else {
					if (attempts < 4) {
						setAttempts(attempts + 1)
					} else {
						addSuggestions(state => [suggestion, ...state])
						setAttempts(0)
						changePairNum(Math.floor(Math.random() * (snapshots.length - 1)))
					}
				}

				setSuggestion({
					"text": "",
					"user": user_id
				})
			})
		}
	}

	const getPriorAnswers = () => {
		let components = []
		Object.values(snapshots[6].val()).map((snapshot) => {
			components.push(<p>{ snapshot.text }</p>)
		})

		return components
	}

	return (
		<div className="container">
			<h1>Suggestions</h1>
			<div className="row">
		     	<div className="col">
					<Picture
						dog={ snapshots.length > 0 ? snapshots[pairNum].val()["pictureA"] : "" }
					/>
				</div>
				 <div className="col">
					<Picture 
						dog={ snapshots.length > 0 ? snapshots[pairNum].val()["pictureB"] : "" }
					/>
				</div>
			</div>
			<div className="row">
				<p>Please briefly describe the differences between these two dogs</p>
				<p>Use single sentences that focus on features without getting too specific</p>
				<p>For example "their ears are of different colors" is GOOD, but "the first dog's ears are brown and the other's are black" is BAD</p>
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
					<div className="row">
						<h4>You have given { suggestions.length } answers out of a minimum of 5</h4>
						<a href="/tasks/conclusion">
							<button hidden={ suggestions.length < 5 } className="btn btn-primary">
								Done
							</button>
						</a>
					</div>
					<div className="row">
						<ul className="list-group">
							{ suggestions.length > 0 &&
								suggestions.map((x) => {
									return <li>{ x.text }</li>
								})
							}
						</ul>	
					</div>
					<div className="row">
						<div className="col-8">
							{ snapshots.length > 0 &&
								<h4> { snapshots[6] ? getPriorAnswers().length : 0 } Prior Answers </h4>
							}
				    	</div>
				    	<div className="col-8">
					    	<div className="overflow-scroll" style={{ "max-height": "200px"}}>
					    		{ snapshots.length > 0 &&
									<ul className="list-group">
										{ snapshots[6] ? getPriorAnswers() : "" }
									</ul>
								}
					    	</div>
					    </div>
		    		</div>
				</div>
		    </div>
		</div>
	)
}

export default Suggestions;