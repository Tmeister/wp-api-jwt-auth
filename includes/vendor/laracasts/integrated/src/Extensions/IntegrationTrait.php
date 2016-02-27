<?php

namespace Laracasts\Integrated\Extensions;

use PHPUnit_Framework_ExpectationFailedException as PHPUnitException;
use Laracasts\Integrated\IntegratedException;
use Laracasts\Integrated\AnnotationReader;
use Symfony\Component\DomCrawler\Form;
use Laracasts\Integrated\File;
use Laracasts\Integrated\Str;
use InvalidArgumentException;
use BadMethodCallException;

trait IntegrationTrait
{
    /**
     * The DomCrawler instance.
     *
     * @var DomCrawler
     */
    protected $crawler;

    /**
     * The current page URL.
     *
     * @var string
     */
    protected $currentPage;

    /**
     * User-filled form inputs.
     *
     * @var array
     */
    protected $inputs = [];

    /**
     * The user-provided package configuration.
     *
     * @var array
     */
    protected $packageConfig;

    /**
     * The annotation reader instance.
     *
     * @var AnnotationReader
     */
    protected $annotations;

    /**
     * The location where the log file will be stored.
     *
     * @var string|null
     */
    protected $logFileLocation = "tests/logs/output.html";

    /**
     * Prepare the test for PHPUnit.
     *
     * @return  void
     */
    public function setUp()
    {
        parent::setUp();

        $this->callMethods(
            $this->annotations()->having('setUp')
        );
    }

    /**
     * Make a GET request to the given uri.
     *
     * @param  string $uri
     * @return static
     */
    public function visit($uri)
    {
        $this->currentPage = $this->prepareUrl($uri);

        $this->makeRequest('GET', $this->currentPage);

        return $this;
    }

    /**
     * Prepare the relative URL, given by the user.
     *
     * @param  string $url
     * @return string
     */
    protected function prepareUrl($url)
    {
        if (Str::startsWith($url, '/')) {
            $url = substr($url, 1);
        }

        if (! Str::startsWith($url, 'http')) {
            $url = sprintf("%s/%s", $this->baseUrl(), $url);
        }

        return trim($url, '/');
    }

    /**
     * Assert that the page contains the given text.
     *
     * @param  string  $text
     * @param  string  $message
     * @param  boolean $negate
     * @return static
     * @throws PHPUnitException
     */
    protected function assertSee($text, $message, $negate = false)
    {
        try {
            $text = preg_quote($text, '/');
            $method = $negate ? 'assertNotRegExp' : 'assertRegExp';

            $this->$method("/{$text}/i", $this->response(), $message);
        } catch (PHPUnitException $e) {
            $this->logLatestContent();

            throw $e;
        }

        return $this;
    }

    /**
     * Assert that the page contains the given text.
     *
     * @param  string $text
     * @return static
     * @throws PHPUnitException
     */
    public function see($text)
    {
        return $this->assertSee($text, sprintf(
            "Could not find '%s' on the page, '%s'.", $text, $this->currentPage
        ));
    }

    /**
     * Assert that the page does not contain the given text.
     *
     * @param  string $text
     * @return static
     * @throws PHPUnitException
     */
    public function notSee($text)
    {
        return $this->assertSee($text, sprintf(
            "Could not find '%s' on the page, '%s'.", $text, $this->currentPage
        ), true);
    }

    /**
     * Assert that the page URI matches the given uri.
     *
     * @param  string  $uri
     * @param  message $message
     * @param  boolean $negate
     * @return static
     */
    public function assertPageIs($uri, $message, $negate = false)
    {
        $this->assertPageLoaded($uri = $this->prepareUrl($uri));

        $method = $negate ? 'assertNotEquals' : 'assertEquals';

        $this->$method($uri, $this->currentPage(), $message);

        return $this;
    }

    /**
     * Assert that the current page matches a uri.
     *
     * @param  string $uri
     * @return static
     */
    public function seePageIs($uri)
    {
        return $this->assertPageIs(
            $uri, "Expected to be on the page, {$uri}, but wasn't."
        );
    }

    /**
     * Assert that the current page does match a given uri.
     *
     * @param  string $uri
     * @return static
     */
    public function notSeePageIs($uri)
    {
        return $this->assertPageIs(
            $uri, "Expected to NOT be on the page, {$uri}, but was.", true
        );
    }

    /**
     * Alias that defers to seePageIs.
     *
     * @param  string $page
     * @return static
     */
    public function onPage($page)
    {
        return $this->seePageIs($page);
    }

