using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace Movie.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var fromAddress = new MailAddress(_emailSettings.Mail, _emailSettings.DisplayName);
            var toAddress = new MailAddress(to);

            var smtp = new SmtpClient
            {
                Host = _emailSettings.Host,
                Port = _emailSettings.Port,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailSettings.Mail, _emailSettings.Password)
            };

            using (var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = true 
            })
            {
                await smtp.SendMailAsync(message);
            }
        }
    }
}
