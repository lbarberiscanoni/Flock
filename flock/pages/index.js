import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { ArrowUpCircle, ArrowDownCircle } from 'react-bootstrap-icons';


import Question from "../components/Question";
import Picture from "../components/Picture";

const Home = () => {
  
  const [question, setQuestion] = useState({})
  const [questions, addQuestion] = useState([])
  const [picNum, nextNum] = useState(1)

  const combinedChange = () => {
  	addQuestion([...questions, question])
  	setQuestion({"text": "", "votes": 0})
  }

  const handleChange = (e) => {
  	setQuestion({
  		"text": e.target.value,
  		"votes": Math.floor(Math.random() * 10)
  	})
  }

  const handleSubmit = (e) => {
  	e.preventDefault()
  	combinedChange()
  }

  const changePics = () => {
  	console.log(picNum)
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
			<button className="btn btn-primary" onClick={() => changePics() }>
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
											<button className="btn btn-outline-primary">
												Yes
											</button>
											<button className="btn btn-outline-secondary">
												No
											</button>
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
			<div className="col">
				<Picture path={"hello"}/>
			</div>
		</div>
	</div>
  )
}

export default Home;