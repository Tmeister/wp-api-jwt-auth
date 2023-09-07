const CTA = () => {
	return (
		<div className={ `jwt-auth-cta` }>
			<div className={ `jwt-auth-box` }>
				<h3>Need Priority Support?</h3>
				<p>
					Hello! I'm{ ' ' }
					<a href="https://76.digital/" target="_blank">
						Enrique Chavez
					</a>
					, a freelance WordPress developer. I've been working with
					WordPress for over 10 years.
				</p>
				<p>
					If you need priority support, I'm available for hire. I can
					help you troubleshoot any issues you're having with the
					plugin, or even build a custom solution for your project.
				</p>
				<p>
					Get in touch with me clicking the button below or you can
					hire me directly on{ ' ' }
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
						Get in touch
					</a>
				</div>
			</div>
		</div>
	);
};

export default CTA;
