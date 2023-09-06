import { useEntityProp } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { FormToggle } from '@wordpress/components';

const MainView = () => {
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
		<div className={ `jwt-auth-options` }>
			<div className={ `jwt-auth-box` }>
				<div>
					<div>
						<h2>
							Help Me Improve JWT Authentication for WP REST API!
						</h2>
						<p>
							Hello there! I'm always working to make the JWT
							Authentication for WP REST API plugin better for
							you. To do this, I'd like to understand the
							environment where the plugin is being used. Would
							you be willing to share the following information
							with me?
						</p>
						<ul>
							<li>
								<strong>- PHP Version:</strong> This helps me
								ensure compatibility and decide when it's time
								to phase out older versions.
							</li>
							<li>
								<strong>- WordPress Version:</strong> Knowing
								this helps me optimize the plugin for the most
								common WordPress setups.
							</li>
						</ul>
						<p>I promise that:</p>
						<ol>
							<li>I'll only collect the above information.</li>
							<li>
								Your data will remain confidential and won't be
								shared with third parties.
							</li>
							<li>
								This will in no way affect your website's
								performance.
							</li>
						</ol>
						<p>
							By sharing this information, you're helping me make
							JWT Authentication for WP REST API even better for
							everyone.
						</p>
						<p>Thank you for your trust and support!</p>
						<p>Enrique Chavez</p>
						<hr />
						{ settings && (
							<div className={ `jwt-auth-toggle-holder` }>
								<div className={ `jwt-auth-toggle-control` }>
									<span>
										{ settings.share_data
											? 'You are currently sharing data.'
											: 'You are not currently sharing data.' }
									</span>
									<FormToggle
										checked={ settings.share_data }
										onChange={ () => saveSettings() }
									/>
								</div>
								<span className={ `jwt-auth-text-small` }>
									Click the toggle button to change your
									preferences.
								</span>
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default MainView;
