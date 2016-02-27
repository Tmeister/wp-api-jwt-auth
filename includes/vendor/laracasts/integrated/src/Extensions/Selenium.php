<?php

namespace Laracasts\Integrated\Extensions;

use PHPUnit_Framework_ExpectationFailedException as PHPUnitException;
use Laracasts\Integrated\JavaScriptAwareEmulator;
use Laracasts\Integrated\IntegratedException;
use Laracasts\Integrated\Database\Connection;
use Laracasts\Integrated\Database\Adapter;
use WebDriver\Exception\NoSuchElement;
use Laracasts\Integrated\Emulator;
use WebDriver\Exception\CurlExec;
use InvalidArgumentException;
use WebDriver\WebDriver;
use WebDriver\Element;
use WebDriver\Session;

abstract class Selenium extends \PHPUnit_Framework_TestCase implements Emulator, JavaScriptAwareEmulator
{
    use IntegrationTrait;

    /**
     * The WebDriver instance.
     *
     * @var WebDriver
     */
    protected $webDriver;

    /**
     * The current session instance.
     *
     * @var Session
     */
    protected $session;

    /**
     * Get the base url for all requests.
     *
     * @return string
     */
    protected function baseUrl()
    {
        if (isset($this->baseUrl)) {
            return $this->baseUrl;
        }

        $config = $this->getPackageConfig();

        if (isset($config['baseUrl'])) {
            return $config['baseUrl'];
        }

        return 'http://localhost:8888';
    }

    /**
     * Call a URI in the application.
     *
     * @param  string $requestType
     * @param  string $uri
     * @param  array  $parameters
     * @return self
     */
    protected function makeRequest($requestType, $uri, $parameters = [])
    {
        try {
            $this->session = $this->newSession()->open($uri);
            $this->updateCurrentUrl();
        } catch (CurlExec $e) {
            throw new CurlExec(
                "Hold on there, partner. Did you maybe forget to boot up Selenium? " .
                "\n\njava -jar selenium-server-standalone-*.jar" .
                "\n\n" . $e->getMessage()
            );
        }

        return $this;
    }

    /**
     * Click a link with the given body.
     *
     * @param  string $name
     * @return static
     */
    public function click($name)
    {
        $page = $this->currentPage();

        try {
            $link = $this->findByBody($name)->click();
        } catch (InvalidArgumentException $e) {
            $link = $this->findByNameOrId($name)->click();
        }

        $this->updateCurrentUrl();

        $this->assertPageLoaded(
            $page,
            "Successfully clicked on a link with a body, name, or class of '{$name}', " .
            "but its destination, {$page}, did not produce a 200 status code."
        );

        return $this;
    }

    /**
     * Find an element by its text content.
     *
     * @param  string $body
     * @return Element
     */
    protected function findByBody($body)
    {
        try {
            return $this->session->element('link text', $body);
        } catch (NoSuchElement $e) {
            throw new InvalidArgumentException('No element with the given body exists.');
        }
    }

    /**
     * Filter according to an element's name or id attribute.
     *
     * @param  string $name
     * @param  string $element
     * @return Crawler
     */
    protected function findByNameOrId($name, $element = '*')
    {
        $name = str_replace('#', '', $name);

        try {
            return $this->session->element('css selector', "#{$name}, *[name={$name}]");
        } catch (NoSuchElement $e) {
            throw new InvalidArgumentException(
                "Couldn't find an element, '{$element}', with a name or class attribute of '{$name}'."
            );
        }
    }

    /**
     * Find an element by its "value" attribute.
     *
     * @param  string $value
     * @param  string $element
     * @return \Session
     */
    protected function findByValue($value, $element = 'input')
    {
        try {
            return $this->session->element('css selector', "{$element}[value='{$value}']");
        } catch (NoSuchElement $e) {
            try {
                return $this->session->element('xpath', "//button[contains(text(),'{$value}')]");
            } catch (NoSuchElement $e) {
                throw new InvalidArgumentException(
                    "Crap. Couldn't find an {$element} with a 'value' attribute of '{$value}'. We also looked " .
                    "for a button that contains the text, '{$value}', but no dice either."
                );
            }
        }
    }

    /**
     * Submit a form on the page.
     *
     * @param  string $buttonText
     * @param  array $formData
     * @return static
     */
    public function submitForm($buttonText, $formData = [])
    {
        foreach ($formData as $name => $value) {
            // Weird, but that's what you gotta do. :)
            $value = ['value' => [$value]];

            $element = $this->findByNameOrId($name);
            $tag = $element->name();

            if ($tag == 'input' && $element->attribute('type') == 'checkbox') {
                $element->click();
            } else {
                $element->postValue($value);
            }
        }

        $this->findByValue($buttonText)->submit();

        $this->updateCurrentUrl();

        return $this;
    }

    /**
     * Fill in an input with the given text.
     *
     * @param  string $text
     * @param  string $element
     * @return static
     */
    public function type($text, $element)
    {
        $value = ['value' => [$text]];
        $this->findByNameOrId($element, $text)->postValue($value);

        return $this;
    }

