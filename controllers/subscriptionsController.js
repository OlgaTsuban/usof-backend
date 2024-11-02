const Subscription = require('../models/Subscription');

class SubscriptionController {
    // Subscribe to a post
    static async subscribe(req, res) {
        const { post_id } = req.params;
        const userId = req.session.user.id; 

        try {
            const isSubscribed = await Subscription.checkSubscription(userId, post_id);

            if (isSubscribed) {
                return res.status(400).json({ message: 'You are already subscribed to this post.' });
            }

            await Subscription.subscribeToPost(userId, post_id);
            res.status(200).json({ message: 'Subscribed successfully to the post.' });
        } catch (err) {
            console.error('Error subscribing to post:', err);
            res.status(500).json({ message: 'Error subscribing to post.', error: err.message });
        }
    }

    // Unsubscribe from a post
    static async unsubscribe(req, res) {
        const { post_id } = req.params;
        const userId = req.session.user.id;

        try {
            const isSubscribed = await Subscription.checkSubscription(userId, post_id);

            if (!isSubscribed) {
                return res.status(400).json({ message: 'You are not subscribed to this post.' });
            }

            await Subscription.unsubscribeFromPost(userId, post_id);
            res.status(200).json({ message: 'Unsubscribed from the post.' });
        } catch (err) {
            console.error('Error unsubscribing from post:', err);
            res.status(500).json({ message: 'Error unsubscribing from post.', error: err.message });
        }
    }

    // Get users subscribed to a post
    static async getSubscribedUsersForPost(req, res) {
        const { post_id } = req.params;

        try {
            const userIds = await Subscription.getSubscribedUsers(post_id);

            if (userIds.length === 0) {
                return res.status(404).json({ message: 'No users subscribed to this post.' });
            }

            res.status(200).json({ subscribedUsers: userIds });
        } catch (err) {
            console.error('Error fetching subscribed users:', err);
            res.status(500).json({ message: 'Failed to retrieve subscribed users.', error: err.message });
        }
    }

    // Get posts subscribed by a user
    static async getSubscribedPostsByUser(req, res) {
        const userId = req.session.user.id; 

        try {
            const subscribedPosts = await Subscription.getSubscribedPostsByUser(userId);

            if (subscribedPosts.length === 0) {
                return res.status(404).json({ message: 'User is not subscribed to any posts.' });
            }

            res.status(200).json({ subscribedPosts });
        } catch (err) {
            console.error('Error fetching subscribed posts:', err);
            res.status(500).json({ message: 'Failed to retrieve subscribed posts.', error: err.message });
        }
    }
}

module.exports = SubscriptionController;
