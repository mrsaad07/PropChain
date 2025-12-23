import React, { useState, useEffect } from 'react';
import { extrasAPI } from '../services/api';
import { Star } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { toast } from 'react-toastify';

const Reviews = ({ propertyId }) => {
  const { account } = useBlockchain();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await extrasAPI.getReviews(propertyId);
      setReviews(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return toast.error("Connect wallet to review");
    
    setLoading(true);
    try {
      await extrasAPI.createReview({ propertyId, rating, comment });
      toast.success("Review added!");
      setComment('');
      fetchReviews();
    } catch (error) {
      toast.error("Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
      <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Reviews ({reviews.length})</h3>
      
      {/* List */}
      <div className="space-y-6 mb-8">
        {reviews.length > 0 ? (
          reviews.map(r => (
            <div key={r._id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs text-gray-500">{r.userWallet.substring(0, 10)}...</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{r.comment}</p>
              <span className="text-[10px] text-gray-400 mt-1 block">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No reviews yet. Be the first!</p>
        )}
      </div>

      {/* Form */}
      {account && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-bold text-sm mb-3 dark:text-gray-200">Leave a Review</h4>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                type="button" 
                onClick={() => setRating(star)}
                className="focus:outline-none transition transform hover:scale-110"
              >
                <Star size={20} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              </button>
            ))}
          </div>
          <textarea 
            required
            rows={2}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write your experience..."
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm mb-3"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition w-full"
          >
            {loading ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Reviews;
