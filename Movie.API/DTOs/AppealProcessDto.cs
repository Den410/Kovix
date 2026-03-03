using Movie.API.Models.Enums;

namespace Movie.API.DTOs
{
    public class AppealProcessDto
    {
        public AppealStatus Status { get; set; }
        public string? AdminComment { get; set; }
    }
}
