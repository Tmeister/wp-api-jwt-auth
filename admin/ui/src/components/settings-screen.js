import CTA from './cta';
import MainView from './main-view';

const SettingsScreen = () => {
	return (
		<div className={ `wrap` }>
			<h1 className={ `wp-heading-inline` }>JWT Authentication</h1>
			<div className={ `jwt-auth-settings` }>
				<MainView />
				<CTA />
			</div>
		</div>
	);
};

export default SettingsScreen;
