<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\MessageResource;

class MessageController extends Controller
{
    /**
     * Get all messages for the authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Log the view action
        LogService::viewLog('Message');

        $perPage = $request->query('per_page', 15);
        $unreadOnly = $request->query('unread_only', false);
        $conversationWithUserId = $request->query('user_id');

        $query = Message::forUser(Auth::id())
            ->with(['sender', 'recipient'])
            ->orderBy('created_at', 'desc');

        // Filter by unread status
        if ($unreadOnly) {
            $query->unread()->where('recipient_id', Auth::id());
        }

        // Filter for conversation with specific user
        if ($conversationWithUserId) {
            $query->where(function($q) use ($conversationWithUserId) {
                $q->where(function($inner) use ($conversationWithUserId) {
                    $inner->where('sender_id', Auth::id())
                        ->where('recipient_id', $conversationWithUserId);
                })->orWhere(function($inner) use ($conversationWithUserId) {
                    $inner->where('sender_id', $conversationWithUserId)
                        ->where('recipient_id', Auth::id());
                });
            });
        }

        $messages = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => MessageResource::collection($messages),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'from' => $messages->firstItem(),
                'last_page' => $messages->lastPage(),
                'path' => $messages->path(),
                'per_page' => $messages->perPage(),
                'to' => $messages->lastItem(),
                'total' => $messages->total(),
            ],
            'message' => 'Messages retrieved successfully'
        ]);
    }

    /**
     * Get conversations (grouped by user)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getConversations(Request $request): JsonResponse
    {
        // Log the view action
        LogService::viewLog('Message');

        $userId = Auth::id();

        // Get all users that the current user has exchanged messages with
        $senderIds = Message::where('recipient_id', $userId)
            ->where('is_deleted_by_recipient', false)
            ->select('sender_id')
            ->distinct()
            ->pluck('sender_id');

        $recipientIds = Message::where('sender_id', $userId)
            ->where('is_deleted_by_sender', false)
            ->select('recipient_id')
            ->distinct()
            ->pluck('recipient_id');

        $userIds = $senderIds->merge($recipientIds)->unique();

        // Get users with their latest message and unread count
        $conversations = User::whereIn('id', $userIds)
            ->get()
            ->map(function($user) use ($userId) {
                // Get the latest message with this user
                $latestMessage = Message::where(function($q) use ($userId, $user) {
                    $q->where(function($inner) use ($userId, $user) {
                        $inner->where('sender_id', $userId)
                            ->where('recipient_id', $user->id)
                            ->where('is_deleted_by_sender', false);
                    })->orWhere(function($inner) use ($userId, $user) {
                        $inner->where('sender_id', $user->id)
                            ->where('recipient_id', $userId)
                            ->where('is_deleted_by_recipient', false);
                    });
                })
                ->orderBy('created_at', 'desc')
                ->first();

                // Count unread messages from this user
                $unreadCount = Message::where('sender_id', $user->id)
                    ->where('recipient_id', $userId)
                    ->where('is_deleted_by_recipient', false)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'latest_message' => $latestMessage ? [
                        'id' => $latestMessage->id,
                        'content' => $latestMessage->content,
                        'sent_at' => $latestMessage->created_at,
                        'is_read' => !is_null($latestMessage->read_at),
                        'is_sender' => $latestMessage->sender_id === $userId,
                    ] : null,
                    'unread_count' => $unreadCount,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $conversations,
            'message' => 'Conversations retrieved successfully'
        ]);
    }

    /**
     * Send a new message
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function send(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|exists:users,id',
            'content' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Prevent sending messages to yourself
        if ($request->recipient_id == Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot send messages to yourself'
            ], 422);
        }

        $message = Message::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'content' => $request->content
        ]);

        // Load the relationship
        $message->load(['sender', 'recipient']);

        // Log the action
        LogService::createLog('Message', $message->id, $message->toArray());

        return response()->json([
            'success' => true,
            'data' => new MessageResource($message),
            'message' => 'Message sent successfully'
        ], 201);
    }

    /**
     * Mark a message as read
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        // Check if user is the recipient
        if ($message->recipient_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $message->markAsRead();

        // Log the action
        LogService::updateLog('Message', $message->id,
            ['read_at' => null],
            ['read_at' => $message->read_at]
        );

        return response()->json([
            'success' => true,
            'message' => 'Message marked as read'
        ]);
    }

    /**
     * Mark all messages from a user as read
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function markAllAsRead(Request $request, int $userId): JsonResponse
    {
        $messages = Message::where('sender_id', $userId)
            ->where('recipient_id', Auth::id())
            ->whereNull('read_at')
            ->get();

        foreach ($messages as $message) {
            $message->markAsRead();

            // Log the action
            LogService::updateLog('Message', $message->id,
                ['read_at' => null],
                ['read_at' => $message->read_at]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'All messages marked as read',
            'count' => $messages->count()
        ]);
    }

    /**
     * Delete a message (soft delete)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function delete(Request $request, int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        // Check if user is either the sender or recipient
        if ($message->sender_id !== Auth::id() && $message->recipient_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Update the appropriate flag
        if ($message->sender_id === Auth::id()) {
            $message->update(['is_deleted_by_sender' => true]);

            // Log the action
            LogService::updateLog('Message', $message->id,
                ['is_deleted_by_sender' => false],
                ['is_deleted_by_sender' => true]
            );
        } else {
            $message->update(['is_deleted_by_recipient' => true]);

            // Log the action
            LogService::updateLog('Message', $message->id,
                ['is_deleted_by_recipient' => false],
                ['is_deleted_by_recipient' => true]
            );
        }

        // If both sender and recipient have deleted the message,
        // we could consider hard deleting it to save space
        if ($message->is_deleted_by_sender && $message->is_deleted_by_recipient) {
            // Log before deletion
            LogService::deleteLog('Message', $message->id, $message->toArray());

            // Hard delete
            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Message permanently deleted'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }

    /**
     * Get unread message count
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        $count = Message::where('recipient_id', Auth::id())
            ->where('is_deleted_by_recipient', false)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $count
            ],
            'message' => 'Unread message count retrieved successfully'
        ]);
    }

    /**
     * Get a list of all users that can receive messages
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUsersList(Request $request): JsonResponse
    {
        // Get all users except the authenticated user
        $users = User::where('id', '!=', Auth::id())
            ->select(['id', 'name', 'email'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
            'message' => 'Users list retrieved successfully'
        ]);
    }
}
