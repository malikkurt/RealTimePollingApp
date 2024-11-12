using Microsoft.AspNetCore.Mvc;

namespace RealTimePollingApp.Controllers
{
    public class PollController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
