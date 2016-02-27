<?php

use \Illuminate\Database\Eloquent\Model;

class Post extends Model {
    public function comments() { return $this->hasMany('Comment'); }
    public function author() { return $this->belongsTo('Person', 'author_id'); }
}
