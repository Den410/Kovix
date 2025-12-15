using Movie.API.Models;

namespace Movie.API.DTOs
{
    public class ReviewVote
    {
        public int Id { get; set; }

        public int ReviewId { get; set; }
        public Review? Review { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public bool IsLike { get; set; }
    }
}
