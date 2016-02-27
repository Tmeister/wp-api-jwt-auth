<?php

namespace Laracasts\TestDummy;

use Illuminate\Database\Eloquent\Model as Eloquent;

class EloquentModel implements IsPersistable
{

    /**
     * Build the entity with attributes.
     *
     * @param  string $type
     * @param  array  $attributes
     * @throws TestDummyException
     * @return Eloquent
     */
    public function build($type, array $attributes)
    {
        if ( ! class_exists($type)) {
            throw new TestDummyException("The {$type} model was not found.");
        }

        return $this->fill($type, $attributes);
    }

    /**
     * Persist the entity.
     *
     * @param  Model $entity
     * @return void
     */
    public function save($entity)
    {
        $entity->save();
    }

    /**
     * Get all attributes for the model.
     *
     * @param  object $entity
     * @return array
     */
    public function getAttributes($entity)
    {
        return $entity->getAttributes();
    }

    /**
     * Force fill an object with attributes.
     *
     * @param  string $type
     * @param  array  $attributes
     * @return Model
     */
    private function fill($type, $attributes)
    {
        Eloquent::unguard();

        $object = (new $type)->fill($attributes);

        Eloquent::reguard();

        return $object;
    }

}
