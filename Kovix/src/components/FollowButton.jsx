import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { usersAPI } from '../services/api';

const FollowButton = ({ userId, initialIsFollowing, onToggle, className }) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);

    const handleClick = async (e) => {
        e.stopPropagation(); 
        e.preventDefault();
        
        setLoading(true);
        try {
            if (isFollowing) {
                await usersAPI.unfollow(userId);
            } else {
                await usersAPI.follow(userId);
            }
            const newState = !isFollowing;
            setIsFollowing(newState);
            if (onToggle) onToggle(newState);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant={isFollowing ? "outline-secondary" : "primary"} 
            size="sm" 
            className={className}
            onClick={handleClick}
            disabled={loading}
            style={isFollowing ? {
                color: 'var(--text-main)', 
                borderColor: 'var(--border-color)'
            } : {
                backgroundColor: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                color: 'var(--btn-text)'
            }}
        >
            {loading ? '...' : (isFollowing ? 'Відписатися' : 'Підписатися')}
        </Button>
    );
};

export default FollowButton;