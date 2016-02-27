<?php

namespace Laracasts\Integrated;

interface Emulator
{
    /**
     * Make a GET request to the given page.
     *
     * @param  string $page
     * @return static
     */
    public function visit($page);

    /**
     * Search the DOM for the given text.
     *
     * @param  string $text
     * @return static
     */
    public function see($text);

    /**
     * Ensure that the DOM does not contain the given text.
     *
     * @param  string $text
     * @return static
     */
    public function notSee($text);

    /**
     * Assert that the page uri is.
     *
     * @param  string $page
     * @return static
     */
    public function seePageIs($page);

    /**
     * Assert that the page uri does not match the given uri.
     *
     * @param  string $page
     * @return static
     */
    public function notSeePageIs($page);

    /**
     * Assert that the current page is...
     *
     * @param  string $page
     * @return static
     */
    public function onPage($page);

    /**
     * Click a link with the given body.
     *
     * @param  string $text
     * @return static
     */
    public function click($text);

    /**
     * Alias that points to the click method.
     *
     * @param  string $text
     * @return static
     */
    public function follow($text);

    /**
     * Submit a form on the page.
     *
     * @param  string $buttonText
     * @param  array|null $formData
     * @return static
     */
    public function submitForm($buttonText, $formData = null);

    /**
     * Press the form submit button with the given text.
     *
     * @param  string $buttonText
     * @return static
     */
    public function press($buttonText);

    /**
     * Fill in an input with the given text.
     *
     * @param  string $text
     * @param  string $element
     * @return static
     */
    public function type($text, $element);

    /**
     * Conveience method that defers to type method.
     *
     * @param  string $text
     * @param  string $element
     * @return static
     */
    public function fill($text, $element);

    /**
     * Check a checkbox.
     *
     * @param  string $element
     * @return static
     */
    public function check($element);

    /**
     * Alias that defers to check method.
     *
     * @param  string $element
     * @return static
     */
    public function tick($element);

    /**
     * Select an option from a dropdown.
     *
     * @param  string $element
     * @param  string $option
     * @return static
     */
    public function select($element, $option);

    /**
     * Attach a file to a form.
     *
     * @param  string $element
     * @param  string $absolutePath
     * @return static
     */
    public function attachFile($element, $absolutePath);

    /**
     * Ensure that the given file exists.
     *
     * @param  string $path
     * @return static
     */
    public function seeFile($path);

    /**
     * Ensure that the given file does not exist.
     *
     * @param  string $path
     * @return static
     */
    public function notSeeFile($path);

    /**
     * Ensure that a database table contains a row with the given data.
     *
     * @param  string $table
     * @param  array  $data
     * @return static
     */
    public function seeInDatabase($table, array $data);

    /**
     * Ensure that a database table does not contain a row with the given data.
     *
     * @param  string $table
     * @param  array  $data
     * @return static
     */
    public function notSeeInDatabase($table, array $data);

    /**
     * Convenience method that defers to seeInDatabase.
     *
     * @param  string $table
     * @param  array $data
     * @return static
     */
    public function verifyInDatabase($table, array $data);

    /**
     * Convenience method that defers to notSeeInDatabase.
     *
     * @param  string $table
     * @param  array $data
     * @return static
     */
    public function notVerifyInDatabase($table, array $data);

    /**
     * Dump the response content from the last request to the console.
     *
     * @return void
     */
    public function dump();
}
