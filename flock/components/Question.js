import { useState, useEffect } from "react";
import { ArrowUpCircle, ArrowDownCircle } from 'react-bootstrap-icons';

const Question = (props) => {

	return (
		<div>
			<li className="list-group-item"> 	
				<div className="row">
					<div className="col">
						<div className="row">
							<button onClick={() => updateVotes(1)}>
								<ArrowUpCircle width="35" height="35"/>
							</button>
						</div>
						<div className="row">
							<button onClick={() => updateVotes(-1)}>
								<ArrowDownCircle width="35" height="35"/>
							</button>
						</div>
					</div>
					<div className="col">
						<h3>
							<span className="badge bg-secondary"> { votes } </span>
							{ props.name }
							
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
	)
}

export default Question;