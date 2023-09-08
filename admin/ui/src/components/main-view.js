import { useEntityProp } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { FormToggle } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

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
							{ __(
								'Help Me improve JWT Authentication for WP REST API!',
								'jwt-auth'
							) }
						</h2>
						<p>
							{ __(
								`Hello there! I'm always working to make the JWT Authentication for WP REST API plugin better for you. To do this, I'd like to understand the environment where the plugin is used. Could you share the following information with me?`,
								'jwt-auth'
							) }
						</p>
						<ul>
							<li>
								<strong>{ __( `- PHP Version:` ) }</strong>
								{ __(
									`This helps me ensure compatibility and decide when it's time to phase out older versions.`,
									'jwt-auth'
								) }
							</li>
							<li>
								<strong>
									{ __( `- WordPress Version:`, 'jwt-auth' ) }{ ' ' }
								</strong>
								{ __(
									`Knowing this helps me optimize the plugin for the most common WordPress setups.`,
									'jwt-auth'
								) }
							</li>
							<li>
								<strong>
									{ __(
										`- WooCommerce Version:`,
										'jwt-auth'
									) }
								</strong>
								{ __(
									`Knowing this helps me to understand if I need to focus more on WooCommerce compatibility.`,
									'jwt-auth'
								) }
							</li>
							<li>
								<strong>
									{ __(
										`- Activated Plugins Count:`,
										'jwt-auth'
									) }
								</strong>
								{ __(
									`This helps to know the complexity of the WP installs.`,
									'jwt-auth'
								) }
							</li>
						</ul>
						<p>{ __( `I promise that:`, 'jwt-auth' ) }</p>
						<ol>
							<li>
								{ __(
									`I'll only collect the above information.`,
									'jwt-auth'
								) }
							</li>
							<li>
								{ __(
									`Your data will remain confidential and won't be shared with third parties.`,
									'jwt-auth'
								) }
							</li>
							<li>
								{ __(
									`No personal or site information is shared.`,
									'jwt-auth'
								) }
							</li>
							<li>
								{ __(
									`This feature will in no way affect your website's performance.`,
									'jwt-auth'
								) }
							</li>
						</ol>
						<p>
							{ __(
								`By sharing this information, you're helping me make JWT Authentication for WP REST API even better for everyone.`,
								'jwt-auth'
							) }{ ' ' }
						</p>
						<p>
							{ __(
								`Thank you for your trust and support!`,
								'jwt-auth'
							) }
						</p>
						<p>Enrique Chavez.</p>
						<hr />
						{ settings && (
							<div className={ `jwt-auth-toggle-holder` }>
								<div className={ `jwt-auth-toggle-control` }>
									<span>
										{ settings.share_data
											? __(
													`You are currently sharing data.`,
													'jwt-auth'
											  )
											: __(
													`You are not currently sharing data.`,
													'jwt-auth'
											  ) }
									</span>
									<FormToggle
										checked={ settings.share_data }
										onChange={ () => saveSettings() }
									/>
								</div>
								<span className={ `jwt-auth-text-small` }>
									{ __(
										`Click the toggle button to change your preferences.`,
										'jwt-auth'
									) }
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
