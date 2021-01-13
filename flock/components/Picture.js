import { useState, useEffect } from "react";

const Picture = (props) => {
	return (
		<img src={process.env.PUBLIC_URL + '/person1.png'} className="rounded float-start" />
	)
}

export default Picture