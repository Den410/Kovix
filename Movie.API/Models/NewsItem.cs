namespace Movie.API.Models
{
    public class NewsItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = "Info"; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsPinned { get; set; } = false;
    }
}
