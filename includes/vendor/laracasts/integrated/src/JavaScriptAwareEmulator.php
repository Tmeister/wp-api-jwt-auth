<?php

namespace Laracasts\Integrated;

interface JavaScriptAwareEmulator
{

    /**
     * Assert that an alert box is displayed, and contains the given text.
     *
     * @param  string  $text
     * @param  boolean $accept
     * @return
     */
    public function seeInAlert($text, $accept = true);

    /**
     * Accept an alert.
     *
     * @return static
     */
    public function acceptAlert();

    /**
     * Take a snapshot of the current page.
     *
     * @param  string|null $destination
     * @return static
     */
    public function snap($destination = null);

    /**
     * Continuously poll the page, until you find an element
     * with the given name or id.
     *
     * @param  string  $element
     * @param  integer $timeout
     * @return static
     */
    public function waitForElement($element, $timeout = 5000);
}
