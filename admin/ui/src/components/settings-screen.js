import { useEntityProp } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';

import CTA from './cta';
import MainView from './main-view';

const SettingsScreen = () => {
	// Get the plugin settings
	const [ settings, setSettings ] = useEntityProp(
		'root',
		'site',
		'jwt_auth_options'
	);
	// Get the save edited entity record function
	const { saveEditedEntityRecord } = useDispatch( 'core' );

	// Handle the save settings action
	const saveSettings = () => {
		// Update the settings values
		setSettings( {
			...settings,
			share_data: ! settings.share_data,
		} );

		// Save the settings
		saveEditedEntityRecord( 'root', 'site' );
	};
	return (
		<div className={ `wrap` }>
			<h1 className={ `wp-heading-inline` }>JWT Authentication</h1>
			{ settings && (
				<div className={ `jwt-auth-settings` }>
					<MainView />
					<CTA />
				</div>
			) }
		</div>
	);
};

export default SettingsScreen;
