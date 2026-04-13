using Bogus;
using Movie.API.Models;

namespace Movie.API.Data
{
    public static class DataSeeder
    {
        public static void SeedNews(ApplicationDbContext context)
        {
            if (context.News.Any()) return;

            var titles = new[] { "Масштабне оновлення дизайну", "Технічні роботи на сервері", "Нові фільми вже в каталозі!", "Зміни в правилах сайту", "Помилку зі світлинами виправлено", "Оновлення бази акторів", "Заплановане перезавантаження" };
            var contents = new[] {
                "Шановні користувачі! Завтра з 23:00 до 01:00 на сайті будуть проводитись технічні роботи. Деякі функції можуть бути недоступні. Дякуємо за розуміння!",
                "Ми раді повідомити, що сьогодні додали понад 50 нових фільмів та аніме в наш каталог. Заходьте та оцінюйте новинки!",
                "Було виправлено критичну помилку, через яку деякі користувачі не могли завантажити фотографії у свій профіль. Тепер усе працює швидко та стабільно.",
                "Зверніть увагу на оновлення в правилах написання відгуків. Тепер коментарі зі спойлерами без відповідної позначки будуть видалятися адміністрацією."
            };

            var faker = new Faker<NewsItem>("uk")
                .RuleFor(n => n.Title, f => f.PickRandom(titles))
                .RuleFor(n => n.Content, f => f.PickRandom(contents))
                .RuleFor(n => n.Category, f => f.PickRandom(new[] { "Tech", "Update", "Info", "Important" }))
                .RuleFor(n => n.CreatedAt, f => f.Date.Recent(30))
                .RuleFor(n => n.IsPinned, f => f.Random.Bool(0.15f));

            var fakeNews = faker.Generate(15);
            context.News.AddRange(fakeNews);
            context.SaveChanges();
        }

        public static void SeedAdmin(ApplicationDbContext context)
        {
            if (!context.Users.Any(u => u.Email == "admin@gmail.com"))
            {
                context.Users.Add(new User
                {
                    Username = "admin",
                    Email = "admin@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                });
                context.SaveChanges();
            }
        }
    }
}