    /**
     * Click a link with the given body.
     *
     * @param  string $name
     * @return static
     */
    public function click($name)
    {
        $link = $this->crawler->selectLink($name);

        // If we couldn't find the link by its body, then
        // we'll do a second pass and see if the user
        // provided a name or id attribute instead.

        if (! count($link)) {
            $link = $this->filterByNameOrId($name, 'a');

            if (! count($link)) {
                $message = "Couldn't see a link with a body, name, or id attribute of, '{$name}'.";

                throw new InvalidArgumentException($message);
            }
        }

        $this->visit($link->link()->getUri());

        return $this;
    }

    /**
     * Alias that points to the click method.
     *
     * @param  string $text
     * @return static
     */
    public function follow($text)
    {
        return $this->click($text);
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
        return $this->storeInput($element, $text);
    }

    /**
     * Alias that defers to type method.
     *
     * @param  string $text
     * @param  string $element
     * @return static
     */
    public function fill($text, $element)
    {
        return $this->type($text, $element);
    }

    /**
     * Check a checkbox.
     *
     * @param  string $element
     * @return static
     */
    public function check($element)
    {
        return $this->storeInput($element, true);
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
        return $this->storeInput($element, $option);
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
        return $this->storeInput($element, $absolutePath);
    }

    /**
     * Store a form input.
     *
     * @param  string $name
     * @param  string $value
     * @return static
     */
    protected function storeInput($name, $value)
    {
        $this->assertFilterProducedResults($name);

        $name = str_replace('#', '', $name);

        $this->inputs[$name] = $value;

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
        return $this->submitForm($buttonText, $this->inputs);
    }

    /**
     * Dump the response content from the last request to the console.
     *
     * @return void
     */
    public function dump()
    {
        $this->logLatestContent();

        die(var_dump($this->response()));
    }

    /**
     * Fill out the form, using the given data.
     *
     * @param  string $buttonText
     * @param  array  $formData
     * @return Form
     */
    protected function fillForm($buttonText, $formData = [])
    {
        if (! is_string($buttonText)) {
            $formData = $buttonText;
            $buttonText = null;
        }

        return $this->getForm($buttonText)->setValues($formData);
    }

    /**
     * Get the form from the DOM.
     *
     * @param  string|null $button
     * @throws InvalidArgumentException
     * @return Form
     */
    protected function getForm($button = null)
    {
        // If the first argument isn't a string, that means
        // the user wants us to auto-find the form.

        try {
            if ($button) {
                return $this->crawler->selectButton($button)->form();
            }

            return $this->crawler->filter('form')->form();
        } catch (InvalidArgumentException $e) {
            // We'll catch the exception, in order to provide a
            // more readable failure message for the user.

            throw new InvalidArgumentException(
                "Couldn't find a form that contains a button with text '{$button}'."
            );
        }
    }

    /**
     * Get the current URL for the request.
     *
     * @return string
     */
    protected function currentPage()
    {
        return rtrim($this->currentPage, '/');
    }

    /**
     * Assert that a 200 status code was returned from the last call.
     *
     * @param  string $uri
     * @param  string $message
     * @throws PHPUnitException
     * @return void
     */
    protected function assertPageLoaded($uri, $message = null)
    {
        $status = $this->statusCode();

        try {
            $this->assertEquals(200, $status);
        } catch (PHPUnitException $e) {
            $message = $message ?: "A GET request to '{$uri}' failed. Got a {$status} code instead.";

            $this->logLatestContent();

            if (method_exists($this, 'handleInternalError')) {
                $this->handleInternalError($message);
            }

            throw new PHPUnitException($message);
        }
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
        $crawler = $this->filterByNameOrId($filter);

        if (! count($crawler)) {
            $message = "Nothing matched the '{$filter}' CSS query provided for {$this->currentPage}.";

            throw new InvalidArgumentException($message);
        }
    }

    /**
     * Ensure that the given file exists.
     *
     * @param  string $path
     * @return static
     */
    public function seeFile($path)
    {
        $this->assertFileExists($path);

        return $this;
    }

    /**
     * Ensure that the given file does not exist.
     *
     * @param  string $path
     * @return static
     */
    public function notSeeFile($path)
    {
        $this->assertFileNotExists($path);

        return $this;
    }

    /**
     * Assert that a record is contained in the database.
     *
     * @param  string  $table
     * @param  array   $data
     * @param  string  $message
     * @param  boolean $negate
     * @return static
     */
    public function assertInDatabase($table, array $data, $message, $negate = false)
    {
        $count = $this->seeRowsWereReturned($table, $data);
        $method = $negate ? 'assertEquals' : 'assertGreaterThan';

        $this->$method(0, $count, $message);

        return $this;
    }

