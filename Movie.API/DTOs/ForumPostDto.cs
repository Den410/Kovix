namespace Movie.API.DTOs
{
    public class ForumPostDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorAvatarUrl { get; set; }
        public string? AuthorRole { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
