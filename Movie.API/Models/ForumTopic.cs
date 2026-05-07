namespace Movie.API.Models
{
    public class ForumTopic
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public int UserId { get; set; }

        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsPinned { get; set; } = false; 
        public bool IsClosed { get; set; } = false;
        public int ViewsCount { get; set; } = 0; 

        public ForumCategory? Category { get; set; }
        public User? User { get; set; }
        public ICollection<ForumPost> Posts { get; set; } = new List<ForumPost>();
    }
}