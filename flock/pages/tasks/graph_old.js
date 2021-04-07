import { useState, useEffect, useRef } from "react";

import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';

import 'bootstrap/dist/css/bootstrap.css';

import { select } from "d3";

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

const Graph = () => {

	const [snapshots, load, err] = useList(firebase.database().ref('/'));

	const [data, setData] = useState([25, 40, 45])

	const svgRef = useRef()

	useEffect(() => {
		console.log(svgRef)
		const svg = select(svgRef.current)
		svg
			.selectAll("circle")
			.data(data)
			.join(
				enter => 
					enter
						.append("circle")
						.attr("class", "new"),
				update => update.attr("class", "updated"),
				exit => exit.remove()
			)
			.attr("r", value => value)
			.attr("cx", value => value * 2)
			.attr("stroke", "red")
	}, [data])

	return(
		<div className="container">
			<h1>Hello World</h1>
        	<svg ref={svgRef}></svg>
        	<button 
        		className="btn"
        		onClick={() => 
        			setData(data.map(value => value + 5))
        		}
        	>
        		Update data
        	</button>
        	<button 
        		className="btn"
        		onClick={() => 
        			setData(data.filter(value => value < 35))
        		}
        	>
        		Filter data
        	</button>
		</div>
	)
}

export default Graph;