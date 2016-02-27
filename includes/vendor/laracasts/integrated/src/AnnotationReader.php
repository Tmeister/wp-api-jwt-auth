<?php

namespace Laracasts\Integrated;

use Laracasts\Integrated\Str;
use ReflectionClass;

class AnnotationReader
{
    /**
     * The object to reflect into.
     *
     * @var object
     */
    protected $reference;

    /**
     * Create a new AnnotationReader instance.
     *
     * @param mixed $reference
     */
    public function __construct($reference)
    {
        $this->reference = $reference;
    }

    /**
     * Get method names for the referenced object
     * which contain the given annotation.
     *
     * @param  string $annotation
     * @return array
     */
    public function having($annotation)
    {
        $methods = [];

        foreach ($this->reflectInto($this->reference) as $method) {
            if ($this->hasAnnotation($annotation, $method)) {
                $methods[] = $method->getName();
            }
        }

        // We'll reverse the results to ensure that this package's
        // hooks are called *before* the user's.

        return array_reverse($methods);
    }

    /**
     * Reflect into the given object.
     *
     * @param  object $object
     * @return ReflectionClass
     */
    protected function reflectInto($object)
    {
        return (new ReflectionClass($object))->getMethods();
    }

    /**
     * Search the docblock for the given annotation.
     *
     * @param  string            $annotation
     * @param  \ReflectionMethod $method
     * @return boolean
     */
    protected function hasAnnotation($annotation, \ReflectionMethod $method)
    {
        return Str::contains($method->getDocComment(), "@{$annotation}");
    }
}
