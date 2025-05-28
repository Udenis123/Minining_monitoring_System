<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'content',
        'read_at',
        'is_deleted_by_sender',
        'is_deleted_by_recipient'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'is_deleted_by_sender' => 'boolean',
        'is_deleted_by_recipient' => 'boolean'
    ];

    /**
     * Get the sender of the message.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the recipient of the message.
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Scope a query to only include messages for a specific user
     * that are not deleted by that user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where(function($q) use ($userId) {
            $q->where('sender_id', $userId)
              ->where('is_deleted_by_sender', false)
              ->orWhere(function($q2) use ($userId) {
                  $q2->where('recipient_id', $userId)
                     ->where('is_deleted_by_recipient', false);
              });
        });
    }

    /**
     * Scope a query to only include unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Mark the message as read.
     */
    public function markAsRead()
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }

        return $this;
    }

    /**
     * Check if the message is read.
     */
    public function isRead()
    {
        return !is_null($this->read_at);
    }
}
