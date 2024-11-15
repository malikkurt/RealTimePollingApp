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

// Session kullan�m� i�in gerekli servisleri ekliyoruz
builder.Services.AddDistributedMemoryCache(); // Session i�in bellek tabanl� cache
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true; // G�venlik i�in sadece Http protokol� �zerinden eri�im sa�lan�r
    options.Cookie.IsEssential = true; // �erez zorunlu hale gelir
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Oturum s�resi
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

app.UseRouting(); // UseRouting burada �a�r�l�yor

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapFallbackToFile("/login.html"); // Varsay�lan sayfa login.html olacak
});

app.MapHub<PollHub>("/pollHub");

app.Run();
