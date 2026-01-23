namespace Movie.API.DTOs
{
    public class UserContentSettingsDto
    {
        public List<string> BlockedGenres { get; set; } = new List<string>();
    }
}
