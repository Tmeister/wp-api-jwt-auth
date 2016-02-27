<?php

use \Illuminate\Database\Eloquent\Model;

class Message extends Model {
    public function sender() { return $this->belongsTo('Person', 'sender_id'); }
    public function receiver() { return $this->belongsTo('Person', 'receiver_id'); }
}
