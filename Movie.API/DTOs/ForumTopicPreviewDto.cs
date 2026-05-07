namespace Movie.API.DTOs
{
    public class ForumTopicPreviewDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int RepliesCount { get; set; }
        public int ViewsCount { get; set; }
        public bool IsPinned { get; set; }
        public bool IsClosed { get; set; }
    }
}