    /**
     * Check a checkbox.
     *
     * @param  string $element
     * @return static
     */
    public function check($element)
    {
        $this->findByNameOrId($element)->click();

        return $this;
    }

    /**
     * Alias that defers to check method.
     *
     * @param  string $element
     * @return static
     */
    public function tick($element)
    {
        return $this->check($element);
    }

    /**
     * Select an option from a dropdown.
     *
     * @param  string $element
     * @param  string $option
     * @return static
     */
    public function select($element, $option)
    {
        $this->findByValue($option, 'option')->click();

        return $this;
    }

    /**
     * Attach a file to a form.
     *
     * @param  string $element
     * @param  string $absolutePath
     * @return static
     */
    public function attachFile($element, $absolutePath)
    {
        $path = ['value' => [$absolutePath]];

        $this->findByNameOrId($element)->postValue($path);

        return $this;
    }

    /**
     * Press the form submit button with the given text.
     *
     * @param  string $buttonText
     * @return static
     */
    public function press($buttonText)
    {
        return $this->submitForm($buttonText);
    }

    /**
     * Assert that an alert box is displayed, and contains the given text.
     *
     * @param  string  $text
     * @param  boolean $accept
     * @return
     */
    public function seeInAlert($text, $accept = true)
    {
        try {
            $alert = $this->session->alert_text();
        } catch (\WebDriver\Exception\NoAlertOpenError $e) {
            throw new PHPUnitException(
                "Could not see '{$text}' because no alert box was shown."
            );
        } catch (\WebDriver\Exception\UnknownError $e) {
            // This would only apply to the PhantomJS driver.
            // It seems to have issues with alerts, so I'm
            // not sure what we can do about that...
            return $this;
        }

        $this->assertContains($text, $alert);

        if ($accept) {
            $this->acceptAlert();
        }

        return $this;
    }

    /**
     * Accept an alert.
     *
     * @return static
     */
    public function acceptAlert()
    {
        try {
            $this->session->accept_alert();
        } catch (\WebDriver\Exception\NoAlertOpenError $e) {
            throw new PHPUnitException(
                "Well, tried to accept the alert, but there wasn't one. Dangit."
            );
        }

        return $this;
    }

    /**
     * Take a snapshot of the current page.
     *
     * @param  string|null $destination
     * @return static
     */
    public function snap($destination = null)
    {
        $destination = $destination ?: './tests/logs/screenshot.png';

        $this->files()->put(
            $destination,
            base64_decode($this->session->screenshot())
        );

        return $this;
    }

    /**
     * Update the current page url.
     *
     * @return static
     */
    protected function updateCurrentUrl()
    {
        $this->currentPage = $this->session->url();

        return $this;
    }

    /**
     * Get the content from the last response.
     *
     * @return string
     */
    protected function response()
    {
        return $this->session->source();
    }

    /**
     * Get the status code from the last response.
     *
     * @return integer
     */
    protected function statusCode()
    {
        $response = $this->response();

        // Todo: Temporary. What is the correct way to get the status code?

        if (stristr($response, 'Sorry, the page you are looking for could not be found.')) {
            return 500;
        }

        return 200;
    }

    /**
     * Assert that the filtered Crawler contains nodes.
     *
     * @param  string $filter
     * @throws InvalidArgumentException
     * @return void
     */
    protected function assertFilterProducedResults($filter)
    {
        $element = $this->findByNameOrId($filter);
    }

    /**
     * Close the browser, once the test completes.
     *
     * @tearDown
     * @return void
     */
    public function closeBrowser()
    {
        if ($this->session) {
            $this->session->close();
        }
    }

    /**
     * Halt the process for any number of seconds.
     *
     * @param  integer $seconds
     * @return static
     */
    public function wait($milliseconds = 4000)
    {
        sleep($milliseconds / 1000);

        return $this;
    }

    /**
     * Continuously poll the page, until you find an element
     * with the given name or id.
     *
     * @param  string  $element
     * @param  integer $timeout
     * @return static
     */
    public function waitForElement($element, $timeout = 5000)
    {
        $this->session->timeouts()->postImplicit_wait(['ms' => $timeout]);

        try {
            $this->findByNameOrId($element);
        } catch (InvalidArgumentException $e) {
            throw new InvalidArgumentException(
                "Hey, what's happening... Look, I waited {$timeout} milliseconds to see an element with " .
                "a name or id of '{$element}', but no luck. \nIf you could take a look, that'd be greaaattt..."
            );
        }

        return $this;
    }

    /**
     * Create a new WebDriver session.
     *
     * @param  string $browser
     * @return Session
     */
    protected function newSession()
    {
        $host = 'http://localhost:4444/wd/hub';

        $this->webDriver = new WebDriver($host);
        $capabilities = [];

        return $this->session = $this->webDriver->session($this->getBrowserName(), $capabilities);
    }

    /**
     * Retrieve the user's desired browser for the tests.
     *
     * @return string
     */
    protected function getBrowserName()
    {
        $config = $this->getPackageConfig();

        if (isset($config['selenium'])) {
            return $config['selenium']['browser'];
        }

        return 'firefox';
    }
}
