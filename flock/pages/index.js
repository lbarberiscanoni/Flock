import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { ArrowUpCircle, ArrowDownCircle } from 'react-bootstrap-icons';
import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';


import Question from "../components/Question";
import Picture from "../components/Picture";

const dogNames = ["American_Eskimo_Dog", "Bloodhound", "Doberman_Pinscher", "Weimaraner"]

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
  const [questions, addQuestion] = useState([])
  const [dogPair, newPair] = useState([0, 1])
  const [stage, changeStage] = useState("")

  const [snapshots, loading, error] = useList(firebase.database().ref('/'));

  const combinedChange = () => {
  	firebase.database().ref("/").child("test2").child("features").push(question)
  	setQuestion({"text": "", "votes": 0, "decision": null})
  }

  const handleChange = (e) => {
  	setQuestion({
  		"text": e.target.value,
  		"score": {0:0},
  		"weight": 1
  	})
  }

  const handleSubmit = (e) => {
  	e.preventDefault()
  	combinedChange()
  }

  const changePics = () => {
  	if (dogPair[1] < dogNames.length - 1) {
  		newPair([dogPair[1], dogPair[1] + 1])
  	} else {
  		newPair([dogPair[1], 0])
  	}
  	addQuestion([])
  }

  const updateVotes = (id, num) => {
  	firebase.database().ref("/").child("test2").child("features").child(id).once("value").then((snapshot) => {
  		let current_val = snapshot.val()["weight"]
  		let new_val = current_val + num
  		firebase.database().ref("/").child("test2").child("features").child(id).update({"weight": new_val})
  	})
  }

  useEffect(() => {
  	console.log("snapshots", snapshots)
  	if (snapshots.length > 0) {
  		console.log(snapshots[0].val())
  	}
  })

  return (
  	<div className="container">
	    <h1>Flock</h1>
	    <div className="row">
	     	<div className="col">
				<Picture
					dog={ dogNames[dogPair[0]] }
				/>
			</div>
			 <div className="col">
				<Picture 
					dog={ dogNames[dogPair[1]] }
				/>
			</div>
		</div>
	    <div className="row">
		    <form 
		    	className="row"
				onSubmit={handleSubmit}
			>
				<div className="col-auto">
					<textarea 
						placeholder="Question" 
						value={question.text}
						onChange={handleChange}
						className="form-control"
					/>
				</div>
				<div className="col-auto">
					<button className="btn btn-primary">
						Submit
					</button>
				</div>
			</form>
			<button className="btn btn-primary" hidden={ !questions.length} onClick={() => changePics() }>
				Next
			</button>
	    </div>
	    <div className="row"></div>
	    <div className="row"></div>
	    <div className="row"></div>
		<div className="row">
			<div className="col">
				<ul className="list-group">
					{snapshots.length > 0 &&
						//sorting by weight (upvotes/downvotes)
						Object.values(snapshots[0].val()["features"]).sort((a, b) => {
  							return b.weight - a.weight
  						}).map((feature) => {
  							let feature_key = Object.keys(snapshots[0].val()["features"]).filter(key => snapshots[0].val()["features"][key]["text"] == feature["text"])[0]
							return <li className="list-group-item"> 	
								<div className="row">
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
										<h3>
											<span className="badge bg-secondary"> { feature["weight"] } </span>
											{ feature["text"] }
										</h3>
										<p>
											<input type="range" className="form-range" min="0" max="1" step="0.05" />
										</p>
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

export default Home;