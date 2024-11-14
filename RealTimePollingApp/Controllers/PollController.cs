using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealTimePollingApp.Data;
using RealTimePollingApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class PollController : ControllerBase
{
    private readonly PollDbContext _context;
    private readonly IHubContext<PollHub> _pollHubContext;

    public PollController(PollDbContext context, IHubContext<PollHub> pollHubContext)
    {
        _context = context;
        _pollHubContext = pollHubContext;
    }

    // 1. tüm anketleri listeleme
    // Tüm anketleri listeleme metodu
    [HttpGet]
    public async Task<IActionResult> GetPolls()
    {
        var polls = await _context.Polls.ToListAsync();
        return Ok(polls);
    }


    // 1. Tek bir anketi almak
    [HttpGet("{pollId}")]
    public async Task<IActionResult> GetPoll(int pollId)
    {
        var poll = await _context.Polls.FindAsync(pollId);
        if (poll == null)
        {
            return NotFound();
        }

        return Ok(poll);
    }


    // 2. Yeni anket oluşturma
    [HttpPost]
    public async Task<IActionResult> CreatePoll([FromBody] Poll poll)
    {
        _context.Polls.Add(poll);
        await _context.SaveChangesAsync();
        return Ok(poll);
    }

    // 3. Belirli bir ankete oy verme ve sonuçları yayma
    [HttpPost("{pollId}/vote")]
    public async Task<IActionResult> Vote(int pollId, [FromBody] string selectedOption)
    {
        var poll = await _context.Polls.FindAsync(pollId);
        if (poll == null || !poll.Options.Contains(selectedOption))
        {
            return BadRequest("Invalid poll or option.");
        }

        // Yeni bir oy oluştur ve veritabanına ekle
        var vote = new Vote { PollId = pollId, SelectedOption = selectedOption };
        _context.Votes.Add(vote);
        await _context.SaveChangesAsync();

        // Güncel oy sonuçlarını hesapla
        var results = _context.Votes
            .Where(v => v.PollId == pollId)
            .GroupBy(v => v.SelectedOption)
            .Select(g => new
            {
                Option = g.Key,
                Count = g.Count()
            })
            .ToList();

        // SignalR ile sonuçları tüm bağlı istemcilere gönder
        await _pollHubContext.Clients.All.SendAsync("ReceiveResults", pollId, results);

        return Ok(); 
    }

    // 4. Belirli bir anketin sonuçlarını alma
    [HttpGet("{pollId}/results")]
    public async Task<IActionResult> GetResults(int pollId)
    {
        var poll = await _context.Polls.FindAsync(pollId);
        if (poll == null)
        {
            return NotFound();
        }

        // Seçeneklere göre oyları gruplandırarak sonuçları oluştur
        var results = _context.Votes
            .Where(v => v.PollId == pollId)
            .GroupBy(v => v.SelectedOption)
            .Select(g => new
            {
                Option = g.Key,
                Count = g.Count()
            });

        return Ok(await results.ToListAsync());
    }

}
