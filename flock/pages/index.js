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
  	addQuestion([...questions, question])
  	setQuestion({"text": "", "votes": 0, "decision": null})
  }

  const handleChange = (e) => {
  	setQuestion({
  		"text": e.target.value,
  		"votes": 0,
  		"decision": null
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
  	let updatedQuestions = []
  	questions.map((q) => {
  		if (q.text == id) {
  			q.votes = num
  		} 
  		updatedQuestions.push(q)
  	})
  	addQuestion(updatedQuestions)
  }

  useEffect(() => {
  })

  return (
  	<div className="container">
	    <h1>Flock</h1>
	    <p>
	    	{ snapshots.map((x) => {
	    		return x.key
	    	})}
	    </p>
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
					{ questions.sort((a, b) => {
						//sorting by value
  						return b.votes - a.votes
  					}).map((x) => {
						return <div>
							<li className="list-group-item"> 	
								<div className="row">
									<div className="col">
										<div className="row">
											<button onClick={() => updateVotes(x.text, x.votes + 1)}>
												<ArrowUpCircle width="35" height="35"/>
											</button>
										</div>
										<div className="row">
											<button onClick={() => updateVotes(x.text, x.votes -1)}>
												<ArrowDownCircle width="35" height="35"/>
											</button>
										</div>
									</div>
									<div className="col">
										<h3>
											<span className="badge bg-secondary"> { x.votes } </span>
											{ x.text }
											
										</h3>
										<p>
											<input type="range" className="form-range" min="0" max="1" step="0.05" />
										</p>
									</div>
									<div className="col"></div>
									<div className="col"></div>
								</div>
							</li>
						</div>
					})}
				</ul>
			</div>
		</div>
	</div>
  )
}

export default Home;