using Microsoft.EntityFrameworkCore;
using RealTimePollingApp.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Session kullanýmý için gerekli servisleri ekliyoruz
builder.Services.AddDistributedMemoryCache(); // Session için bellek tabanlý cache
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true; // Güvenlik için sadece Http protokolü üzerinden eriþim saðlanýr
    options.Cookie.IsEssential = true; // Çerez zorunlu hale gelir
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Oturum süresi
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddDbContext<PollDbContext>(options =>
    options.UseSqlite("Data Source=polls.db"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAllOrigins");

app.UseSession(); // Session middleware'ini ekliyoruz

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseRouting(); // UseRouting burada çaðrýlýyor

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapFallbackToFile("/login.html"); // Varsayýlan sayfa login.html olacak
});

app.MapHub<PollHub>("/pollHub");

app.Run();
