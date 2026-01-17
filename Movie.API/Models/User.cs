using System.ComponentModel.DataAnnotations.Schema; 
namespace Movie.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? AvatarUrl { get; set; }
        public string Role { get; set; } = "User";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsOnline { get; set; } = false;
        public DateTime? LastActive { get; set; }

        public ICollection<Review>? Reviews { get; set; }
        public ICollection<Watchlist>? Watchlists { get; set; }

        [InverseProperty("Sender")]
        public ICollection<Report>? ReportsSent { get; set; }

        [InverseProperty("ReportedUser")]
        public ICollection<Report>? ReportsReceived { get; set; }

        public ICollection<Notification>? Notifications { get; set; }
    }
}