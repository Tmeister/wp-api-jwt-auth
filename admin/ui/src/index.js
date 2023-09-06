import './index.scss';
import { createRoot, render } from '@wordpress/element';

const domElement = document.getElementById( 'jwt-auth-holder' );
// Internal dependencies
import SettingsScreen from './components/settings-screen';

// Mounts the main component to the DOM.
if ( createRoot ) {
	createRoot( domElement ).render( <SettingsScreen /> );
} else {
	render( <SettingsScreen />, domElement );
}
