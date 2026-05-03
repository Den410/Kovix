using System.Text.Json.Serialization;

namespace Movie.API.DTOs
{
    public class UpdateTitleDto
    {
        [JsonPropertyName("awardId")]
        public int? AwardId { get; set; }
    }
}
