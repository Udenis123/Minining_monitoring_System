<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentUser = Auth::user();

        return [
            'id' => $this->id,
            'content' => $this->content,
            'is_read' => !is_null($this->read_at),
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'is_mine' => $currentUser && $this->sender_id === $currentUser->id,
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'email' => $this->sender->email
            ],
            'recipient' => [
                'id' => $this->recipient->id,
                'name' => $this->recipient->name,
                'email' => $this->recipient->email
            ]
        ];
    }
}
