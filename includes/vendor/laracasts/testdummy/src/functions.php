<?php

/**
 * Filter an array using keys instead of values.
 *
 * @param  array    $array
 * @param  callable $callback
 * @return array
 */
function filter_array_keys(array $array, $callback)
{
    $matchedKeys = array_filter(array_keys($array), $callback);

    return array_intersect_key($array, array_flip($matchedKeys));
}
