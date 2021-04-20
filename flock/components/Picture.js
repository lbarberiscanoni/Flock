import { useState, useEffect } from "react";

const Picture = (props) => {
	return (
		<>
			<img 
				src={"../dogs/" + props.dog} 
				className="rounded float-start w-80 h-80" 
			/>
			<p>{ props.name }</p>
		</>
	)
}

export default Picture