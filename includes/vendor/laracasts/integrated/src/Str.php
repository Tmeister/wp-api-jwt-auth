<?php

namespace Laracasts\Integrated;

class Str
{
    /**
     * Determine if a given string starts with a given substring.
     * Swiped from Taylor Otwell :,
     *
     * @param  string  $haystack
     * @param  string|array  $needles
     * @return bool
     */
    public static function startsWith($haystack, $needles)
    {
        foreach ((array) $needles as $needle) {
            if ($needle != '' && strpos($haystack, $needle) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if a string is contains within another string.
     *
     * @param  string $haystack
     * @param  string $needle
     * @return boolean
     */
    public static function contains($haystack, $needle)
    {
        if ($needle != '' && stripos($haystack, $needle) !== false) {
            return true;
        }
    }
}
