using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealTimePollingApp.Data;
using RealTimePollingApp.Models;

namespace RealTimePollingApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly PollDbContext _context;

        public UserController(PollDbContext context)
        {
            _context = context;
        }

        // Kullanıcı Girişi
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginRequest request)
        {
            if (!string.IsNullOrEmpty(request.UserName))
            {
                // Kullanıcı adını Session'da saklıyoruz
                HttpContext.Session.SetString("username", request.UserName);

                // Giriş başarılıysa JSON yanıt döndürüyoruz
                return Ok(new { message = "Giriş başarılı", redirectUrl = "/index.html" });
            }

            return BadRequest(new { message = "Geçersiz kullanıcı adı" });
        }

        // Kullanıcının oturumunu sonlandıran işlem
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Kullanıcının session bilgilerini temizliyoruz
            HttpContext.Session.Clear();
            return Ok(new { message = "Çıkış yapıldı", redirectUrl = "/login.html" });
        }

        [HttpGet("get-username")]
        public IActionResult GetUserName()
        {
            var userName = HttpContext.Session.GetString("username");
            if (string.IsNullOrEmpty(userName))
            {
                return NotFound("User not logged in.");
            }
            return Ok(new { UserName = userName });
        }
    }
}
