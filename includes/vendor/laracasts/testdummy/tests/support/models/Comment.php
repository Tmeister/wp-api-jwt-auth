<?php

use \Illuminate\Database\Eloquent\Model;

class Comment extends Model {
    public function post() { return $this->belongsTo('Post'); }
}