<?php

namespace Laracasts\TestDummy;

use Illuminate\Support\Collection;
use Faker\Factory as Faker;
use Closure;

class Builder
{

    /**
     * All user-defined fixtures.
     *
     * @var array
     */
    protected $fixtures;

    /**
     * The number of times to create the record.
     *
     * @var integer
     */
    protected $times = 1;

    /**
     * The persistable model instance.
     *
     * @var IsPersistable
     */
    protected $model;

    /**
     * The Faker instance.
     *
     * @var Faker
     */
    protected $faker;

    /**
     * Create a new Builder instance.
     *
     * @param IsPersistable  $model
     * @param array          $fixtures
     */
    public function __construct(IsPersistable $model, array $fixtures)
    {
        $this->model = $model;
        $this->fixtures = $fixtures;
    }

    /**
     * Get the number of times to create a record.
     *
     * @return integer
     */
    protected function getTimes()
    {
        return $this->times;
    }

    /**
     * Set the number of times to create records.
     *
     * @param  integer $count
     * @return $this
     */
    public function setTimes($count)
    {
        $this->times = $count;

        return $this;
    }

    /**
     * Build an array of dummy attributes for an entity.
     *
     * @param  string $name
     * @param  array  $overrides
     * @return array
     */
    public function attributesFor($name, $overrides = [])
    {
        return $this->getAttributes($name, $overrides);
    }

    /**
     * Build up an entity and populate it with dummy data.
     *
     * @param  string $name
     * @param  array  $overrides
     * @return mixed
     */
    public function build($name, $overrides = [])
    {
        $attributes = $this->getAttributes($name, $overrides);
        $class = $this->getFixture($name)->name;

        // We'll pass off the process of creating the entity.
        // That way, folks can use different persistence layers.

        return $this->model->build($class, $attributes);
    }

    /**
     * Build and persist a named entity.
     *
     * @param  string $name
     * @param  array  $overrides
     * @return mixed
     */
    public function create($name, array $overrides = [])
    {
        for ($i = 0; $i < $this->getTimes(); $i++) {
            $entities[] = $this->persist($name, $overrides);
        }

        if (count($entities) > 1) {
            return Collection::make($entities);
        }

        return $entities[0];
    }

    /**
     * Persist the entity and any relationships.
     *
     * @param  string $name
     * @param  array  $attributes
     * @return mixed
     */
    protected function persist($name, array $attributes = [])
    {
        $entity = $this->build($name, $attributes);

        $this->assignRelationships($entity, $attributes);
        $this->model->save($entity);

        return $entity;
    }

    /**
     * Merge the fixture with any potential overrides.
     *
     * @param  string $name
     * @param  array  $attributes
     * @return array
     * @throws TestDummyException
     */
    protected function getAttributes($name, array $attributes)
    {
        $attributes = $this->filterRelationshipAttributes($attributes);

        $factory = $this->triggerFakerOnAttributes(
            $this->getFixture($name)->attributes
        );

        return array_merge($factory, $attributes);
    }

    /**
     * Remove attributes meant for a relationship.
     *
     * @param  array $attributes
     * @return array
     */
    protected function filterRelationshipAttributes(array $attributes)
    {
        return filter_array_keys($attributes, function ($key) {
            return ! str_contains($key, '.');
        });
    }

    /**
     * Get a single fixture.
     *
     * @param  string $name
     * @throws TestDummyException
     * @return mixed
     */
    protected function getFixture($name)
    {
        // The user may provide either a class name or a short
        // name identifier. So we'll track it down here.

        foreach ($this->fixtures as $fixture) {
            if ($fixture->shortName == $name) {
                return $fixture;
            }

            if ($fixture->name == $name && ! $fixture->shortName) {
                return $fixture;
            }
        }

        throw new TestDummyException(
            'Could not locate a factory with the name: ' . $name
        );
    }

    /**
     * Apply Faker dummy values to the attributes.
     *
     * @param  object|array $attributes
     * @return array
     */
    protected function triggerFakerOnAttributes($attributes)
    {
        // If $attributes is a closure, then we need to call it
        // and fetch the returned array. This way, we ensure
        // that we always fetch unique faked values.

        if ($attributes instanceof Closure) {
            $attributes = $attributes($this->faker());
        }

        // To ensure that we don't use the same Faker value for every
        // single factory of the same name, all Faker properties are
        // wrapped in closures.

        // So we can now filter through our attributes and call these
        // closures, which will generate the proper Faker values.

        return array_map(function ($attribute) {
            if ($attribute instanceof Closure) {
                $attribute = $attribute();
            }

            // It's possible that the called Faker method returned an array.
            // If that is the case, we'll implode it for the user.

            return is_array($attribute) ? implode(' ', $attribute) : $attribute;
        }, $attributes);
    }

    /**
     * Get a Faker instance.
     *
     * @return Faker
     */
    protected function faker()
    {
        if ( ! $this->faker) {
            $this->faker = Faker::create();
        }

        return $this->faker;
    }

    /**
     * Prepare and assign any applicable relationships.
     *
     * @param  mixed $entity
     * @param  array $attributes
     * @return mixed
     */
    protected function assignRelationships($entity, $attributes)
    {
        $modelAttributes = $this->model->getAttributes($entity);

        // We'll filter through all of the columns, and check
        // to see if there are any defined relationships. If there
        // are, then we'll need to create those records as well.

        foreach ($modelAttributes as $columnName => $value) {
            if ($relationship = $this->findRelation($value)) {
                $entity[$columnName] = $this->fetchRelationId($relationship, $columnName, $attributes);
            }
        }

        return $entity;
    }

    /**
     * Check if the attribute refers to a relationship.
     *
     * @param  string $attribute
     * @return string|boolean
     */
    protected function findRelation($attribute)
    {
        if (is_string($attribute) && preg_match('/^factory:(.+)$/i', $attribute, $matches)) {
            return $matches[1];
        }

        return false;
    }

    /**
     * Get the ID for the relationship.
     *
     * @param  string $factoryName
     * @param  string $relationshipName
     * @param  array  $attributes
     * @return int
     */
    protected function fetchRelationId($factoryName, $relationshipName, array $attributes)
    {
        $attributes = $this->extractRelationshipAttributes($relationshipName, $attributes);
        $relationKey = $this->persist($factoryName, $attributes)->getKey();

        return $relationKey;
    }

    /**
     * Extract the attributes meant for a particular relationship.
     *
     * @param  string $columnName
     * @param  array  $attributes
     * @return array
     */
    protected function extractRelationshipAttributes($columnName, array $attributes)
    {
        $attributes = filter_array_keys($attributes, function ($key) use ($columnName) {
            return starts_with($key, $columnName . '.');
        });

        $extractedAttributes = [];

        foreach ($attributes as $key => $value) {
            $key = substr($key, strlen($columnName) + 1);
            $extractedAttributes[$key] = $value;
        }

        return $extractedAttributes;
    }
}
