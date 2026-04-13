# Етап 1: Збірка (Build)
# Беремо повний SDK для компіляції коду
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Спочатку копіюємо тільки файл проєкту і відновлюємо залежності (це прискорює збірку завдяки кешу)
COPY ["Movie.API.csproj", "./"]
RUN dotnet restore "Movie.API.csproj"

# Тепер копіюємо всі інші файли (Controllers, Models, Hubs тощо)
COPY . .
WORKDIR "/src/."
# Компілюємо проєкт у режимі Release
RUN dotnet build "Movie.API.csproj" -c Release -o /app/build

# Етап 2: Публікація (Publish)
FROM build AS publish
RUN dotnet publish "Movie.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Етап 3: Запуск (Run)
# Беремо легкий образ, який має тільки середовище виконання (без інструментів компіляції)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

# Копіюємо готовий скомпільований результат з попереднього етапу
COPY --from=publish /app/publish .

# Копіюємо wwwroot папку з завантаженими файлами
COPY wwwroot/ /app/wwwroot/

# Вказуємо команду, яка запустить ваш API
ENTRYPOINT ["dotnet", "Movie.API.dll"]