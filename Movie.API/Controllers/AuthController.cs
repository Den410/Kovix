using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;
using Movie.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Користувач з таким Email вже існує.");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            try
            {
                string subject = "Вітаємо у Kovix! 🎬";
                string body = $@"
            <h1>Привіт, {user.Username}!</h1>
            <p>Дякуємо за реєстрацію у нашому кіно-додатку.</p>
            <p>Тепер ви можете створювати списки, ставити оцінки та додавати друзів.</p>
            <br>
            <p>З повагою,<br>Команда Kovix</p>";

                await _emailService.SendEmailAsync(user.Email, subject, body);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Не вдалося відправити email: {ex.Message}");
            }

            return Ok(new { message = "Реєстрація успішна!" });
        }


        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest("Користувача не знайдено.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Невірний пароль.");
            }

            string token = CreateToken(user);

            return Ok(new { token, role = user.Role, username = user.Username });
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("Jwt:Key").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                issuer: _configuration.GetSection("Jwt:Issuer").Value,
                audience: _configuration.GetSection("Jwt:Audience").Value,
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<User>> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users
                .Include(u => u.Reviews!)
                    .ThenInclude(r => r.Movie)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            user.PasswordHash = "";

            return Ok(user);
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<ActionResult<User>> UpdateProfile([FromForm] UserUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Username))
            {
                user.Username = dto.Username;
            }

            if (dto.DeleteAvatar)
            {
                user.AvatarUrl = null;
            }

            if (dto.Avatar != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Avatar.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Avatar.CopyToAsync(stream);
                }

                user.AvatarUrl = $"/uploads/{uniqueFileName}";
            }

            await _context.SaveChangesAsync();

            var fullUser = await _context.Users
                .Include(u => u.Reviews)
                    .ThenInclude(r => r.Movie)
                .FirstOrDefaultAsync(u => u.Id == userId);

            fullUser!.PasswordHash = "";
            return Ok(fullUser);
        }


        [HttpPut("settings")]
        [Authorize]
        public async Task<IActionResult> UpdateSettings([FromBody] UserContentSettingsDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.BlockedGenres = string.Join(",", dto.BlockedGenres).ToLower();

            await _context.SaveChangesAsync();
            return Ok();
        }
        [HttpPost("external-login")]
        public async Task<IActionResult> ExternalLogin([FromBody] ExternalAuthDto dto)
        {
            if (dto.Provider != "Google")
                return BadRequest("Provider not supported");

            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string>
            {
                "411859879387-fltqoda92rij49g7jnols8kgv6cs0gt8.apps.googleusercontent.com"
            }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);

                var user = await _context.Users.FirstOrDefaultAsync(u =>
                    u.ExternalProvider == "Google" &&
                    u.ExternalId == payload.Subject
                );

                if (user == null && !string.IsNullOrEmpty(payload.Email))
                {
                    user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

                    if (user != null)
                    {
                        user.ExternalProvider = "Google";
                        user.ExternalId = payload.Subject;
                        await _context.SaveChangesAsync();
                    }
                }

                if (user == null)
                {
                    user = new User
                    {
                        Username = payload.Name ?? payload.Email,
                        Email = payload.Email,
                        PasswordHash = "",
                        Role = "User",
                        ExternalProvider = "Google",
                        ExternalId = payload.Subject,
                        AvatarUrl = payload.Picture,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                var token = CreateToken(user);

                return Ok(new
                {
                    token,
                    role = user.Role,
                    username = user.Username,
                    avatarUrl = user.AvatarUrl
                });
            }
            catch (Exception ex)
            {
                return BadRequest("Invalid Google token: " + ex.Message);
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized("Користувача не знайдено");

            if (!BCrypt.Net.BCrypt.Verify(model.CurrentPassword, user.PasswordHash))
            {
                return BadRequest("Поточний пароль невірний");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Пароль успішно змінено!" });
        }

    }
}