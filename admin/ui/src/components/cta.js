import {__} from '@wordpress/i18n';
import Newsletter from './newsletter';

const CTA = () => {
    return (
        <div className={`jwt-auth-cta`}>
            <div className={`jwt-auth-box`}>
                <h3>{__(`Be the First to Join the Early Beta!`, 'jwt-auth')}</h3>
                <p>
                    {__(
                        `After numerous requests from users, I've decided to create a Pro version of this plugin, offering enhanced features and greater flexibility for developers.`,
                        'jwt-auth'
                    )}
                </p>
                <p>
                    {__(
                        `Sign up now for the Early Beta of JWT Authentication Pro! As a beta participant, you'll not only gain early access to advanced features but also enjoy exclusive discounts when the Pro version officially launches.`,
                        'jwt-auth'
                    )}
                </p>
                <p>
                    {__(
                        `By joining the Early Beta, you'll have the opportunity to test cutting-edge features and provide valuable feedback to help improve the Pro version.`,
                        'jwt-auth'
                    )}
                </p>
                <p>
                    {__(
                        `Take advantage of this opportunity to influence the Pro version’s development and secure exclusive discounts—sign up now!`,
                        'jwt-auth'
                    )}
                </p>
                <div className={`jwt-auth-cta-wrapper`}>
                    <a
                        href="http://jwtauth.pro?utm_source=wpadmin&utm_medium=settings&utm_campaign=early-beta"
                        target="_blank"
                        className={`jwt-auth-cta-button`}
                    >
                        {__(`Sign Up for Early Beta`, 'jwt-auth')}
                    </a>
                </div>
            </div>
            <div className={`jwt-auth-box jwt-auth-newsletter`}>
                <Newsletter/>
            </div>
        </div>
    );
};

export default CTA;