    /**
     * Ensure that a database table contains a row with the given data.
     *
     * @param  string $table
     * @param  array  $data
     * @return static
     */
    public function seeInDatabase($table, array $data)
    {
        return $this->assertInDatabase($table, $data, sprintf(
            "Didn't see row in the '%s' table that matched the attributes '%s'.",
            $table, json_encode($data)
        ));
    }

    /**
     * Ensure that a database table does not contain a row with the given data.
     *
     * @param  string $table
     * @param  array  $data
     * @return static
     */
    public function notSeeInDatabase($table, array $data)
    {
        return $this->assertInDatabase($table, $data, sprintf(
            "Found row(s) in the '%s' table that matched the attributes '%s', but did not expect to.",
            $table, json_encode($data)
        ), true);
    }

    /**
     * Alias that defers to seeInDatabase.
     *
     * @param  string $table
     * @param  array  $data
     * @return static
     */
    public function verifyInDatabase($table, array $data)
    {
        return $this->seeInDatabase($table, $data);
    }

    /**
     * Alias that defers to notSeeInDatabase.
     *
     * @param  string $table
     * @param  array  $data
     * @return static
     */
    public function notVerifyInDatabase($table, array $data)
    {
        return $this->notSeeInDatabase($table, $data);
    }

    /**
     * Clear out the inputs array.
     *
     * @return static
     */
    protected function clearInputs()
    {
        $this->inputs = [];

        return $this;
    }

    /**
     * Filter according to an element's name or id attribute.
     *
     * @param  string $name
     * @param  string $element
     * @return Crawler
     */
    protected function filterByNameOrId($name, $element = '*')
    {
        $name = str_replace('#', '', $name);

        return $this->crawler->filter("{$element}#{$name}, {$element}[name={$name}]");
    }

    /**
     * Log the response content to an output file for the user.
     *
     * @return void
     */
    protected function logLatestContent()
    {
        if (empty($this->logFileLocation)) {
            return;
        }
        $this->files()->put($this->logFileLocation, $this->response());
    }

    /**
     * Fetch the user-provided package configuration.
     *
     * @param  string|null $key
     * @return object
     */
    protected function getPackageConfig($key = null)
    {
        if (! file_exists('integrated.json') && ! file_exists('integrated.php')) {
            return [];
        }

        if ( ! $this->packageConfig) {
            $this->loadPreferredConfigFile();
        }

        if ($key) {
            if (! isset($this->packageConfig[$key])) {
                throw new IntegratedException(
                    "Hmm, did you set a '{$key}' key in your integrated.(json|php) file? Can't find it!"
                );
            }

            return $this->packageConfig[$key];
        }

        return $this->packageConfig;
    }

    /**
     * Load the configuration file.
     *
     * @return void
     */
    protected function loadPreferredConfigFile()
    {
        if (file_exists('integrated.php')) {
            return $this->packageConfig = require('integrated.php');
        }

        if (file_exists('integrated.json')) {
            $this->packageConfig = json_decode(file_get_contents('integrated.json'), true);
        }
    }

    /**
     * Get the annotation reader instance.
     *
     * @return AnnotationReader
     */
    protected function annotations()
    {
        if (! $this->annotations) {
            $this->annotations = new AnnotationReader($this);
        }

        return $this->annotations;
    }

    /**
     * Get a filesystem class.
     *
     * @return File
     */
    protected function files()
    {
        return new File;
    }

    /**
     * Trigger all provided methods on the current object.
     *
     * @param  array $methods
     * @return void
     */
    protected function callMethods(array $methods)
    {
        foreach ($methods as $method) {
            call_user_func([$this, $method]);
        }
    }

    /**
     * Clean up after for PHPUnit.
     *
     * @return void
     */
    public function tearDown()
    {
        $this->callMethods(
            array_reverse($this->annotations()->having('tearDown'))
        );
    }

    /**
     * Handle dynamic calls.
     *
     * @param  string $method
     * @param  array $args
     * @return mixed
     */
    public function __call($method, $args)
    {
        if (Str::startsWith($method, 'and')) {
            $method = strtolower(substr($method, 3));

            if (method_exists($this, $method)) {
                return call_user_func_array([$this, $method], $args);
            }
        }

        throw new BadMethodCallException("The '{$method}' method does not exist.");
    }
}
