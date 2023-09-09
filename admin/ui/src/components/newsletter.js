import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

const Newsletter = () => {
	// Get the site admin email using the core data API
	const { email } = useSelect(
		( select ) => select( 'core' ).getEntityRecord( 'root', 'site' ) ?? {},
		[]
	);
	// Set the initial states
	const [ subscribedEmail, setSubscribedEmail ] = useState( '' );
	const [ subscribed, setSubscribed ] = useState( false );
	const [ loading, setLoading ] = useState( false );

	// Update the subscribed email state when the email changes
	useEffect( () => {
		setSubscribedEmail( email );
	}, [ email ] );

	// Handle the subscribe form
	const handleSubscribeForm = async ( e ) => {
		e.preventDefault();
		setLoading( true );
		const apiUrl = 'https://track.wpjwt.com/api/subscribe';
		const response = await fetch( apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( {
				email: subscribedEmail,
			} ),
		} );

		// If the response is ok, set the subscribed state to true
		if ( response.ok ) {
			setSubscribed( true );
		}

		// Set the loading state to false after the request is done
		setLoading( false );
	};

	return (
		<div className="jwt-auth-newsletter-holder">
			<h3>{ __( `Newsletter`, 'jwt-auth' ) }</h3>
			<p>
				{ __(
					`Sign up for our newsletter to get the latest news and updates!`,
					'jwt-auth'
				) }
			</p>
			<form
				onSubmit={ handleSubscribeForm }
				className="jwt-auth-newsletter-form"
			>
				<input
					type="email"
					required
					value={ subscribedEmail }
					onChange={ ( e ) => {
						setSubscribedEmail( e.target.value );
					} }
				/>
				<button
					className={ `jwt-auth-cta-button` }
					type="submit"
					disabled={ loading }
				>
					{ ! loading
						? __( `Sign up`, 'jwt-auth' )
						: __( `Signing up...`, 'jwt-auth' ) }
				</button>
				{ subscribed }
				{ subscribed && (
					<span className={ `jwt-auth-thank-you` }>
						{ __( `Thank you for subscribing`, 'jwt-auth' ) } 🤘
					</span>
				) }
			</form>
		</div>
	);
};

export default Newsletter;
