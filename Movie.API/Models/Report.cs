using System.ComponentModel.DataAnnotations.Schema;
using Movie.API.Models;

namespace Movie.API.Models
{
    public class Report
    {
        public int Id { get; set; }

        public int SenderId { get; set; }
        [ForeignKey("SenderId")]
        public User? Sender { get; set; }

        public int ReportedUserId { get; set; }
        [ForeignKey("ReportedUserId")]
        public User? ReportedUser { get; set; }

        public string? Reason { get; set; }

        public int? MessageId { get; set; }
        [ForeignKey("MessageId")]
        public Message? Message { get; set; }
        public string? MessageSnapshot { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsResolved { get; set; } = false;
    }
}