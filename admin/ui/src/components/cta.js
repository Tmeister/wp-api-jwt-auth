import { __ } from '@wordpress/i18n';
import Newsletter from './newsletter';

const CTA = () => {
	return (
		<div className={ `jwt-auth-cta` }>
			<div className={ `jwt-auth-box` }>
				<h3>{ __( `Need Priority Support?`, 'jwt-auth' ) }</h3>
				<p>
					{ __( `Hello! I'm`, 'jwt-auth' ) }{ ' ' }
					<a href="https://76.digital/" target="_blank">
						Enrique Chavez
					</a>
					,{ ' ' }
					{ __(
						`a freelance WordPress developer. I've been working with WordPress for over 10 years.`,
						'jwt-auth'
					) }
				</p>
				<p>
					{ __(
						`If you need priority support, I'm available for hire. I can help you troubleshoot any issues you're having with the plugin, or even build a custom solution for your project.`,
						'jwt-auth'
					) }
				</p>
				<p>
					{ __(
						`Get in touch with me clicking the button below or you can hire me directly on`,
						'jwt-auth'
					) }{ ' ' }
					<a href="https://76.digital/codeable" target="_blank">
						Codeable.
					</a>
				</p>
				<div className={ `jwt-auth-cta-wrapper` }>
					<a
						href="https://76.digital/contact/"
						target="_blank"
						className={ `jwt-auth-cta-button` }
					>
						{ __( `Get in touch`, 'jwt-auth' ) }
					</a>
				</div>
			</div>
			<div className={ `jwt-auth-box jwt-auth-newsletter` }>
				<Newsletter />
			</div>
		</div>
	);
};

export default CTA;
