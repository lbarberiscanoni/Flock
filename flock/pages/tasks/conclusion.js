import { useState, useEffect } from "react";

import firebase from 'firebase';
import { useList } from 'react-firebase-hooks/database';

import 'bootstrap/dist/css/bootstrap.css';

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


const Conclusion = () => {

	const [snapshots, loading, error] = useList(firebase.database().ref('/'));

	const handleChange = (e) => {
		setSuggestion({
			"text": e.target.value,
		})
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		firebase.database().ref("/").child("suggestions").push(suggestion)
		addSuggestions(state => [suggestion, ...state])
		setSuggestion({"text": ""})

	}

	return (
		<div className="container">
			<h1 className="text-center">You are done!</h1>
			<h1 className="text-center">Thank you for participating</h1>
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
	)
}

export default Conclusion;