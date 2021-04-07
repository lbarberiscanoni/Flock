import { useState, useEffect } from "react";

const Picture = (props) => {
	return (
		<img 
			src={"../dogs/" + props.dog + ".jpg"} 
			className="rounded float-start w-80 h-80" 
		/>
	)
}

export default Picture