namespace Movie.API.Models
{
    public class ForumPost
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int TopicId { get; set; }
        public ForumTopic? Topic { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int? ParentPostId { get; set; } 
        public ForumPost? ParentPost { get; set; }
        public ICollection<ForumPost> Replies { get; set; } = new List<ForumPost>();
    }
}