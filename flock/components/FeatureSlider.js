import { useState, useEffect } from "react";
import { ArrowUpCircle, ArrowDownCircle } from 'react-bootstrap-icons';

const FeatureSlider = (props) => {

	return (
		<li>
			<div className="form-check form-switch">
				<input 
					className="form-check-input" 
					type="checkbox" 
					id="flexSwitchCheckDefault" 
					checked={ props.status }
					value={ props.index }
					onChange={ props.updateFeature }
				/>
				<label 
					className="form-check-label" 
					for="flexSwitchCheckDefault"
				>
					{ props.text }
				</label>
			</div>
		</li>
	)
}

export default FeatureSlider;